const { Issuer, Strategy } = require('openid-client');
const passport = require('passport');
const session = require('express-session');
const memoize = require('memoizee');
const connectPg = require('connect-pg-simple');
const { upsertUser } = require('./db');

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL || 'https://replit.com/oidc';
    const issuer = await Issuer.discover(issuerUrl);
    console.log('Discovered issuer:', issuer.issuer);
    return issuer;
  },
  { maxAge: 3600 * 1000 }
);

function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

async function setupAuth(app) {
  app.set('trust proxy', 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const issuer = await getOidcConfig();
  const registeredClients = new Map();

  const ensureClient = (domain) => {
    if (!registeredClients.has(domain)) {
      const client = new issuer.Client({
        client_id: process.env.REPL_ID,
        redirect_uris: [`https://${domain}/api/callback`],
        response_types: ['code'],
      });
      client.CLOCK_TOLERANCE = 60;
      registeredClients.set(domain, client);

      const strategyName = `replitauth:${domain}`;
      passport.use(
        strategyName,
        new Strategy(
          {
            client,
            params: {
              scope: 'openid email profile offline_access',
              prompt: 'login consent',
            },
            passReqToCallback: true,
          },
          async (req, tokenSet, userinfo, done) => {
            try {
              const user = {
                claims: tokenSet.claims(),
                access_token: tokenSet.access_token,
                refresh_token: tokenSet.refresh_token,
                expires_at: tokenSet.claims().exp,
              };

              await upsertUser({
                id: userinfo.sub,
                email: userinfo.email,
                firstName: userinfo.first_name,
                lastName: userinfo.last_name,
                profileImageUrl: userinfo.profile_image_url,
              });

              done(null, user);
            } catch (error) {
              done(error);
            }
          }
        )
      );
    }
    return registeredClients.get(domain);
  };

  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));

  app.get('/api/login', (req, res, next) => {
    ensureClient(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`)(req, res, next);
  });

  app.get('/api/callback', (req, res, next) => {
    ensureClient(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: '/',
      failureRedirect: '/api/login',
    })(req, res, next);
  });

  app.get('/api/logout', async (req, res) => {
    const client = registeredClients.get(req.hostname);
    req.logout(() => {
      if (client) {
        const endSessionUrl = client.endSessionUrl({
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        });
        res.redirect(endSessionUrl);
      } else {
        res.redirect('/');
      }
    });
  });
}

const isAuthenticated = async (req, res, next) => {
  const user = req.user;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const issuer = await getOidcConfig();
    const client = new issuer.Client({
      client_id: process.env.REPL_ID,
    });

    const tokenSet = await client.refresh(refreshToken);
    user.claims = tokenSet.claims();
    user.access_token = tokenSet.access_token;
    user.refresh_token = tokenSet.refresh_token;
    user.expires_at = tokenSet.claims().exp;
    
    return next();
  } catch (error) {
    console.error('Token refresh failed:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { setupAuth, isAuthenticated };
