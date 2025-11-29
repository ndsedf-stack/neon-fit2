const express = require('express');
const path = require('path');
const { initDatabase, getUser, getUserData, setUserData, getAllUserData } = require('./db');
const { setupAuth, isAuthenticated } = require('./replitAuth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  await initDatabase();
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await getUser(userId);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json({ 
        authenticated: true, 
        user: {
          id: req.user.claims?.sub,
          email: req.user.claims?.email,
          firstName: req.user.claims?.first_name,
          lastName: req.user.claims?.last_name,
          profileImageUrl: req.user.claims?.profile_image_url
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.get('/api/sync/data', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = await getAllUserData(userId);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching sync data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
  });

  app.post('/api/sync/data', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { key, value } = req.body;
      
      if (!key) {
        return res.status(400).json({ success: false, message: 'Missing data key' });
      }

      await setUserData(userId, key, value);
      res.json({ success: true, message: 'Data saved' });
    } catch (error) {
      console.error('Error saving sync data:', error);
      res.status(500).json({ success: false, message: 'Failed to save data' });
    }
  });

  app.post('/api/sync/bulk', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { data } = req.body;
      
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid data format' });
      }

      for (const [key, value] of Object.entries(data)) {
        await setUserData(userId, key, value);
      }
      
      res.json({ success: true, message: 'All data saved' });
    } catch (error) {
      console.error('Error saving bulk data:', error);
      res.status(500).json({ success: false, message: 'Failed to save data' });
    }
  });

  app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  app.use(express.static(path.join(__dirname, '..'), {
    etag: false,
    lastModified: false
  }));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    const filePath = path.join(__dirname, '..', req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
      }
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEON FIT server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
