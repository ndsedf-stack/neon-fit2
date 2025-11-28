/**
 * NEON FIT - Common Application Utilities
 * Shared functions used across multiple pages
 */

// ========================================
// CONSTANTS
// ========================================

const CONSTANTS = {
  // XP System
  XP_PER_SET: 50,
  XP_PER_WORKOUT: 500,
  XP_LEVELS: [0, 1000, 2500, 5000, 10000],
  RANKS: ["Recrue", "Soldat", "Vétéran", "Élite", "Légende"],
  
  // Timing
  XP_FLASH_DURATION: 800,
  MODAL_TRANSITION: 300,
  
  // Workout Structure
  WEEKS_PER_BLOCK: 5,
  TOTAL_WEEKS: 26,
  
  // Limits
  MAX_WEIGHT: 500,
  MIN_WEIGHT: 0,
  MAX_REPS: 50,
  MIN_REPS: 1,
  
  // Motivational Quotes
  QUOTES: [
    "La douleur est temporaire. L'abandon est définitif.",
    "Le seul mauvais entraînement est celui que tu n'as pas fait.",
    "Ton corps peut tout supporter. C'est ta tête qu'il faut convaincre.",
    "Ne rêve pas de réussite. Entraîne-toi pour l'obtenir.",
    "La discipline est le pont entre les objectifs et l'accomplissement."
  ]
};

// ========================================
// MODAL MANAGEMENT
// ========================================

