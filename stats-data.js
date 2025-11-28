const STATS_STORAGE_KEY = 'neon_fit_workout_history';

const MUSCLE_MAPPING = {
  'dos': { id: 'm1', name: 'DOS', color: '#3b82f6' },
  'pectoraux': { id: 'm2', name: 'PECTORAUX', color: '#22d3ee' },
  'quadriceps': { id: 'm3', name: 'JAMBES', color: '#8b5cf6' },
  'jambes': { id: 'm3', name: 'JAMBES', color: '#8b5cf6' },
  'fessiers': { id: 'm3', name: 'JAMBES', color: '#8b5cf6' },
  'ischios': { id: 'm3', name: 'JAMBES', color: '#8b5cf6' },
  'épaules': { id: 'm4', name: 'ÉPAULES', color: '#d946ef' },
  'biceps': { id: 'm5', name: 'BRAS', color: '#f43f5e' },
  'triceps': { id: 'm5', name: 'BRAS', color: '#f43f5e' },
  'avant-bras': { id: 'm5', name: 'BRAS', color: '#f43f5e' },
  'abdos': { id: 'm6', name: 'ABDOS', color: '#10b981' }
};

const ZONE_COLORS = {
  force: { color: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
  hyper: { color: 'bg-violet-500', shadow: 'shadow-violet-500/50' },
  endu: { color: 'bg-cyan-500', shadow: 'shadow-cyan-500/50' }
};

const StatsData = {
  getHistory: () => {
    try {
      const data = localStorage.getItem(STATS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading history:', e);
      return [];
    }
  },

  getXP: () => {
    return parseInt(localStorage.getItem('hybrid_xp') || '0');
  },

  getCurrentWeek: () => {
    return parseInt(localStorage.getItem('hybrid_current_week') || '1');
  },

  getZonesData: () => {
    const history = StatsData.getHistory();
    if (history.length === 0) {
      return [
        { id: 'force', label: 'FORCE', range: '1-5 RM', percent: 0, sets: 0, ...ZONE_COLORS.force },
        { id: 'hyper', label: 'HYPERTROPHIE', range: '6-12 RM', percent: 0, sets: 0, ...ZONE_COLORS.hyper },
        { id: 'endu', label: 'ENDURANCE', range: '15+ RM', percent: 0, sets: 0, ...ZONE_COLORS.endu }
      ];
    }

    let forceSets = 0, hyperSets = 0, enduSets = 0;

    history.forEach(entry => {
      const reps = parseInt(entry.reps) || parseInt(entry.targetReps) || 8;
      if (reps <= 5) {
        forceSets++;
      } else if (reps <= 12) {
        hyperSets++;
      } else {
        enduSets++;
      }
    });

    const totalSets = forceSets + hyperSets + enduSets;

    return [
      { 
        id: 'force', 
        label: 'FORCE', 
        range: '1-5 RM', 
        percent: totalSets > 0 ? Math.round((forceSets / totalSets) * 100) : 0, 
        sets: forceSets, 
        ...ZONE_COLORS.force 
      },
      { 
        id: 'hyper', 
        label: 'HYPERTROPHIE', 
        range: '6-12 RM', 
        percent: totalSets > 0 ? Math.round((hyperSets / totalSets) * 100) : 0, 
        sets: hyperSets, 
        ...ZONE_COLORS.hyper 
      },
      { 
        id: 'endu', 
        label: 'ENDURANCE', 
        range: '15+ RM', 
        percent: totalSets > 0 ? Math.round((enduSets / totalSets) * 100) : 0, 
        sets: enduSets, 
        ...ZONE_COLORS.endu 
      }
    ];
  },

  getMusclesData: () => {
    const history = StatsData.getHistory();
    const muscleVolumes = {
      'm1': { id: 'm1', name: 'DOS', color: '#3b82f6', volume: 0, sets: 0 },
      'm2': { id: 'm2', name: 'PECTORAUX', color: '#22d3ee', volume: 0, sets: 0 },
      'm3': { id: 'm3', name: 'JAMBES', color: '#8b5cf6', volume: 0, sets: 0 },
      'm4': { id: 'm4', name: 'ÉPAULES', color: '#d946ef', volume: 0, sets: 0 },
      'm5': { id: 'm5', name: 'BRAS', color: '#f43f5e', volume: 0, sets: 0 },
      'm6': { id: 'm6', name: 'ABDOS', color: '#10b981', volume: 0, sets: 0 }
    };

    history.forEach(entry => {
      const weight = parseFloat(entry.weight) || 0;
      const reps = parseInt(entry.reps) || 0;
      const volume = weight * reps;

      const exerciseName = (entry.exercise || '').toLowerCase();
      
      let foundMuscle = false;
      for (const [key, muscle] of Object.entries(MUSCLE_MAPPING)) {
        if (exerciseName.includes(key) || 
            (entry.muscle && entry.muscle.includes && entry.muscle.includes(key))) {
          muscleVolumes[muscle.id].volume += volume;
          muscleVolumes[muscle.id].sets++;
          foundMuscle = true;
          break;
        }
      }

      if (!foundMuscle) {
        if (exerciseName.includes('squat') || exerciseName.includes('leg') || exerciseName.includes('deadlift')) {
          muscleVolumes['m3'].volume += volume;
          muscleVolumes['m3'].sets++;
        } else if (exerciseName.includes('bench') || exerciseName.includes('push') || exerciseName.includes('fly')) {
          muscleVolumes['m2'].volume += volume;
          muscleVolumes['m2'].sets++;
        } else if (exerciseName.includes('row') || exerciseName.includes('pull') || exerciseName.includes('lat')) {
          muscleVolumes['m1'].volume += volume;
          muscleVolumes['m1'].sets++;
        } else if (exerciseName.includes('curl')) {
          muscleVolumes['m5'].volume += volume;
          muscleVolumes['m5'].sets++;
        } else if (exerciseName.includes('press') || exerciseName.includes('raise')) {
          muscleVolumes['m4'].volume += volume;
          muscleVolumes['m4'].sets++;
        }
      }
    });

    return Object.values(muscleVolumes);
  },

  getMusclesHUD: () => {
    const muscles = StatsData.getMusclesData();
    const maxVolume = Math.max(...muscles.map(m => m.volume), 1);

    return muscles.map((m, i) => ({
      id: String(i + 1),
      name: m.name.substring(0, 4).toUpperCase(),
      sets: m.sets,
      volume: Math.round(m.volume),
      type: 'primary',
      normalized: maxVolume > 0 ? m.volume / maxVolume : 0.1,
      intensity: m.sets > 0 ? Math.min(10, 6 + (m.sets / 10)) : 0,
      recovery: m.sets > 0 ? Math.max(0, 100 - (m.sets * 5)) : 100
    }));
  },

  getWeeksData: () => {
    const history = StatsData.getHistory();
    const currentWeek = StatsData.getCurrentWeek();
    const weeksMap = {};

    history.forEach(entry => {
      const week = entry.week || 1;
      if (!weeksMap[week]) {
        weeksMap[week] = { volume: 0, sets: 0, exercises: new Set() };
      }
      const volume = (parseFloat(entry.weight) || 0) * (parseInt(entry.reps) || 0);
      weeksMap[week].volume += volume;
      weeksMap[week].sets++;
      weeksMap[week].exercises.add(entry.exercise);
    });

    const weeks = [];
    const positions = [
      { x: 60, y: 38 },
      { x: 75, y: 55 },
      { x: 60, y: 75 },
      { x: 35, y: 65 }
    ];

    for (let w = 1; w <= Math.max(currentWeek, 4); w++) {
      const data = weeksMap[w] || { volume: 0, sets: 0, exercises: new Set() };
      const pos = positions[(w - 1) % 4];
      
      weeks.push({
        id: `w${w}`,
        label: `S${w}`,
        volume: Math.round(data.volume),
        intensity: Math.min(100, data.sets * 2),
        status: w < currentWeek ? 'completed' : (w === currentWeek ? 'current' : 'upcoming'),
        x: pos.x,
        y: pos.y
      });
    }

    return weeks.slice(0, 4);
  },

  getSummary: () => {
    const history = StatsData.getHistory();
    const xp = StatsData.getXP();

    const uniqueWorkouts = new Set(history.map(e => `${e.week}-${e.day}`)).size;
    const totalSets = history.length;
    const totalVolume = history.reduce((sum, e) => sum + ((parseFloat(e.weight) || 0) * (parseInt(e.reps) || 0)), 0);

    const maxSets = Math.max(totalSets, 60);
    const maxSessions = Math.max(uniqueWorkouts, 5);
    const score = totalSets > 0 ? Math.min(100, Math.round((totalSets / maxSets) * 100)) : 0;

    return {
      score,
      sessions: uniqueWorkouts,
      maxSessions,
      sets: totalSets,
      maxSets,
      volume: Math.round(totalVolume),
      xp
    };
  },

  exportAllData: () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      workoutHistory: StatsData.getHistory(),
      xp: StatsData.getXP(),
      currentWeek: StatsData.getCurrentWeek()
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.workoutHistory && Array.isArray(data.workoutHistory)) {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(data.workoutHistory));
      }
      
      if (typeof data.xp === 'number') {
        localStorage.setItem('hybrid_xp', String(data.xp));
      }
      
      if (typeof data.currentWeek === 'number') {
        localStorage.setItem('hybrid_current_week', String(data.currentWeek));
      }

      return { success: true, message: 'Données importées avec succès!' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: 'Erreur: Fichier JSON invalide' };
    }
  },

  downloadBackup: () => {
    const data = StatsData.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neonfit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  triggerImport: (callback) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = StatsData.importAllData(event.target.result);
          if (callback) callback(result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
};

window.StatsData = StatsData;
