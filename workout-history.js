/**
 * NEON FIT - Workout History Management
 * Handles logging, retrieving, and analyzing workout data
 */

import { Utils } from './app.js';

// ========================================
// CONSTANTS
// ========================================

const STORAGE_KEY = 'neon_fit_workout_history';
const MAX_HISTORY_ITEMS = 1000; // Prevent localStorage overflow

// ========================================
// WORKOUT HISTORY SYSTEM
// ========================================

export const WorkoutHistory = {
  /**
   * Log a completed set
   * @param {Object} setData
   * @returns {boolean} Success status
   */
  logSet: (setData) => {
    try {
      const entry = {
        id: Utils.generateId(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        week: setData.week,
        day: setData.day,
        exercise: setData.exercise,
        exerciseIndex: setData.exerciseIndex || 0,
        setNumber: setData.setNumber,
        weight: setData.weight,
        reps: setData.reps,
        targetWeight: setData.targetWeight || setData.weight,
        targetReps: setData.targetReps || setData.reps,
        rpe: setData.rpe || null,
        technique: setData.technique || 'STANDARD',
        notes: setData.notes || ''
      };
      
      const history = WorkoutHistory.getAll() || [];
      history.push(entry);
      
      // Limit history size
      if (history.length > MAX_HISTORY_ITEMS) {
        history.shift(); // Remove oldest
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error logging set:', error);
      return false;
    }
  },
  
  /**
   * Get all workout history
   * @returns {Array}
   */
  getAll: () => {
    return Utils.safeParseJSON(localStorage.getItem(STORAGE_KEY), []);
  },
  
  /**
   * Get history for specific week
   * @param {number} week
   * @returns {Array}
   */
  getByWeek: (week) => {
    return (WorkoutHistory.getAll() || []).filter(entry => entry.week === week);
  },
  
  /**
   * Get history for specific day
   * @param {number} week
   * @param {string} day
   * @returns {Array}
   */
  getByDay: (week, day) => {
    return (WorkoutHistory.getAll() || []).filter(
      entry => entry.week === week && entry.day === day
    );
  },
  
  /**
   * Get history for specific exercise
   * @param {string} exerciseName
   * @param {number} limit - Optional limit
   * @returns {Array}
   */
  getByExercise: (exerciseName, limit = null) => {
    let results = (WorkoutHistory.getAll() || []).filter(
      entry => entry.exercise === exerciseName
    );
    
    // Sort by date descending (newest first)
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return limit ? results.slice(0, limit) : results;
  },
  
  /**
   * Get last workout for specific exercise
   * @param {string} exerciseName
   * @returns {Object|null}
   */
  getLastWorkout: (exerciseName) => {
    const history = WorkoutHistory.getByExercise(exerciseName, 1);
    return history.length > 0 ? history[0] : null;
  },
  
  /**
   * Get workout comparison (current vs previous week)
   * @param {number} currentWeek
   * @param {string} day
   * @param {string} exerciseName
   * @returns {Object} { current, previous, improvement }
   */
  getComparison: (currentWeek, day, exerciseName) => {
    const current = (WorkoutHistory.getAll() || []).filter(
      entry => entry.week === currentWeek && 
               entry.day === day && 
               entry.exercise === exerciseName
    );
    
    const previous = (WorkoutHistory.getAll() || []).filter(
      entry => entry.week === currentWeek - 1 && 
               entry.day === day && 
               entry.exercise === exerciseName
    );
    
    let improvement = null;
    
    if (current.length > 0 && previous.length > 0) {
      // Calculate average weight and reps
      const currentAvg = {
        weight: current.reduce((sum, s) => sum + s.weight, 0) / current.length,
        reps: current.reduce((sum, s) => sum + s.reps, 0) / current.length
      };
      
      const previousAvg = {
        weight: previous.reduce((sum, s) => sum + s.weight, 0) / previous.length,
        reps: previous.reduce((sum, s) => sum + s.reps, 0) / previous.length
      };
      
      improvement = {
        weightDiff: currentAvg.weight - previousAvg.weight,
        repsDiff: currentAvg.reps - previousAvg.reps,
        volumeDiff: (currentAvg.weight * currentAvg.reps) - (previousAvg.weight * previousAvg.reps)
      };
    }
    
    return { current, previous, improvement };
  },
  
  /**
   * Clear all history (use with caution)
   */
  clear: () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    return false;
  },
  
  /**
   * Export history as JSON
   * @returns {string}
   */
  export: () => {
    const history = WorkoutHistory.getAll() || [];
    return JSON.stringify(history, null, 2);
  },
  
  /**
   * Import history from JSON
   * @param {string} jsonData
   * @returns {boolean}
   */
  import: (jsonData) => {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
};

// ========================================
// STATISTICS & ANALYTICS
// ========================================

export const WorkoutStats = {
  /**
   * Get total workouts completed
   * @returns {number}
   */
  getTotalWorkouts: () => {
    const history = WorkoutHistory.getAll() || [];
    const uniqueWorkouts = new Set(
      history.map(entry => `${entry.week}-${entry.day}`)
    );
    return uniqueWorkouts.size;
  },
  
  /**
   * Get total sets completed
   * @returns {number}
   */
  getTotalSets: () => {
    return (WorkoutHistory.getAll() || []).length;
  },
  
  /**
   * Get total volume lifted (kg)
   * @returns {number}
   */
  getTotalVolume: () => {
    return (WorkoutHistory.getAll() || []).reduce(
      (total, entry) => total + (entry.weight * entry.reps), 
      0
    );
  },
  
  /**
   * Get average weight per exercise
   * @param {string} exerciseName
   * @returns {number}
   */
  getAverageWeight: (exerciseName) => {
    const sets = WorkoutHistory.getByExercise(exerciseName);
    if (sets.length === 0) return 0;
    
    const total = sets.reduce((sum, set) => sum + set.weight, 0);
    return Math.round(total / sets.length * 10) / 10;
  },
  
  /**
   * Get personal records for exercise
   * @param {string} exerciseName
   * @returns {Object} { maxWeight, maxReps, maxVolume }
   */
  getPersonalRecords: (exerciseName) => {
    const sets = WorkoutHistory.getByExercise(exerciseName);
    
    if (sets.length === 0) {
      return { maxWeight: 0, maxReps: 0, maxVolume: 0 };
    }
    
    const maxWeight = Math.max(...sets.map(s => s.weight));
    const maxReps = Math.max(...sets.map(s => s.reps));
    const maxVolume = Math.max(...sets.map(s => s.weight * s.reps));
    
    return { maxWeight, maxReps, maxVolume };
  },
  
  /**
   * Get workout streak (consecutive days)
   * @returns {number}
   */
  getStreak: () => {
    const history = WorkoutHistory.getAll() || [];
    if (history.length === 0) return 0;
    
    // Get unique workout dates
    const dates = [...new Set(history.map(entry => entry.date))].sort();
    
    let streak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1].split('/').reverse().join('-'));
      const curr = new Date(dates[i].split('/').reverse().join('-'));
      
      const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return streak;
  },
  
  /**
   * Get weekly summary
   * @param {number} week
   * @returns {Object}
   */
  getWeeklySummary: (week) => {
    const sets = WorkoutHistory.getByWeek(week);
    
    const workouts = new Set(sets.map(s => s.day)).size;
    const totalVolume = sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
    const exercises = new Set(sets.map(s => s.exercise)).size;
    
    return {
      week,
      workouts,
      totalSets: sets.length,
      totalVolume,
      exercises,
      avgVolumePerWorkout: workouts > 0 ? Math.round(totalVolume / workouts) : 0
    };
  }
};

