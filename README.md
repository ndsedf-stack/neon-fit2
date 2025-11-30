# NEON FIT V3.1 - PWA Fitness Tracker Cyberpunk

**Date de mise a jour** : 30 novembre 2025  
**Version** : V3.1 - ActiveSeriesModule React + Timer Premium  
**Repo GitHub** : [ndsedf-stack/neon-fit2](https://github.com/ndsedf-stack/neon-fit2)  
**Live Demo** : [ndsedf-stack.github.io/neon-fit2](https://ndsedf-stack.github.io/neon-fit2)

---

## Table des Matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Technologies utilisees](#3-technologies-utilisees)
4. [Installation et lancement](#4-installation-et-lancement)
5. [Pages de l'application](#5-pages-de-lapplication)
6. [ActiveSeriesModule - Timer Workout React](#6-activeseriesmodule---timer-workout-react)
7. [Systeme de Timer Guide](#7-systeme-de-timer-guide)
8. [Systeme de Timer Repos](#8-systeme-de-timer-repos)
9. [Systeme de Gamification XP](#9-systeme-de-gamification-xp)
10. [Cloud Sync Supabase](#10-cloud-sync-supabase)
11. [Guide de modification](#11-guide-de-modification)
12. [Palette de couleurs](#12-palette-de-couleurs)
13. [Animations et effets CSS](#13-animations-et-effets-css)
14. [Compatibilite iOS Safari](#14-compatibilite-ios-safari)
15. [Formats de donnees](#15-formats-de-donnees)
16. [Problemes connus et solutions](#16-problemes-connus-et-solutions)
17. [Conventions de code](#17-conventions-de-code)

---

## 1. Vue d'ensemble

NEON FIT est une **Progressive Web App (PWA)** de suivi d'entrainement avec esthetique **cyberpunk/sci-fi**. Elle combine :

- **Systeme de gamification** (XP, levels, ranks)
- **Tracker de workout complet** (Hybrid Performance Method - 4 semaines)
- **Interface type HUD** (Heads-Up Display) futuriste
- **Mission Briefing System** immersif pre-workout
- **Timer Guide** avec phases tempo animees (descente/pause/remontee)
- **Timer Repos** simplifie avec cercle progress gradient
- **Cloud Sync** via Supabase (magic link + OAuth)

---

## 2. Structure des fichiers

```
neon-fit2/
│
├── index.html                # Dashboard principal (QG)
├── workouts.html             # Liste des workouts (OPS)
├── briefing.html             # Mission Briefing pre-workout
├── session.html              # Session active + Timer Repos
├── session-tempo.html        # Timer Guide avec phases tempo
├── stats.html                # Statistiques React (STATS)
│
├── app.js                    # ES6 module (session.html uniquement)
├── app-v2.js                 # Gamification, Utils, UI (scripts classiques)
├── program-data.js           # ES6 module (session.html uniquement)
├── program-data-v2.js        # Programme 4 semaines (scripts classiques)
├── workout-history.js        # ES6 module (session.html uniquement)
├── workout-history-v2.js     # CRUD historique (scripts classiques)
├── stats-data.js             # Agregation stats depuis historique
├── briefing-integration.js   # Handlers boutons briefing
│
├── config.js                 # Configuration Supabase (URL + anon key)
├── cloud-sync-supabase.js    # Auth UI + sync cloud logic
├── supabase-schema.sql       # Schema SQL pour Supabase
│
├── sw.js                     # Service Worker PWA
├── version.js                # Timestamp version (cache busting)
│
├── server/                   # Backend Express.js (Replit uniquement)
│   ├── index.js              # Serveur principal, routes, fichiers statiques
│   ├── replitAuth.js         # Replit Auth (OpenID Connect)
│   └── db.js                 # Connexion PostgreSQL
│
├── package.json              # Dependances Node.js
└── README.md                 # Cette documentation
```

### Fichiers ES6 vs Classic Scripts

| Type | Fichiers | Utilisation |
|------|----------|-------------|
| **ES6 Modules** | `app.js`, `program-data.js`, `workout-history.js` | Uniquement `session.html` via `type="module"` |
| **Classic Scripts** | `*-v2.js` | Toutes les autres pages (compatibilite Safari) |

---

## 3. Technologies utilisees

| Categorie | Technologie |
|-----------|-------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Stats Page** | React 18 + Babel (compilation in-browser) |
| **Styling** | TailwindCSS (CDN) + CSS custom |
| **Storage** | LocalStorage (offline-first) + Supabase Cloud |
| **Auth** | Supabase Auth (Magic Link, Google, GitHub) |
| **Backend** | Express.js (Replit) ou Static (GitHub Pages) |
| **Database** | PostgreSQL (Supabase) |
| **PWA** | Service Worker + Manifest |

---

## 4. Installation et lancement

### Option A : GitHub Pages (statique)

```bash
# Cloner le repo
git clone https://github.com/ndsedf-stack/neon-fit2.git
cd neon-fit2

# Serveur local
npx http-server -p 8000 --cors

# Ouvrir
open http://localhost:8000
```

### Option B : Replit (avec backend)

```bash
# Le serveur tourne automatiquement sur port 5000
node server/index.js
```

### Deploiement GitHub Pages

```bash
git add -A
git commit -m "deploiement"
git push origin main
# Disponible sur https://[username].github.io/neon-fit2
```

---

## 5. Pages de l'application

### index.html - Dashboard QG

- Affiche XP, niveau, semaine courante
- Bouton "COMMENCER" vers workouts.html
- Bouton "STATISTIQUES" vers stats.html

### workouts.html - Liste OPS

- Liste des 4 jours d'entrainement de la semaine
- Clic sur un workout -> briefing.html

### briefing.html - Mission Briefing

- Details du workout avant de commencer
- Liste des exercices, duree, sets
- Bouton "LANCER LA MISSION" -> session.html

### session.html - Session Active

- Affiche exercice courant
- Boutons +/- pour poids et reps
- Bouton "VALIDER" pour logger la serie
- **Timer Repos** automatique apres validation
- Bouton "TIMER GUIDE" -> session-tempo.html

### session-tempo.html - Timer Guide

- **3 phases visuelles** : Descente (3s) -> Pause (1s) -> Remontee (2s)
- Barres de progression animees
- Vibrations a chaque phase
- Retour auto vers session.html

### stats.html - Statistiques React

Page React avec 22 composants de visualisation organises en sections :

| Section | Couleur | Composants |
|---------|---------|------------|
| **Command Center** | Vert | 1 composant principal |
| **Core Essentials** | Cyan | 8 composants essentiels |
| **Premium Analytics** | Fuchsia | 10 composants avances |
| **Extra** | Amber | 2 composants bonus |
| **Legacy** | Gris | 2 composants heritage |

---

## 5.1 Architecture du Systeme de Stats

### Fichiers lies aux statistiques

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOURCES DE DONNEES                        │
├─────────────────────────────────────────────────────────────────┤
│  localStorage                                                    │
│  ├── neon_fit_workout_history  ← Historique des series          │
│  ├── hybrid_xp                 ← Points XP totaux               │
│  ├── hybrid_current_week       ← Semaine courante (1-26)        │
│  ├── hybrid_streak             ← Jours consecutifs              │
│  └── neon_fit_body_composition ← Poids, bodyfat, etc.           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     stats-data.js                                │
│                   (Hub de donnees)                               │
├─────────────────────────────────────────────────────────────────┤
│  StatsData.getHistory()        → Array d'entrees workout        │
│  StatsData.getXP()             → XP total (number)              │
│  StatsData.getCurrentWeek()    → Semaine 1-26 (number)          │
│  StatsData.getSummary()        → {score, sessions, sets, volume}│
│  StatsData.getZonesData()      → Force/Hyper/Endurance          │
│  StatsData.getMusclesData()    → 6 groupes musculaires          │
│  StatsData.getMusclesHUD()     → Format HUD normalise           │
│  StatsData.getWeeksData()      → 4 semaines pour radar          │
│  StatsData.getDailyActivity()  → 7 derniers jours               │
│  StatsData.getMorphologyData() → Push/Pull/Legs distribution    │
│  StatsData.getBodyComposition()→ Poids, bodyfat, objectifs      │
│  StatsData.getChallengesData() → Challenges actifs              │
│  StatsData.exportAllData()     → JSON backup complet            │
│  StatsData.importAllData()     → Restaurer backup               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        stats.html                                │
│                  (22 Composants React)                           │
├─────────────────────────────────────────────────────────────────┤
│  <script src="stats-data.js">     ← Charge StatsData global     │
│  <script type="text/babel">       ← Composants React            │
│                                                                  │
│  // Consommation dans un composant :                            │
│  const summary = window.StatsData.getSummary();                 │
│  const muscles = window.StatsData.getMusclesHUD();              │
└─────────────────────────────────────────────────────────────────┘
```

### Flux de donnees

```
session.html                    stats.html
     │                               │
     │  1. User complete une serie   │
     │  ───────────────────────▶     │
     │                               │
     │  localStorage.setItem(        │
     │    'neon_fit_workout_history',│
     │    JSON.stringify(entries)    │
     │  )                            │
     │                               │
     └───────────────────────────────┤
                                     │
                                     │  2. Stats lit les donnees
                                     │
                                     │  window.StatsData.getHistory()
                                     │  → Parse localStorage
                                     │  → Calcule aggregations
                                     │  → Retourne donnees formatees
                                     │
                                     ▼
                              [Composants React]
```

---

## 5.2 Format des Donnees LocalStorage

### neon_fit_workout_history (Array)

Chaque entree represente une serie completee :

```javascript
{
  "id": "uuid-unique",
  "exercise": "Tirage vertical",
  "weight": 60,
  "reps": 10,
  "targetReps": 10,
  "week": 3,
  "day": "lundi",
  "muscle": ["dos"],           // Array de muscles cibles
  "completedAt": "2024-11-29T14:30:00.000Z",
  "date": "2024-11-29"
}
```

### hybrid_xp (number)

```javascript
"12500"  // XP total accumule
```

### hybrid_current_week (number)

```javascript
"3"  // Semaine courante du programme (1-26)
```

### neon_fit_body_composition (object)

```javascript
{
  "currentWeight": 74.5,
  "startWeight": 80.2,
  "goalWeight": 70.0,
  "bodyFat": 14.2,
  "height": 178,
  "lastUpdate": "2024-11-29T12:00:00.000Z"
}
```

---

## 5.3 Les 22 Composants Stats

### Organisation dans stats.html

```jsx
// Ordre d'affichage dans StatsPage :
<CommandCenter />              // 1. Bouton START + systemes

// ───── CORE ESSENTIALS ───── (cyan)
<NeonTracker />                // 2. FIGHTER.HUD - Jauge circulaire
<VolumeGauge />                // 3. HYPER.ENGINE - Turbine rotative
<WeeklyProgress />             // 4. KINETIC.RADAR - 4 cercles concentriques
<ConsistencyLog />             // 5. Calendrier de streaks
<PowerMetrics />               // 6. Metriques de puissance
<BioScanner />                 // 7. Scanner corporel
<MorphologyAnalysis />         // 8. Analyse morphologique
<MorphoTimeline />             // 9. Timeline evolution

// ───── PREMIUM ANALYTICS ───── (fuchsia)
<BioSynthetics />              // 10. Bio-donnees
<RecoverySystem />             // 11. Systeme de recuperation
<PowerCurve />                 // 12. Courbe de puissance
<MuscleFatigue />              // 13. Fatigue musculaire
<PerformanceRadar />           // 14. Radar performance
<VolumeFlow />                 // 15. Flux de volume
<SymmetryAnalysis />           // 16. Analyse symetrie
<TrainingDensity />            // 17. Densite d'entrainement
<ChallengeSystem />            // 18. Systeme de challenges
<ActivityChart />              // 19. Graphique activite

// ───── EXTRA ───── (amber)
<IntensityZones />             // 20. Zones Force/Hyper/Endurance
<MuscleHud />                  // 21. HUD musculaire visuel

// ───── LEGACY ───── (gris)
<MuscleWorkload />             // 22. Charge par muscle (ancien)
```

### Ajouter un nouveau composant

1. **Creer le composant React dans stats.html** :

```jsx
const MonNouveauComposant = ({ data }) => {
  // Ref pour animations RAF
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  
  useEffect(() => {
    // Animation loop avec requestAnimationFrame
    const animate = () => {
      // ... logique animation
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => cancelAnimationFrame(animRef.current);
  }, []);
  
  return (
    <div className="relative rounded-2xl p-4"
         style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="text-cyan-400" size={18} />
        <span className="text-sm font-mono text-cyan-400">MON.COMPOSANT</span>
      </div>
      {/* Contenu */}
      <canvas ref={canvasRef} />
    </div>
  );
};
```

2. **Ajouter les donnees dans stats-data.js** (si besoin) :

```javascript
// Dans l'objet StatsData
getMonNouveauData: () => {
  const history = StatsData.getHistory();
  // ... calculs
  return { /* donnees formatees */ };
},
```

3. **Integrer dans le rendu** :

```jsx
// Dans StatsPage, ajouter le composant a la bonne position
<div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
  <MonNouveauComposant data={window.StatsData.getMonNouveauData()} />
</div>
```

### Modifier un composant existant

1. Chercher le composant par son nom (ex: `VolumeGauge`)
2. Modifier le JSX/CSS/logique
3. Tester sur `/stats.html`

### Supprimer un composant

1. Supprimer le composant du rendu dans `StatsPage`
2. Optionnellement supprimer la definition du composant
3. Optionnellement supprimer la fonction de donnees dans `stats-data.js`

---

## 5.4 Mapping des Muscles

Defini dans `stats-data.js` :

```javascript
const MUSCLE_MAPPING = {
  // Mot-cle → ID muscle + couleur
  'dos': { id: 'm1', name: 'DOS', color: '#3b82f6' },
  'pectoraux': { id: 'm2', name: 'PECT', color: '#22d3ee' },
  'pecs': { id: 'm2', name: 'PECT', color: '#22d3ee' },
  'quadriceps': { id: 'm3', name: 'JAMB', color: '#8b5cf6' },
  'jambes': { id: 'm3', name: 'JAMB', color: '#8b5cf6' },
  'fessiers': { id: 'm3', name: 'JAMB', color: '#8b5cf6' },
  'ischios': { id: 'm3', name: 'JAMB', color: '#8b5cf6' },
  'épaules': { id: 'm4', name: 'ÉPAU', color: '#d946ef' },
  'epaules': { id: 'm4', name: 'ÉPAU', color: '#d946ef' },
  'biceps': { id: 'm5', name: 'BRAS', color: '#f43f5e' },
  'triceps': { id: 'm5', name: 'BRAS', color: '#f43f5e' },
  'avant-bras': { id: 'm5', name: 'BRAS', color: '#f43f5e' },
  'abdos': { id: 'm6', name: 'ABDO', color: '#10b981' }
};
```

Pour ajouter un nouveau muscle :
1. Ajouter l'entree dans `MUSCLE_MAPPING`
2. Ajouter un objet dans `muscleVolumes` de `getMusclesData()`
3. Mettre a jour les composants visuels si necessaire

---

## 5.5 API StatsData Complete

| Methode | Retour | Description |
|---------|--------|-------------|
| `getHistory()` | `Array<Entry>` | Toutes les series completees |
| `getXP()` | `number` | XP total |
| `getCurrentWeek()` | `number` | Semaine 1-26 |
| `getZonesData()` | `Array<Zone>` | Force/Hypertrophie/Endurance avec % |
| `getMusclesData()` | `Array<Muscle>` | Volume et sets par muscle |
| `getMusclesHUD()` | `Array<HUDMuscle>` | Format normalise pour HUD |
| `getWeeksData()` | `Array<Week>` | 4 semaines avec positions radar |
| `getSummary()` | `Summary` | Score, sessions, sets, volume |
| `getDailyActivity()` | `Array<Day>` | 7 derniers jours |
| `getChallengesData()` | `Array<Challenge>` | Challenges avec progression |
| `getBodyComposition()` | `BodyComp` | Poids, bodyfat, objectifs |
| `setBodyComposition(data)` | `BodyComp` | Sauvegarder body comp |
| `getMorphologyData()` | `Morphology` | Push/Pull/Legs distribution |
| `exportAllData()` | `string` | JSON backup complet |
| `importAllData(json)` | `{success, message}` | Restaurer depuis backup |
| `downloadBackup()` | `void` | Telecharge fichier .json |
| `triggerImport(callback)` | `void` | Ouvre dialogue import |

### Types de retour

```typescript
// Entry (serie completee)
{
  id: string,
  exercise: string,
  weight: number,
  reps: number,
  targetReps: number,
  week: number,
  day: string,
  muscle: string[],
  completedAt: string,
  date: string
}

// Summary
{
  score: number,        // 0-100
  sessions: number,     // Total workouts
  maxSessions: number,  // Target this week
  sets: number,         // Total sets
  maxSets: number,      // Target sets
  volume: number,       // kg total
  xp: number,
  currentWeek: number,
  totalWeeks: 26
}

// Zone
{
  id: 'force' | 'hyper' | 'endu',
  label: string,
  range: string,
  percent: number,
  sets: number,
  color: string,
  shadow: string
}

// Muscle
{
  id: string,
  name: string,
  color: string,
  volume: number,
  sets: number
}
```

---

## 5.6 Animations Haute Performance

Pattern recommande pour les animations :

```jsx
const MonComposant = ({ value }) => {
  const animatedValue = useRef(0);
  const elementRef = useRef(null);
  const animRef = useRef(null);
  
  useEffect(() => {
    const animate = () => {
      // Lerp smoothing (diff * 0.08)
      const diff = value - animatedValue.current;
      animatedValue.current += diff * 0.08;
      
      // Update DOM directement (pas de setState)
      if (elementRef.current) {
        elementRef.current.textContent = Math.round(animatedValue.current);
      }
      
      animRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);
  
  return <span ref={elementRef}>0</span>;
};
```

**Regles cles :**
- Utiliser `useRef` pour les valeurs animees (pas `useState`)
- Mettre a jour le DOM directement via `.textContent` ou `.setAttribute`
- Lerp smoothing : `current += (target - current) * 0.08`
- Toujours `cancelAnimationFrame` dans le cleanup

---

## 6. ActiveSeriesModule - Timer Workout React

### 6.1 Vue d'ensemble

Le `ActiveSeriesModule` est le composant React central de `session.html` qui gere :
- **Timer Tempo** : Phases ECC (descente) / ISO (maintien) / CON (montee)
- **Timer Repos** : Compte a rebours avec respiration guidee 4-4-4-4
- **Barres laterales** : Visualisation premium des phases avec gradients
- **Halo pulsant** : Effet lumineux synchronise avec les phases
- **Gestion des series** : Compteur, RPE, volume cumule

### 6.2 Architecture et Flux de Donnees

```
┌─────────────────────────────────────────────────────────────────┐
│                    program-data-v2.js                           │
│                  (Source de verite)                             │
├─────────────────────────────────────────────────────────────────┤
│  getWeek(weekNum)                                               │
│  └── weekData = {                                               │
│        block: 1-5,                                              │
│        technique: "Tempo 3-1-2" | "Rest-Pause" | "Drop-sets"... │
│        isDeload: true/false,                                    │
│        rpeTarget: "6-7" | "7-8" | "8" | "8-9"                   │
│      }                                                          │
│                                                                 │
│  getWorkout(weekNum, dayKey)                                    │
│  └── workoutData = {                                            │
│        name: "DOS + JAMBES",                                    │
│        exercises: [                                             │
│          {                                                      │
│            name: "Trap Bar Deadlift",                           │
│            tempo: "3-1-2",     ← STRING format                  │
│            rest: 120,          ← Secondes                       │
│            weight: 75,         ← KG calcule                     │
│            sets: 5,                                             │
│            reps: "6-8",                                         │
│            isSuperset: false,                                   │
│            supersetWith: null,                                  │
│            notes: "Rest-Pause S5 : 6-8 reps → 20s → 2-3 reps"   │
│          },                                                     │
│          ...                                                    │
│        ]                                                        │
│      }                                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    session.html                                  │
│                  (SessionPage Component)                         │
├─────────────────────────────────────────────────────────────────┤
│  // 1. Charger les donnees                                      │
│  const weekData = pData.getWeek(weekNum);                       │
│  const workoutData = pData.getWorkout(weekNum, dayKey);         │
│                                                                 │
│  // 2. Parser le tempo STRING → OBJECT                          │
│  const parseTempo = (tempoStr) => {                             │
│    const parts = tempoStr.split('-').map(n => parseInt(n));     │
│    return { ecc: parts[0], iso: parts[1], con: parts[2] };      │
│  };                                                             │
│  // "3-1-2" → { ecc: 3, iso: 1, con: 2 }                        │
│                                                                 │
│  // 3. Extraire les valeurs par exercice                        │
│  const tempo = parseTempo(currentExercise?.tempo);              │
│  const rest = currentExercise?.rest || 90;                      │
│  const load = currentExercise?.weight || 20;                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ActiveSeriesModule                              │
│                    (Props recues)                                │
├─────────────────────────────────────────────────────────────────┤
│  exercise={{                                                    │
│    name: "Trap Bar Deadlift",                                   │
│    muscleGroup: "DOS + JAMBES",                                 │
│    isSuperset: false,                                           │
│    supersetWith: null,                                          │
│    technique: "Rest-Pause",                                     │
│    isDeload: false                                              │
│  }}                                                             │
│  tempo={{ ecc: 3, iso: 1, con: 2 }}  ← OBJECT (parse)           │
│  restTime={120}                       ← Secondes                │
│  load={75}                            ← KG                      │
│  totalSets={5}                                                  │
│  targetReps={10}                                                │
│  instruction="Rest-Pause S5..."                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Problemes resolus (V3.0 → V3.1)

| Probleme V3.0 | Solution V3.1 |
|---------------|---------------|
| `tempo` lu depuis `weekData?.tempo` qui n'existe pas | Lecture depuis `currentExercise.tempo` |
| Tempo string "3-1-2" non parse | Fonction `parseTempo()` convertit en objet |
| `rest` fallback toujours 90s | Lecture depuis `currentExercise.rest` (75-120s) |
| `load` hardcode a 60kg | Lecture depuis `currentExercise.weight` (calcule) |
| Pas d'affichage superset | Badge "SUPERSET → partner" visible |
| Technique d'intensification invisible | Badge technique (Rest-Pause, Drop-sets...) |
| Deload non indique | Badge vert "DELOAD" en semaines 6,12,18,24,26 |

### 6.4 Coherence Tempo par Bloc

Le tempo change selon la semaine/bloc dans `program-data-v2.js` :

| Semaines | Bloc | Tempo | Technique | RPE |
|----------|------|-------|-----------|-----|
| 1-5 | 1 | **3-1-2** | Tempo controlé | 6-7 |
| 6 | 1 | **4-1-2** | Deload | 5-6 |
| 7-11 | 2 | **2-1-2** | Rest-Pause | 7-8 |
| 12 | 2 | **4-1-2** | Deload | 5-6 |
| 13-17 | 3 | **2-1-2** | Drop-sets + Myo-reps | 8 |
| 18 | 3 | **4-1-2** | Deload | 5-6 |
| 19-23 | 4 | **2-1-2** | Clusters + Myo-reps + Partials | 8-9 |
| 24,26 | 4-5 | **4-1-2** | Deload | 5-6 |
| 25 | 5 | **2-1-2** | Peak Week | 8-9 |

### 6.5 Timer Travail - Cycle de Rep

```javascript
// Duree totale d'une rep
const totalRepDuration = (ecc + iso + con) * 1000; // ms

// Cycle automatique
setInterval(() => {
  if (phaseProgress < ecc * 1000) {
    phase = 'ecc';     // DESCENTE (cyan)
  } else if (phaseProgress < (ecc + iso) * 1000) {
    phase = 'iso';     // MAINTIEN (blanc)
  } else if (phaseProgress < totalRepDuration) {
    phase = 'con';     // MONTEE (fuchsia)
  } else {
    repsRemaining--;   // Nouvelle rep
    phaseProgress = 0;
  }
}, 50); // Tick 50ms pour fluidite
```

### 6.6 Timer Repos - Respiration 4-4-4-4

```javascript
// Cycle coherence cardiaque
const breathCycle = 16000; // 16 secondes total

if (breathProgress < 4000) {
  breathPhase = 'in';    // INSPIRER (cyan)
} else if (breathProgress < 8000) {
  breathPhase = 'hold';  // RETENIR (blanc)  
} else if (breathProgress < 12000) {
  breathPhase = 'out';   // EXPIRER (fuchsia)
} else {
  breathPhase = 'hold';  // RETENIR (blanc)
}
```

### 6.7 Barres Laterales Premium

Les deux barres verticales utilisent des gradients lisses :

```jsx
// Barre gauche (ECC - Cyan)
<div style={{
  background: 'linear-gradient(180deg, #22d3ee 0%, #0ea5e9 30%, #064e6e 70%, #021622 100%)',
  boxShadow: '0 0 40px rgba(34,211,238,0.5), inset 0 0 30px rgba(34,211,238,0.4)'
}} />

// Barre droite (CON - Fuchsia)  
<div style={{
  background: 'linear-gradient(180deg, #e879f9 0%, #c026d3 30%, #581c87 70%, #0f0518 100%)',
  boxShadow: '0 0 40px rgba(232,121,249,0.5), inset 0 0 30px rgba(232,121,249,0.4)'
}} />
```

**Remplissage dynamique :**
```javascript
const getEccFill = () => {
  if (isResting) {
    return breathPhase === 'in' ? (breathProgress / 4000) * 100 : 
           breathPhase === 'hold' && breathProgress < 8000 ? 100 : 0;
  }
  if (phase !== 'ecc') return phase === 'iso' ? 100 : 0;
  return (phaseProgress / (ecc * 1000)) * 100;
};
```

### 6.8 Halo Pulsant Central

```jsx
<div className={`absolute -inset-8 blur-[80px] rounded-full animate-pulse ${
  isResting 
    ? (breathPhase === 'in' ? 'bg-cyan-500/60' 
       : breathPhase === 'hold' ? 'bg-white/50' 
       : 'bg-fuchsia-500/60')
    : (phase === 'ecc' ? 'bg-cyan-500/60' 
       : phase === 'con' ? 'bg-fuchsia-500/60' 
       : 'bg-white/40')
}`} />
```

**Parametres modifiables :**
- `-inset-8` : Taille du spread (augmenter = plus grand)
- `blur-[80px]` : Intensite du flou (augmenter = plus diffus)
- `bg-xxx/60` : Opacite (60 = 60%)

### 6.9 Modifier les Styles (Sans Casser)

#### Couleurs sures a modifier

| Element | Classes/Styles | Fichier |
|---------|---------------|---------|
| Halo pulsant | `bg-cyan-500/60`, `bg-fuchsia-500/60` | session.html L470-477 |
| Barres gradient | `#22d3ee`, `#e879f9` | session.html L447, L640 |
| Badges phase | `bg-cyan-500/10`, `border-cyan-500/50` | session.html L460-464 |
| Boutons RPE | `backgroundColor`, `borderColor` | session.html L654-660 |
| Fond cards | `bg-slate-900/60`, `backdrop-blur` | session.html L388 |

#### NE PAS MODIFIER (Casse la logique)

| Element | Pourquoi |
|---------|----------|
| `ecc`, `iso`, `con` variables | Timing du timer |
| `phaseProgress`, `breathProgress` | Cycle automatique |
| `parseTempo()` | Conversion tempo |
| `getEccFill()`, `getConFill()` | Remplissage barres |
| Props de `ActiveSeriesModule` | Interface avec SessionPage |

### 6.10 Ajouter un Nouvel Effet Visuel

1. **Definir l'animation dans Tailwind config :**
```javascript
// session.html, dans tailwind.config
animation: {
  'monEffet': 'monEffet 2s ease-in-out infinite'
},
keyframes: {
  monEffet: {
    '0%, 100%': { opacity: '0.5' },
    '50%': { opacity: '1' }
  }
}
```

2. **Appliquer conditionnellement :**
```jsx
<div className={`animate-monEffet ${phase === 'ecc' ? 'visible' : 'hidden'}`} />
```

### 6.11 Compilation React/Babel

**Limitation connue :** Babel standalone compile en runtime, causant un ecran noir de 5-15 secondes au chargement.

**Pourquoi ce choix :**
- Pas de build step requis
- Compatible GitHub Pages (statique)
- Modification directe du JSX sans compilation

**Alternatives (non implementees) :**
- Pre-compilation avec Vite/Webpack
- React sans JSX (createElement)

### 6.12 Connexions entre Fichiers

```
program-data-v2.js  ──────────────────────────────────┐
  │                                                    │
  │ window.programData.getWeek()                       │
  │ window.programData.getWorkout()                    │
  │                                                    │
  ▼                                                    │
session.html ─────────────────────────────────────────┤
  │                                                    │
  │ weekNum ← URL param ?week= ou localStorage         │
  │ dayKey ← URL param ?day= ou 'dimanche'             │
  │                                                    │
  │ Charge: program-data-v2.js (script classique)      │
  │ Utilise: React 18 + Babel (ESM importmap)          │
  │                                                    │
  │ Sauvegarde → localStorage:                         │
  │   - last_session_data (pour debrief.html)          │
  │   - hybrid_xp (pour stats)                         │
  │   - neon_fit_workout_history (pour stats)          │
  │                                                    │
  └────────────────────────────────────────────────────┘
```

### 6.13 Tester les Differentes Semaines

```bash
# Semaine 1-5 (Tempo 3-1-2)
/session.html?week=3&day=dimanche

# Semaine 6 (Deload 4-1-2)
/session.html?week=6&day=mardi

# Semaine 7-11 (Rest-Pause 2-1-2)
/session.html?week=9&day=vendredi

# Semaine 13-17 (Drop-sets + Myo-reps)
/session.html?week=15&day=dimanche

# Semaine 19-23 (Clusters + Myo-reps + Partials)
/session.html?week=21&day=mardi
```

---

## 7. Systeme de Timer Guide

Le Timer Guide (`session-tempo.html`) guide l'utilisateur a travers les phases tempo d'une repetition.

### Phases

| Phase | Duree | Couleur | Description |
|-------|-------|---------|-------------|
| **DESCENTE** | 3 secondes | Cyan | Phase excentrique |
| **PAUSE** | 1 seconde | Magenta | Isometrique bas |
| **REMONTEE** | 2 secondes | Amber | Phase concentrique |

### Structure HTML

```html
<div id="timer-guide-overlay">
  <!-- Cercles concentriques -->
  <div class="ring ring-session">SESSION 1/4</div>
  <div class="ring ring-exercise">EXERCICE 3/8</div>
  <div class="ring ring-set">SERIE 2/4</div>
  <div class="ring ring-rep">REP 5/8</div>
  
  <!-- Barres de phases -->
  <div class="phase-bars">
    <div class="phase descent active">DESCENTE 3s</div>
    <div class="phase pause">PAUSE 1s</div>
    <div class="phase lift">REMONTEE 2s</div>
  </div>
</div>
```

### Animation CSS des phases

```css
@keyframes phase-progress {
  from { width: 0%; }
  to { width: 100%; }
}

.phase.active .progress-bar {
  animation: phase-progress 3s linear forwards;
}
```

### Vibrations

```javascript
function vibratePhase() {
  if (navigator.vibrate) {
    navigator.vibrate(100); // 100ms vibration
  }
}
```

---

## 7. Systeme de Timer Repos

Le Timer Repos apparait automatiquement apres validation d'une serie dans `session.html`.

### Design simplifie (V3.0)

- **1 seul cercle** progress avec gradient cyan->magenta
- Pas de particules (cause bugs iOS Safari)
- Animation via `stroke-dashoffset` JavaScript (pas CSS transitions)

### Structure HTML

```html
<div id="rest-overlay" class="fixed inset-0 z-50 hidden">
  <svg class="w-64 h-64">
    <!-- Cercle de fond -->
    <circle class="stroke-white/10" r="120" cx="128" cy="128" fill="none" stroke-width="8"/>
    
    <!-- Cercle de progression -->
    <circle id="rest-progress" 
            class="stroke-[url(#rest-gradient)]" 
            r="120" cx="128" cy="128" 
            fill="none" 
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray="754"
            stroke-dashoffset="0"
            transform="rotate(-90 128 128)"/>
  </svg>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="rest-gradient">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  
  <!-- Timer display -->
  <div id="rest-timer" class="text-6xl font-black">2:00</div>
</div>
```

### Animation JavaScript (IMPORTANT: pas de CSS transitions)

```javascript
function updateRestTimer() {
  const circle = document.getElementById('rest-progress');
  const circumference = 2 * Math.PI * 120; // 754
  const progress = timeRemaining / totalTime;
  const offset = circumference * (1 - progress);
  
  // Direct assignment, NO CSS transition
  circle.style.strokeDashoffset = offset;
}
```

### Pourquoi pas de CSS transitions ?

Sur iOS Safari, les transitions CSS sur `stroke-dashoffset` causent des bugs visuels :
- Cercles qui disparaissent
- Flash blanc
- Animation saccadee

**Solution** : Mettre a jour `strokeDashoffset` directement via JavaScript a chaque frame.

---

## 8. Systeme de Gamification XP

### Attribution XP

| Action | XP |
|--------|-----|
| Serie validee | +50 XP |
| Workout complete | +200 XP |
| Respect tempo | +10 XP bonus |

### Notification XP (Toast style)

Le +50 XP apparait en **toast en haut de l'ecran** (pas au centre).

```html
<div id="xp-flash" class="fixed top-20 left-1/2 -translate-x-1/2 z-[100]">
  <div class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-cyan-500/30">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
      <span class="text-lg font-black text-white">eclair</span>
    </div>
    <div>
      <div class="text-xl font-black bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">+50 XP</div>
      <div class="text-[10px] font-bold text-white/50 uppercase">Serie validee</div>
    </div>
  </div>
</div>
```

### Animation Toast

```css
@keyframes xp-toast {
  0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  15% { opacity: 1; transform: translateX(-50%) translateY(0); }
  85% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

.xp-flash {
  animation: xp-toast 1.5s ease-out forwards;
}
```

### Stockage XP

```javascript
// Lecture
const xp = parseInt(localStorage.getItem('hybrid_xp') || '0');

// Ecriture
localStorage.setItem('hybrid_xp', newXP.toString());
```

---

## 9. Cloud Sync Supabase

### Configuration

1. **Creer un projet Supabase** sur [supabase.com](https://supabase.com)

2. **Executer le schema SQL** (`supabase-schema.sql`)

3. **Configurer `config.js`** :
```javascript
window.NEONFIT_CONFIG = {
  SUPABASE_URL: 'https://votre-projet.supabase.co',
  SUPABASE_ANON_KEY: 'votre-anon-key-publique'
};
```

4. **Configurer les redirections** dans Supabase Dashboard :
   - Site URL : `https://ndsedf-stack.github.io/neon-fit2`
   - Redirect URLs : 
     - `https://ndsedf-stack.github.io/neon-fit2/index.html`

### Flux de sync

```
1. Clic "Sync Cloud" -> Modal auth s'ouvre
2. Email magic link OU OAuth (Google/GitHub)
3. Verification email -> Redirection auto
4. Sync automatique toutes les 60s
5. Donnees sauvegardees dans Supabase
```

### Securite

- L'`anon key` est **publique** (visible dans config.js)
- Protection via **Row Level Security (RLS)** dans Supabase
- Chaque utilisateur ne voit que SES donnees

---

## 10. Guide de modification

### Ajouter un exercice

Fichier : `program-data-v2.js`

```javascript
{
  id: 'w1_dim_new',
  name: "Goblet Squat",
  category: "compound",
  muscle: ["quadriceps", "fessiers"],
  sets: 3,
  reps: "10-12",
  weight: 20,
  rest: 90,
  tempo: "3-1-2",
  rpe: 7
}
```

### Ajouter une page

1. Creer `newpage.html` :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>NeonFit - Nouvelle Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: { neon: { cyan: '#22d3ee', magenta: '#c084fc' } }
        }
      }
    }
  </script>
</head>
<body class="bg-black text-white min-h-screen">
  <!-- Contenu -->
  <script src="program-data-v2.js"></script>
  <script src="app-v2.js"></script>
</body>
</html>
```

2. Ajouter au cache dans `sw.js` :
```javascript
const urlsToCache = [
  // ...existing pages
  '/newpage.html',
];
```

3. Mettre a jour la version :
```javascript
// version.js
window.APP_VERSION = Date.now().toString();

// sw.js
const CACHE_VERSION = 'v' + Date.now();
```

### Ajouter un widget stats (React)

Fichier : `stats.html`

```jsx
const MyNewWidget = ({ data }) => {
  return (
    <div className="bg-black border border-white/10 rounded-2xl overflow-hidden">
      <div className="bg-[#050505] px-4 py-3 border-b border-white/10">
        <h2 className="font-display font-bold text-white tracking-wider uppercase flex items-center gap-2">
          <Icon className="text-cyan-400" size={18} />
          TITRE WIDGET
        </h2>
      </div>
      <div className="p-4">
        {/* Contenu */}
      </div>
    </div>
  );
};
```

---

## 11. Palette de couleurs

### Variables CSS

```css
:root {
  --void: #020408;        /* Background principal */
  --void-soft: #0a0f14;   /* Background secondaire */
  --cyan: #22d3ee;        /* Couleur principale */
  --magenta: #c084fc;     /* Couleur accent */
  --amber: #f59e0b;       /* Warning/Force */
  --emerald: #10b981;     /* Success */
}
```

### Classes Tailwind

| Usage | Classes |
|-------|---------|
| **Texte cyan** | `text-cyan-400` |
| **Texte magenta** | `text-fuchsia-400` ou `text-purple-400` |
| **Fond noir** | `bg-black`, `bg-[#020408]` |
| **Bordure subtile** | `border-white/10`, `border-cyan-500/30` |
| **Glow cyan** | `shadow-[0_0_30px_rgba(34,211,238,0.3)]` |
| **Glow magenta** | `shadow-[0_0_30px_rgba(192,132,252,0.3)]` |

### Gradients

```html
<!-- Texte gradient -->
<span class="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">

<!-- Fond gradient -->
<div class="bg-gradient-to-br from-cyan-500 to-fuchsia-600">

<!-- Bordure gradient (via box) -->
<div class="bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-[1px] rounded-xl">
  <div class="bg-black rounded-xl">Contenu</div>
</div>
```

---

## 12. Animations et effets CSS

### Glass Card

```html
<div class="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl">
```

### Glow Effect

```html
<div class="shadow-[0_0_30px_rgba(34,211,238,0.3)]">
```

### Neon Text

```html
<span class="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
```

### Pulse Animation

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
  50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.6); }
}
```

### Nebula Background

```html
<div class="fixed -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none"></div>
<div class="fixed -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>
```

---

## 13. Compatibilite iOS Safari

### REGLE CRITIQUE : Scripts Classiques

**NE PAS UTILISER** ES6 modules sauf dans `session.html` :

```javascript
// INTERDIT (sauf session.html)
import programData from './program-data.js';

// OBLIGATOIRE
window.programData = programData;
// Puis dans HTML : <script src="program-data-v2.js"></script>
```

### Prefixes -webkit-

Toujours ajouter les prefixes :

```css
/* Backdrop filter */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* Animations */
@-webkit-keyframes myAnimation { }
@keyframes myAnimation { }

/* Transforms */
-webkit-transform: translateX(-50%);
transform: translateX(-50%);

/* Background clip */
-webkit-background-clip: text;
background-clip: text;
```

### Meta tags obligatoires

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### Safe Areas

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Checklist iOS

- [x] viewport-fit=cover
- [x] safe-area-inset padding
- [x] -webkit-backdrop-filter
- [x] -webkit-tap-highlight-color: transparent
- [x] -webkit-overflow-scrolling: touch
- [x] apple-mobile-web-app meta tags
- [x] Classic scripts (no ES6 modules)
- [x] Pas de CSS transitions sur SVG stroke-dashoffset

---

## 14. Formats de donnees

### LocalStorage Keys

| Cle | Type | Description |
|-----|------|-------------|
| `hybrid_xp` | number | Points XP utilisateur |
| `hybrid_current_week` | number | Semaine courante (1-4) |
| `neon_fit_workout_history` | array | Historique des series |
| `cloudSyncLastSync` | timestamp | Derniere sync cloud |

### Workout History Entry

```javascript
{
  id: 'uuid-v4',
  date: '2025-11-28',
  week: 1,
  day: 'dimanche',
  exercise: 'Trap Bar Deadlift',
  muscle: ['dos', 'jambes'],
  reps: 8,
  weight: 100,
  rpe: 7,
  tempo: '3-1-2',
  tempoRespected: true,
  tut: 48, // Time Under Tension en secondes
  completed: true,
  timestamp: 1732801234567
}
```

### Program Data Structure

```javascript
window.programData = {
  program: {
    week1: {
      weekNumber: 1,
      block: 1,
      technique: 'Tempo 3-1-2',
      rpeTarget: '6-7',
      dimanche: {
        name: 'DOS + JAMBES LOURDES + BRAS',
        duration: 68,
        totalSets: 31,
        exercises: [
          {
            id: 'w1_dim_1',
            name: 'Trap Bar Deadlift',
            category: 'compound',
            muscle: ['dos', 'jambes', 'fessiers'],
            sets: 5,
            reps: '6-8',
            weight: 75,
            rest: 120,
            tempo: '3-1-2'
          }
        ]
      }
    }
  }
}
```

### Stats Data API

```javascript
// Zones d'intensite
StatsData.getZonesData() => [
  { id: 'force', label: 'FORCE', range: '1-5 RM', percent: 25, sets: 10, color: 'bg-amber-500' },
  { id: 'hyper', label: 'HYPERTROPHIE', range: '6-12 RM', percent: 50, sets: 20, color: 'bg-violet-500' },
  { id: 'endu', label: 'ENDURANCE', range: '15+ RM', percent: 25, sets: 10, color: 'bg-cyan-500' }
]

// Muscles
StatsData.getMusclesData() => [
  { id: 'm1', name: 'DOS', volume: 15000, color: '#3b82f6' },
  { id: 'm2', name: 'PECTORAUX', volume: 12000, color: '#22d3ee' }
]

// Resume global
StatsData.getSummary() => {
  score: 75,
  sessions: 3,
  maxSessions: 5,
  sets: 45,
  maxSets: 60,
  volume: 25000,
  xp: 1500
}
```

---

## 15. Problemes connus et solutions

### Timer Repos disparait sur iOS

**Probleme** : Le cercle de progression clignote ou disparait  
**Cause** : CSS transitions sur `stroke-dashoffset`  
**Solution** : Mettre a jour via JavaScript sans transition

```javascript
// CORRECT
circle.style.strokeDashoffset = offset;

// INCORRECT
circle.style.transition = 'stroke-dashoffset 1s';
```

### XP Flash au centre de l'ecran

**Probleme** : Le +50 XP masque le timer  
**Solution** : Utiliser un toast en haut (`top-20`)

### Cache Safari tenace

**Probleme** : Modifications non visibles sur iPhone  
**Solutions** :
1. Mettre a jour `version.js` et `sw.js`
2. Navigation privee
3. Reglages Safari -> Effacer donnees

### Modules ES6 undefined

**Probleme** : `window.programData` = undefined  
**Solution** : Utiliser scripts classiques + `window.X = X`

### Jauges ovales sur Stats

**Probleme** : Canvas pas carre  
**Solution** : `Math.min(width, height)` pour ratio 1:1

---

## 16. Conventions de code

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `currentExercise` |
| Fonctions | camelCase | `updateTimer()` |
| Constantes | UPPER_SNAKE | `XP_PER_SET` |
| Classes CSS | kebab-case | `timer-guide-overlay` |
| IDs HTML | kebab-case | `rest-timer` |

### Indentation

- 2 espaces (pas de tabs)

### Commits

Style Gitmoji :
- `feat` : Nouvelle fonctionnalite
- `fix` : Bug fix
- `style` : Style/UI
- `refactor` : Refactoring
- `docs` : Documentation

```bash
git commit -m "feat: add timer guide phases"
git commit -m "fix: iOS Safari timer rendering"
git commit -m "style: update XP toast position"
```

### Structure des fichiers

- Pas de fichiers > 500 lignes (split si necessaire)
- CSS inline pour composants uniques
- CSS externe pour styles reutilisables
- JavaScript en bas de page (avant `</body>`)

---

## Auteur

**Nicolas Di Stefano**  
GitHub: [@ndsedf-stack](https://github.com/ndsedf-stack)

---

*Derniere mise a jour : 28 novembre 2025*  
*Version : 3.0 - Timer Guide + Cloud Sync*  
*Status : PRODUCTION READY*
