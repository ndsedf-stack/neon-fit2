/**
 * NEON FIT - Cloud Sync Module
 * Handles authentication and data synchronization with the cloud
 */

(function() {
  const SYNC_KEYS = [
    'neon_fit_workout_history',
    'hybrid_xp',
    'hybrid_current_week',
    'hybrid_workout_history'
  ];

  const CloudSync = {
    user: null,
    isAuthenticated: false,
    syncInProgress: false,
    lastSync: null,

    async checkAuth() {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        this.isAuthenticated = data.authenticated;
        this.user = data.user || null;
        return this.isAuthenticated;
      } catch (error) {
        console.error('Auth check failed:', error);
        this.isAuthenticated = false;
        this.user = null;
        return false;
      }
    },

    login() {
      window.location.href = '/api/login';
    },

    logout() {
      window.location.href = '/api/logout';
    },

    async pullFromCloud() {
      if (!this.isAuthenticated) {
        console.log('Not authenticated, skipping cloud pull');
        return false;
      }

      try {
        const response = await fetch('/api/sync/data');
        const result = await response.json();
        
        if (result.success && result.data) {
          for (const [key, value] of Object.entries(result.data)) {
            if (SYNC_KEYS.includes(key)) {
              const localData = localStorage.getItem(key);
              const cloudData = JSON.stringify(value);
              
              if (!localData || this.shouldUseCloudData(key, localData, value)) {
                localStorage.setItem(key, cloudData);
                console.log(`Pulled ${key} from cloud`);
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
      if (!this.isAuthenticated) {
        console.log('Not authenticated, skipping cloud push');
        return false;
      }

      if (this.syncInProgress) {
        console.log('Sync already in progress');
        return false;
      }

      this.syncInProgress = true;

      try {
        const keysToSync = key ? [key] : SYNC_KEYS;
        const data = {};

        for (const k of keysToSync) {
          const value = localStorage.getItem(k);
          if (value) {
            try {
              data[k] = JSON.parse(value);
            } catch (e) {
              data[k] = value;
            }
          }
        }

        const response = await fetch('/api/sync/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        });

        const result = await response.json();
        
        if (result.success) {
          this.lastSync = new Date();
          console.log('Data pushed to cloud successfully');
          return true;
        }
        return false;
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

      window.addEventListener('beforeunload', () => {
        if (this.isAuthenticated) {
          navigator.sendBeacon('/api/sync/bulk', JSON.stringify({
            data: this.getLocalData()
          }));
        }
      });

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

    getLocalData() {
      const data = {};
      for (const key of SYNC_KEYS) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch (e) {
            data[key] = value;
          }
        }
      }
      return data;
    },

    renderAuthUI(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (this.isAuthenticated && this.user) {
        container.innerHTML = `
          <div class="cloud-sync-status" style="display:flex;align-items:center;gap:8px;">
            ${this.user.profileImageUrl ? 
              `<img src="${this.user.profileImageUrl}" alt="Profile" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #22d3ee;">` : 
              `<div style="width:28px;height:28px;border-radius:50%;background:#22d3ee;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;">${(this.user.firstName || this.user.email || 'U')[0].toUpperCase()}</div>`
            }
            <span style="font-size:11px;color:#94a3b8;">${this.user.firstName || this.user.email || 'Connecté'}</span>
            <button onclick="CloudSync.logout()" style="background:transparent;border:1px solid #ef4444;color:#ef4444;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">Déconnexion</button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <button onclick="CloudSync.login()" style="background:linear-gradient(135deg,#22d3ee,#3b82f6);border:none;color:#000;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
            Sync Cloud
          </button>
        `;
      }
    },

    async init() {
      await this.checkAuth();
      if (this.isAuthenticated) {
        await this.pullFromCloud();
        this.setupAutoSync();
      }
      return this.isAuthenticated;
    }
  };

  window.CloudSync = CloudSync;
})();