// ========================================
// PROGRESS TRACKING
// ========================================

export const ProgressTracker = {
  /**
   * Check if there's progress on an exercise
   * @param {string} exerciseName
   * @param {number} currentWeek
   * @returns {Object|null}
   */
  checkProgress: (exerciseName, currentWeek) => {
    const current = (WorkoutHistory.getAll() || []).filter(
      entry => entry.week === currentWeek && entry.exercise === exerciseName
    );
    
    const previous = (WorkoutHistory.getAll() || []).filter(
      entry => entry.week === currentWeek - 1 && entry.exercise === exerciseName
    );
    
    if (current.length === 0 || previous.length === 0) {
      return null;
    }
    
    const currentBest = Math.max(...current.map(s => s.weight * s.reps));
    const previousBest = Math.max(...previous.map(s => s.weight * s.reps));
    
    const improvement = currentBest - previousBest;
    const improvementPercent = (improvement / previousBest) * 100;
    
    return {
      improved: improvement > 0,
      improvement,
      improvementPercent: Math.round(improvementPercent * 10) / 10,
      currentBest,
      previousBest
    };
  },
  
  /**
   * Get exercise history chart data
   * @param {string} exerciseName
   * @param {number} limit
   * @returns {Array}
   */
  getChartData: (exerciseName, limit = 10) => {
    const sets = WorkoutHistory.getByExercise(exerciseName);
    
    // Group by workout session (week + day)
    const sessions = {};
    
    sets.forEach(set => {
      const key = `W${set.week}-${set.day}`;
      if (!sessions[key]) {
        sessions[key] = {
          label: key,
          week: set.week,
          day: set.day,
          date: set.date,
          maxWeight: 0,
          totalVolume: 0,
          sets: []
        };
      }
      
      sessions[key].maxWeight = Math.max(sessions[key].maxWeight, set.weight);
      sessions[key].totalVolume += set.weight * set.reps;
      sessions[key].sets.push(set);
    });
    
    // Convert to array and sort by week
    const data = Object.values(sessions).sort((a, b) => a.week - b.week);
    
    return limit ? data.slice(-limit) : data;
  }
};