const Modal = {
  /**
   * Open modal with content
   * @param {string} title - Modal title
   * @param {string} subtitle - Modal subtitle
   * @param {Array} items - Array of items to display
   * @param {Function} onStart - Callback when start button clicked
   */
  open: (title, subtitle, items, onStart) => {
    const modal = document.getElementById('details-modal');
    if (!modal) return;
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-subtitle').textContent = subtitle;
    
    const list = document.getElementById('modal-body');
    list.innerHTML = '';
    
    items.forEach((item, idx) => {
      const element = document.createElement('div');
      element.className = 'flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5';
      element.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">${idx + 1}</div>
          <div>
            <div class="text-sm font-bold text-white">${item.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">${item.sets}x${item.reps} • ${item.weight}kg</div>
          </div>
        </div>
      `;
      list.appendChild(element);
    });
    
    document.getElementById('modal-start-btn').onclick = onStart;
    modal.classList.add('open');
  },
  
  /**
   * Close modal
   */
  close: () => {
    const modal = document.getElementById('details-modal');
    if (modal) {
      modal.classList.remove('open');
    }
  }
};

// Make closeModal available globally for onclick handlers
window.closeModal = Modal.close;

// ========================================
// GAMIFICATION SYSTEM
// ========================================

const Gamification = {
  /**
   * Get current XP from localStorage
   * @returns {number}
   */
  getXP: () => {
    return parseInt(localStorage.getItem('hybrid_xp') || '0');
  },
  
  /**
   * Add XP and save to localStorage
   * @param {number} amount
   * @returns {number} New XP total
   */
  addXP: (amount) => {
    const current = Gamification.getXP();
    const newXP = current + amount;
    localStorage.setItem('hybrid_xp', newXP);
    return newXP;
  },
  
  /**
   * Calculate level and next level XP based on current XP
   * @returns {Object} { level, nextXP, progress, rank }
   */
  getLevelInfo: () => {
    const xp = Gamification.getXP();
    let level = 1;
    let nextXp = CONSTANTS.XP_LEVELS[1];
    
    for (let i = 0; i < CONSTANTS.XP_LEVELS.length; i++) {
      if (xp >= CONSTANTS.XP_LEVELS[i]) {
        level = i + 1;
        nextXp = CONSTANTS.XP_LEVELS[i + 1] || 99999;
      }
    }
    
    const rank = CONSTANTS.RANKS[Math.min(level - 1, CONSTANTS.RANKS.length - 1)];
    const progress = Math.min(100, (xp / nextXp) * 100);
    
    return { level, nextXp, progress, rank, xp };
  },
  
  /**
   * Update gamification UI elements
   */
  updateUI: () => {
    const info = Gamification.getLevelInfo();
    
    const elements = {
      userRank: document.getElementById('user-rank'),
      levelDisplay: document.getElementById('level-display'),
      xpDisplay: document.getElementById('xp-display'),
      xpBar: document.getElementById('xp-bar')
    };
    
    if (elements.userRank) {
      elements.userRank.textContent = `${info.rank} IV`;
    }
    
    if (elements.levelDisplay) {
      elements.levelDisplay.textContent = info.level;
    }
    
    if (elements.xpDisplay) {
      elements.xpDisplay.textContent = `${info.xp} / ${info.nextXp} XP`;
    }
    
    if (elements.xpBar) {
      elements.xpBar.style.width = `${info.progress}%`;
    }
  },
  
  /**
   * Get random motivational quote
   * @returns {string}
   */
  getRandomQuote: () => {
    return CONSTANTS.QUOTES[Math.floor(Math.random() * CONSTANTS.QUOTES.length)];
  }
};

// ========================================
// UTILITIES
// ========================================

const Utils = {
  /**
   * Format number with leading zeros
   * @param {number} num
   * @param {number} length
   * @returns {string}
   */
  padZero: (num, length = 2) => {
    return String(num).padStart(length, '0');
  },
  
  /**
   * Format seconds to MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  formatTime: (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${Utils.padZero(m)}:${Utils.padZero(s)}`;
  },
  
  /**
   * Clamp number between min and max
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp: (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  },
  
  /**
   * Trigger haptic feedback (if available)
   * @param {number|Array} pattern
   */
  vibrate: (pattern = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },
  
  /**
   * Get current week from localStorage
   * @returns {number}
   */
  getCurrentWeek: () => {
    return parseInt(localStorage.getItem('hybrid_current_week') || '1');
  },
  
  /**
   * Set current week in localStorage
   * @param {number} week
   */
  setCurrentWeek: (week) => {
    localStorage.setItem('hybrid_current_week', week);
  },
  
  /**
   * Safe parse JSON with fallback
   * @param {string} json
   * @param {*} fallback
   * @returns {*}
   */
  safeParseJSON: (json, fallback = null) => {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error('JSON parse error:', error);
      return fallback;
    }
  },
  
  /**
   * Generate unique ID
   * @returns {string}
   */
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// ========================================
// INPUT VALIDATION
// ========================================

const Inputs = {
  /**
   * Modify weight input with validation
   * @param {number} delta
   * @param {string} elementId
   */
  modifyWeight: (delta, elementId = 'in-weight') => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    let value = parseFloat(el.textContent) + delta;
    value = Utils.clamp(value, CONSTANTS.MIN_WEIGHT, CONSTANTS.MAX_WEIGHT);
    
    // Format: remove decimals if whole number
    el.textContent = value % 1 === 0 ? value : value.toFixed(1);
  },
  
  /**
   * Modify reps input with validation
   * @param {number} delta
   * @param {string} elementId
   */
  modifyReps: (delta, elementId = 'in-reps') => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    let value = parseInt(el.textContent) + delta;
    value = Utils.clamp(value, CONSTANTS.MIN_REPS, CONSTANTS.MAX_REPS);
    
    el.textContent = value;
  }
};

// ========================================
// ERROR HANDLING
// ========================================

const ErrorHandler = {
  /**
   * Log error and optionally show to user
   * @param {Error} error
   * @param {string} context
   * @param {boolean} showAlert
   */
  handle: (error, context = 'Unknown', showAlert = false) => {
    console.error(`[${context}]`, error);
    
    if (showAlert) {
      alert(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    }
  },
  
  /**
   * Wrap function with error handling
   * @param {Function} fn
   * @param {string} context
   * @returns {Function}
   */
  wrap: (fn, context) => {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        ErrorHandler.handle(error, context, true);
      }
    };
  }
};

// ========================================
// INITIALIZE LUCIDE ICONS
// ========================================

const initIcons = () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};

// Expose globalement pour compatibilité sans modules
window.Gamification = Gamification;
window.Utils = Utils;
window.Modal = Modal;
window.Inputs = Inputs;
window.ErrorHandler = ErrorHandler;
window.initIcons = initIcons;
window.CONSTANTS = CONSTANTS;
