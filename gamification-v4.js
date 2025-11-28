// ====================================================================
// NEON FIT V4.0 - GAMIFICATION SYSTEM
// "Cockpit de Guerre" - Military Ranks, Badges, XP
// ====================================================================

const GamificationV4 = (function() {
  'use strict';

  // ========== CONFIGURATION ==========
  
  // Military Ranks
  const RANKS = [
    { id: 'recrue', name: 'RECRUE', minLevel: 1, maxLevel: 5, color: '#f59e0b', tier: 'bronze' },
    { id: 'operateur', name: 'OPÉRATEUR', minLevel: 6, maxLevel: 10, color: '#ffffff', tier: 'argent' },
    { id: 'specialiste', name: 'SPÉCIALISTE', minLevel: 11, maxLevel: 20, color: '#f59e0b', tier: 'or' },
    { id: 'commando', name: 'COMMANDO', minLevel: 21, maxLevel: 35, color: '#c084fc', tier: 'platine' },
    { id: 'elite', name: 'ÉLITE', minLevel: 36, maxLevel: 50, color: '#22d3ee', tier: 'diamant' },
    { id: 'legende', name: 'LÉGENDE', minLevel: 51, maxLevel: 75, color: '#22d3ee', tier: 'holographique' },
    { id: 'titan', name: 'TITAN', minLevel: 76, maxLevel: 100, color: '#c084fc', tier: 'plasma' }
  ];

  // XP Configuration
  const XP_CONFIG = {
    setCompleted: 50,
    tempoPerfect: 20,
    workoutCompleted: 200,
    prBroken: 100,
    streakBonus7: 500,
    streakBonus14: 750,
    streakBonus21: 1000,
    streakBonus30: 2000,
    challengeBase: 300,
    xpPerLevel: 1000
  };

  // Badges
  const BADGES = [
    // Streaks
    { id: 'iron_mind', name: 'Iron Mind', description: '30 jours streak', icon: '🧠', requirement: { type: 'streak', value: 30 } },
    { id: 'unstoppable', name: 'Unstoppable', description: '60 jours streak', icon: '⚡', requirement: { type: 'streak', value: 60 } },
    { id: 'immortal', name: 'Immortal', description: '100 jours streak', icon: '♾️', requirement: { type: 'streak', value: 100 } },
    
    // Volume
    { id: 'volume_rookie', name: 'Volume Rookie', description: '10,000 kg soulevés', icon: '🏋️', requirement: { type: 'volume', value: 10000 } },
    { id: 'volume_warrior', name: 'Volume Warrior', description: '50,000 kg soulevés', icon: '💪', requirement: { type: 'volume', value: 50000 } },
    { id: 'volume_king', name: 'Volume King', description: '100,000 kg soulevés', icon: '👑', requirement: { type: 'volume', value: 100000 } },
    { id: 'volume_titan', name: 'Volume Titan', description: '500,000 kg soulevés', icon: '🔱', requirement: { type: 'volume', value: 500000 } },
    
    // PRs
    { id: 'pr_hunter', name: 'PR Hunter', description: '10 records personnels', icon: '🎯', requirement: { type: 'prs', value: 10 } },
    { id: 'pr_machine', name: 'PR Machine', description: '50 records personnels', icon: '🏆', requirement: { type: 'prs', value: 50 } },
    { id: 'pr_legend', name: 'PR Legend', description: '100 records personnels', icon: '⭐', requirement: { type: 'prs', value: 100 } },
    
    // Tempo
    { id: 'tempo_student', name: 'Tempo Student', description: '50 reps tempo parfait', icon: '🎵', requirement: { type: 'perfectTempo', value: 50 } },
    { id: 'tempo_master', name: 'Tempo Master', description: '200 reps tempo parfait', icon: '🎼', requirement: { type: 'perfectTempo', value: 200 } },
    { id: 'tempo_guru', name: 'Tempo Guru', description: '500 reps tempo parfait', icon: '🎹', requirement: { type: 'perfectTempo', value: 500 } },
    
    // Early Bird
    { id: 'early_bird', name: 'Early Bird', description: '10 workouts avant 7h', icon: '🌅', requirement: { type: 'earlyWorkouts', value: 10 } },
    { id: 'dawn_warrior', name: 'Dawn Warrior', description: '30 workouts avant 7h', icon: '☀️', requirement: { type: 'earlyWorkouts', value: 30 } },
    
    // Night Owl
    { id: 'night_owl', name: 'Night Owl', description: '10 workouts après 21h', icon: '🦉', requirement: { type: 'lateWorkouts', value: 10 } },
    
    // Intensity
    { id: 'intensity_addict', name: 'Intensity Addict', description: '20 techniques d\'intensification', icon: '🔥', requirement: { type: 'intensityTechniques', value: 20 } },
    
    // Completion
    { id: 'perfectionist', name: 'Perfectionist', description: '10 workouts 100% complétés', icon: '✓', requirement: { type: 'perfectWorkouts', value: 10 } },
    
    // Special
    { id: 'first_blood', name: 'First Blood', description: 'Premier workout complété', icon: '🩸', requirement: { type: 'workouts', value: 1 } },
    { id: 'centurion', name: 'Centurion', description: '100 workouts complétés', icon: '🏛️', requirement: { type: 'workouts', value: 100 } }
  ];

  // ========== STORAGE KEYS ==========
  const STORAGE_KEYS = {
    xp: 'neon_fit_v4_xp',
    streak: 'neon_fit_v4_streak',
    lastWorkout: 'neon_fit_v4_last_workout',
    badges: 'neon_fit_v4_badges',
    stats: 'neon_fit_v4_stats'
  };

  // ========== HELPER FUNCTIONS ==========
  
  function getStoredValue(key, defaultValue = 0) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  function setStoredValue(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // ========== XP FUNCTIONS ==========
  
  function getXP() {
    return getStoredValue(STORAGE_KEYS.xp, 0);
  }

  function addXP(amount, reason = '') {
    const currentXP = getXP();
    const newXP = currentXP + amount;
    setStoredValue(STORAGE_KEYS.xp, newXP);
    
    // Check for level up
    const oldLevel = Math.floor(currentXP / XP_CONFIG.xpPerLevel) + 1;
    const newLevel = Math.floor(newXP / XP_CONFIG.xpPerLevel) + 1;
    
    if (newLevel > oldLevel) {
      return { xp: newXP, levelUp: true, oldLevel, newLevel };
    }
    
    return { xp: newXP, levelUp: false };
  }

  function getLevel() {
    const xp = getXP();
    return Math.floor(xp / XP_CONFIG.xpPerLevel) + 1;
  }

  function getLevelProgress() {
    const xp = getXP();
    const currentLevelXP = xp % XP_CONFIG.xpPerLevel;
    return {
      current: currentLevelXP,
      required: XP_CONFIG.xpPerLevel,
      percentage: Math.round((currentLevelXP / XP_CONFIG.xpPerLevel) * 100)
    };
  }

  // ========== RANK FUNCTIONS ==========
  
  function getRank(level = null) {
    const currentLevel = level || getLevel();
    return RANKS.find(r => currentLevel >= r.minLevel && currentLevel <= r.maxLevel) || RANKS[0];
  }

  function getNextRank() {
    const currentRank = getRank();
    const currentIndex = RANKS.findIndex(r => r.id === currentRank.id);
    return currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;
  }

  // ========== STREAK FUNCTIONS ==========
  
  function getStreak() {
    return getStoredValue(STORAGE_KEYS.streak, 0);
  }

  function updateStreak() {
    const lastWorkout = getStoredValue(STORAGE_KEYS.lastWorkout, null);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let streak = getStreak();
    
    if (lastWorkout === today) {
      return { streak, bonus: 0, message: 'Déjà entraîné aujourd\'hui' };
    }
    
    if (lastWorkout === yesterday) {
      streak++;
    } else if (lastWorkout !== today) {
      streak = 1;
    }
    
    setStoredValue(STORAGE_KEYS.streak, streak);
    setStoredValue(STORAGE_KEYS.lastWorkout, today);
    
    // Calculate streak bonus
    let bonus = 0;
    let message = '';
    
    if (streak === 7) {
      bonus = XP_CONFIG.streakBonus7;
      message = '🔥 7 jours streak!';
    } else if (streak === 14) {
      bonus = XP_CONFIG.streakBonus14;
      message = '🔥🔥 14 jours streak!';
    } else if (streak === 21) {
      bonus = XP_CONFIG.streakBonus21;
      message = '🔥🔥🔥 21 jours streak!';
    } else if (streak === 30) {
      bonus = XP_CONFIG.streakBonus30;
      message = '🔥🔥🔥🔥 30 JOURS STREAK!';
    }
    
    if (bonus > 0) {
      addXP(bonus, 'streak_bonus');
    }
    
    return { streak, bonus, message };
  }

  // ========== BADGE FUNCTIONS ==========
  
  function getUnlockedBadges() {
    return getStoredValue(STORAGE_KEYS.badges, []);
  }

  function checkAndUnlockBadges(stats) {
    const unlockedBadges = getUnlockedBadges();
    const newBadges = [];
    
    BADGES.forEach(badge => {
      if (unlockedBadges.includes(badge.id)) return;
      
      const req = badge.requirement;
      let unlocked = false;
      
      switch (req.type) {
        case 'streak':
          unlocked = stats.streak >= req.value;
          break;
        case 'volume':
          unlocked = stats.totalVolume >= req.value;
          break;
        case 'prs':
          unlocked = stats.prCount >= req.value;
          break;
        case 'perfectTempo':
          unlocked = stats.perfectTempoReps >= req.value;
          break;
        case 'workouts':
          unlocked = stats.workoutCount >= req.value;
          break;
        case 'earlyWorkouts':
          unlocked = stats.earlyWorkouts >= req.value;
          break;
        case 'lateWorkouts':
          unlocked = stats.lateWorkouts >= req.value;
          break;
        case 'intensityTechniques':
          unlocked = stats.intensityTechniques >= req.value;
          break;
        case 'perfectWorkouts':
          unlocked = stats.perfectWorkouts >= req.value;
          break;
      }
      
      if (unlocked) {
        newBadges.push(badge);
        unlockedBadges.push(badge.id);
      }
    });
    
    if (newBadges.length > 0) {
      setStoredValue(STORAGE_KEYS.badges, unlockedBadges);
    }
    
    return newBadges;
  }

  function getAllBadges() {
    const unlocked = getUnlockedBadges();
    return BADGES.map(badge => ({
      ...badge,
      unlocked: unlocked.includes(badge.id)
    }));
  }

  // ========== STATS FUNCTIONS ==========
  
  function getStats() {
    return getStoredValue(STORAGE_KEYS.stats, {
      totalVolume: 0,
      workoutCount: 0,
      prCount: 0,
      perfectTempoReps: 0,
      earlyWorkouts: 0,
      lateWorkouts: 0,
      intensityTechniques: 0,
      perfectWorkouts: 0,
      streak: 0
    });
  }

  function updateStats(updates) {
    const currentStats = getStats();
    const newStats = { ...currentStats };
    
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'number') {
        newStats[key] = (newStats[key] || 0) + updates[key];
      }
    });
    
    newStats.streak = getStreak();
    
    setStoredValue(STORAGE_KEYS.stats, newStats);
    
    // Check for new badges
    const newBadges = checkAndUnlockBadges(newStats);
    
    return { stats: newStats, newBadges };
  }

  // ========== UI HELPERS ==========
  
  function createXPToast(amount, container = document.body) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/90 backdrop-blur-xl border border-cyan/40 animate-xp-toast" style="box-shadow: 0 0 40px rgba(34,211,238,0.4);">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-magenta flex items-center justify-center">
          <span class="text-2xl">⚡</span>
        </div>
        <div>
          <div class="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta" style="-webkit-background-clip: text;">+${amount} XP</div>
          <div class="text-xs font-bold text-white/50 uppercase tracking-widest">Série validée</div>
        </div>
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2500);
  }

  function createBadgeToast(badge, container = document.body) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50';
    toast.innerHTML = `
      <div class="flex flex-col items-center gap-4 p-8 rounded-3xl bg-black/95 backdrop-blur-xl border border-amber/40 animate-scale-pop" style="box-shadow: 0 0 60px rgba(249,115,22,0.4);">
        <div class="text-6xl">${badge.icon}</div>
        <div class="font-display font-bold text-2xl text-amber">${badge.name}</div>
        <div class="text-sm text-white/60">${badge.description}</div>
        <div class="text-xs text-white/40 uppercase tracking-widest">Badge débloqué!</div>
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4000);
  }

  function createLevelUpToast(newLevel, newRank, container = document.body) {
    const toast = document.createElement('div');
    toast.className = 'fixed inset-0 z-50 flex items-center justify-center';
    toast.innerHTML = `
      <div class="absolute inset-0 bg-black/80 animate-flash"></div>
      <div class="relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-cyan/20 to-magenta/20 border border-cyan/40 animate-scale-pop" style="box-shadow: 0 0 80px rgba(34,211,238,0.5);">
        <div class="text-6xl">🎖️</div>
        <div class="font-display font-bold text-3xl text-white">NIVEAU ${newLevel}</div>
        <div class="font-display text-xl" style="color: ${newRank.color}">${newRank.name}</div>
        <div class="text-sm text-white/60">Nouveau rang atteint!</div>
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4000);
  }

  // ========== PUBLIC API ==========
  
  return {
    // Constants
    RANKS,
    BADGES,
    XP_CONFIG,
    
    // XP
    getXP,
    addXP,
    getLevel,
    getLevelProgress,
    
    // Ranks
    getRank,
    getNextRank,
    
    // Streaks
    getStreak,
    updateStreak,
    
    // Badges
    getUnlockedBadges,
    checkAndUnlockBadges,
    getAllBadges,
    
    // Stats
    getStats,
    updateStats,
    
    // UI
    createXPToast,
    createBadgeToast,
    createLevelUpToast
  };
  
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamificationV4;
}

// Global access
window.GamificationV4 = GamificationV4;
