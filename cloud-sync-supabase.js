/**
 * NEON FIT - Cloud Sync Module (Supabase)
 * Fonctionne sur GitHub Pages, Vercel, et tout hébergement statique
 */

(function() {
  const SYNC_KEYS = [
    'neon_fit_workout_history',
    'hybrid_xp',
    'hybrid_current_week',
    'hybrid_workout_history'
  ];

  const CloudSync = {
    supabase: null,
    user: null,
    isAuthenticated: false,
    syncInProgress: false,
    lastSync: null,
    config: null,

    async init(supabaseUrl, supabaseAnonKey) {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('CloudSync: No Supabase config, running in offline mode');
        return false;
      }

      try {
        const { createClient } = window.supabase;
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
        this.config = { url: supabaseUrl, key: supabaseAnonKey };

        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
          this.user = session.user;
          this.isAuthenticated = true;
          await this.pullFromCloud();
          this.setupAutoSync();
        }

        this.supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            this.user = session.user;
            this.isAuthenticated = true;
            this.pullFromCloud();
            this.setupAutoSync();
            this.renderAuthUI('cloud-sync-ui');
          } else if (event === 'SIGNED_OUT') {
            this.user = null;
            this.isAuthenticated = false;
            this.renderAuthUI('cloud-sync-ui');
          }
        });

        return this.isAuthenticated;
      } catch (error) {
        console.error('CloudSync init failed:', error);
        return false;
      }
    },

    async loginWithEmail(email) {
      if (!this.supabase) return { error: 'Not initialized' };

      const { data, error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname
        }
      });

      return { data, error };
    },

    async loginWithProvider(provider) {
      if (!this.supabase) return { error: 'Not initialized' };

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });

      return { data, error };
    },

    async logout() {
      if (!this.supabase) return;
      await this.supabase.auth.signOut();
      this.user = null;
      this.isAuthenticated = false;
    },

    async pullFromCloud() {
      if (!this.isAuthenticated || !this.supabase) return false;

      try {
        const { data, error } = await this.supabase
          .from('workout_data')
          .select('data_key, data_value')
          .eq('user_id', this.user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          for (const row of data) {
            if (SYNC_KEYS.includes(row.data_key)) {
              const localData = localStorage.getItem(row.data_key);
              const cloudData = JSON.stringify(row.data_value);

              if (!localData || this.shouldUseCloudData(row.data_key, localData, row.data_value)) {
                localStorage.setItem(row.data_key, cloudData);
                console.log(`Pulled ${row.data_key} from cloud`);
              }
            }
          }
          this.lastSync = new Date();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Cloud pull failed:', error);
        return false;
      }
    },

    shouldUseCloudData(key, localDataStr, cloudData) {
      try {
        const localData = JSON.parse(localDataStr);

        if (key === 'neon_fit_workout_history' && Array.isArray(cloudData) && Array.isArray(localData)) {
          return cloudData.length > localData.length;
        }

        if (typeof cloudData === 'number' && typeof localData === 'number') {
          return cloudData > localData;
        }

        return false;
      } catch (e) {
        return true;
      }
    },

    async pushToCloud(key = null) {
      if (!this.isAuthenticated || !this.supabase) return false;
      if (this.syncInProgress) return false;

      this.syncInProgress = true;

      try {
        const keysToSync = key ? [key] : SYNC_KEYS;

        for (const k of keysToSync) {
          const value = localStorage.getItem(k);
          if (value) {
            let parsedValue;
            try {
              parsedValue = JSON.parse(value);
            } catch (e) {
              parsedValue = value;
            }

            const { error } = await this.supabase
              .from('workout_data')
              .upsert({
                user_id: this.user.id,
                data_key: k,
                data_value: parsedValue,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,data_key'
              });

            if (error) throw error;
          }
        }

        this.lastSync = new Date();
        console.log('Data pushed to cloud successfully');
        return true;
      } catch (error) {
        console.error('Cloud push failed:', error);
        return false;
      } finally {
        this.syncInProgress = false;
      }
    },

    async fullSync() {
      await this.pullFromCloud();
      await this.pushToCloud();
    },

    setupAutoSync(intervalMs = 60000) {
      setInterval(async () => {
        if (this.isAuthenticated) {
          await this.pushToCloud();
        }
      }, intervalMs);

      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = (key, value) => {
        originalSetItem(key, value);
        if (SYNC_KEYS.includes(key) && this.isAuthenticated) {
          this.debouncedPush(key);
        }
      };
    },

    _pushTimeout: null,
    debouncedPush(key) {
      if (this._pushTimeout) clearTimeout(this._pushTimeout);
      this._pushTimeout = setTimeout(() => {
        this.pushToCloud(key);
      }, 2000);
    },

    showLoginModal() {
      const existingModal = document.getElementById('cloud-login-modal');
      if (existingModal) existingModal.remove();

      const modal = document.createElement('div');
      modal.id = 'cloud-login-modal';
      modal.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;">
          <div style="background:linear-gradient(165deg,#0f172a 0%,#080c14 100%);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;max-width:380px;width:100%;">
            <h2 style="font-family:'Chakra Petch',sans-serif;font-size:24px;font-weight:700;color:#fff;margin-bottom:8px;text-align:center;">CLOUD SYNC</h2>
            <p style="color:#94a3b8;font-size:13px;text-align:center;margin-bottom:24px;">Synchronise tes données sur tous tes appareils</p>
            
            <div id="login-form">
              <input type="email" id="login-email" placeholder="Ton email" style="width:100%;padding:14px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.4);color:#fff;font-size:14px;margin-bottom:12px;outline:none;">
              <button id="login-email-btn" style="width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#000;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:16px;">
                Recevoir le lien magique
              </button>
              
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div style="flex:1;height:1px;background:rgba(255,255,255,0.1);"></div>
                <span style="color:#64748b;font-size:12px;">ou</span>
                <div style="flex:1;height:1px;background:rgba(255,255,255,0.1);"></div>
              </div>
              
              <button id="login-google-btn" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continuer avec Google
              </button>
              
              <button id="login-github-btn" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Continuer avec GitHub
              </button>
            </div>
            
            <div id="login-message" style="display:none;text-align:center;padding:20px 0;">
              <div style="width:48px;height:48px;border-radius:50%;background:rgba(34,211,238,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <p style="color:#22d3ee;font-weight:600;margin-bottom:8px;">Email envoyé!</p>
              <p style="color:#94a3b8;font-size:13px;">Clique sur le lien magique dans ton email pour te connecter.</p>
            </div>
            
            <button id="close-modal-btn" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#64748b;font-size:13px;cursor:pointer;margin-top:16px;">
              Annuler
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('close-modal-btn').onclick = () => modal.remove();

      document.getElementById('login-email-btn').onclick = async () => {
        const email = document.getElementById('login-email').value;
        if (!email) return;

        const btn = document.getElementById('login-email-btn');
        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;

        const { error } = await this.loginWithEmail(email);
        if (error) {
          btn.textContent = 'Erreur - Réessayer';
          btn.disabled = false;
        } else {
          document.getElementById('login-form').style.display = 'none';
          document.getElementById('login-message').style.display = 'block';
        }
      };

      document.getElementById('login-google-btn').onclick = () => this.loginWithProvider('google');
      document.getElementById('login-github-btn').onclick = () => this.loginWithProvider('github');
    },

    renderAuthUI(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!this.config) {
        container.innerHTML = `
          <span style="font-size:11px;color:#64748b;">Mode hors-ligne</span>
        `;
        return;
      }

      if (this.isAuthenticated && this.user) {
        const initial = (this.user.email || 'U')[0].toUpperCase();
        container.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#22d3ee,#3b82f6);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;font-size:12px;">${initial}</div>
            <span style="font-size:11px;color:#22d3ee;">Synchronisé</span>
            <button onclick="CloudSync.logout().then(()=>CloudSync.renderAuthUI('cloud-sync-ui'))" style="background:transparent;border:1px solid #ef4444;color:#ef4444;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">
              Déco
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <button onclick="CloudSync.showLoginModal()" style="background:linear-gradient(135deg,#22d3ee,#3b82f6);border:none;color:#000;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
            Sync Cloud
          </button>
        `;
      }
    }
  };

  window.CloudSync = CloudSync;

  // Auto-initialize when DOM is ready
  function autoInit() {
    if (window.NEONFIT_CONFIG && window.NEONFIT_CONFIG.SUPABASE_URL) {
      CloudSync.init(
        window.NEONFIT_CONFIG.SUPABASE_URL,
        window.NEONFIT_CONFIG.SUPABASE_ANON_KEY
      ).then(function() {
        CloudSync.renderAuthUI('cloud-sync-ui');
      });
    } else {
      CloudSync.renderAuthUI('cloud-sync-ui');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    setTimeout(autoInit, 100);
  }
})();
