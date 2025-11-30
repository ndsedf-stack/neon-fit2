# NEON FIT V3.1 Elite - Replit Configuration

**Version**: 3.1 - ActiveSeriesModule React + Timer Premium  
**Last Update**: 30 novembre 2025

## Quick Start

```bash
node server/index.js
# App runs on port 5000
# Main pages: index.html, session.html, briefing.html, debrief.html, stats.html
```

## File Structure

```
.
├── server/                   # Backend Express.js
│   ├── index.js              # Main server, routes, static files
│   ├── replitAuth.js         # Replit Auth (OpenID Connect)
│   └── db.js                 # PostgreSQL connection
│
│── MAIN PAGES ────────────────────────────────────
├── index.html                # Dashboard (QG) - Rank, stats, protocol, missions
├── workouts.html             # Workout list (OPS)
├── briefing.html             # Mission Briefing - Exercise details
├── session.html              # Active session + Rest Timer
├── debrief.html              # Mission Complete - Post-workout summary
├── stats.html                # Stats React page with visualizations
│
│── SHARED MODULES ────────────────────────────────
├── app.js                    # ES6 module (session.html only)
├── app-v2.js                 # Classic script version + Gamification
├── program-data.js           # ES6 module + window.programData
├── program-data-v2.js        # Classic script version (26 weeks)
├── stats-data.js             # Stats hub (StatsData API) → stats.html
├── starfield.js              # Animated starfield canvas (shared)
├── scramble-effect.js        # Text scramble animation
│
├── config.js                 # Supabase configuration
├── cloud-sync-supabase.js    # Cloud sync logic
├── sw.js                     # Service Worker
├── version.js                # Cache version
└── README.md                 # Full documentation
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JS, TailwindCSS CDN
- **Stats**: React 18 + Babel (in-browser)
- **Backend**: Express.js + Replit Auth
- **Database**: PostgreSQL (Neon-backed)
- **Storage**: LocalStorage + Supabase Cloud

## User Preferences

- Language: French (FR)
- Indentation: 2 spaces
- JS naming: camelCase
- Design: Refined cyberpunk aesthetic, no visual overload
- No audio/vibration feedback (visual-only)

## Recent Changes (Nov 30, 2025) - V3.1

### ActiveSeriesModule Timer (session.html)
- **React + Babel** : Composant React compile in-browser (5-15s ecran noir au chargement = normal)
- **parseTempo()** : Convertit "3-1-2" string → {ecc: 3, iso: 1, con: 2} object
- **Donnees dynamiques** : Tempo, repos, charge lus depuis `currentExercise` (plus de valeurs hardcodees)
- **Affichage enrichi** : Nom exercice, badge SUPERSET, badge technique, badge DELOAD
- **Barres laterales premium** : Gradients lisses cyan/fuchsia avec inner glow
- **Halo pulsant central** : blur-[80px], -inset-8, opacite 50-60%, sync phases

### Problemes resolus V3.0 → V3.1
| Avant | Apres |
|-------|-------|
| tempo lu depuis weekData (n'existe pas) | tempo lu depuis currentExercise.tempo |
| rest toujours 90s | rest depuis currentExercise.rest (75-120s) |
| load hardcode 60kg | load depuis currentExercise.weight |
| Pas d'info superset | Badge "SUPERSET → partner" |
| Technique invisible | Badge technique (Rest-Pause, Drop-sets...) |

### Design Updates
- **Animated Starfield Background**: Canvas-based starfield with 250 stars moving upward, cyan/purple colored stars for cyberpunk aesthetic
- **Ultra-Transparent Glass Cards**: All UI cards use extreme transparency (0.003-0.008 opacity) with 30px backdrop blur
- **Shared starfield.js Module**: Reusable starfield canvas applied to all pages (index, workouts, briefing, debrief, session, stats)
- New cleaner dashboard with protocol widget and quick stats
- Debrief page with confetti animation and session summary
- Session redirects to debrief.html on completion
- Lightning icon in navbar for quick mission launch

## iOS Safari Compatibility (CRITICAL)

Use **classic scripts** (NOT ES6 modules) for all pages except session.html:

```javascript
// In JS file:
window.MyModule = MyModule;

// In HTML:
<script src="my-module.js"></script>
```

Always add webkit prefixes:

```css
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

## Color Palette

```css
--void: #020408;      /* Background */
--cyan: #22d3ee;      /* Primary */
--purple: #c084fc;    /* Accent */
--amber: #f59e0b;     /* Warning */
--green: #22c55e;     /* Success */
```

## Navigation Flow

```
index.html (QG)
    ├── "Lancer Mission" → briefing.html → session.html → debrief.html → index.html
    ├── Quick Launch (⚡) → session.html directly
    ├── OPS → workouts.html
    ├── STATS → stats.html
    └── ID → profile/auth
```

## Military Ranks

| Rang | XP Min | XP Max |
|------|--------|--------|
| Recrue | 0 | 999 |
| Operateur | 1000 | 4999 |
| Specialiste | 5000 | 14999 |
| Commando | 15000 | 34999 |
| Elite | 35000 | 74999 |
| Legende | 75000 | 149999 |
| Titan | 150000 | - |

## Block Techniques (26 weeks)

| Block | Weeks | Technique | RPE |
|-------|-------|-----------|-----|
| 1 | 1-5 | Tempo 3-1-2 | 6-7 |
| 2 | 7-11 | Rest-Pause | 7-8 |
| 3 | 13-17 | Drop-sets + Myo-reps | 8 |
| 4 | 19-23 | Clusters + Myo-reps + Partials | 8-9 |
| Deload | 6,12,18,24,26 | Recovery | 5-6 |

## LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| hybrid_xp | number | User XP total |
| hybrid_current_week | number | Week 1-26 |
| hybrid_streak | number | Consecutive days |
| neon_fit_workout_history | array | Workout entries |
| last_session_data | object | Last completed session for debrief |
| completed_days_week_X | array | Completed days for week X |

## Session → Debrief Data Contract

When session.html completes a workout, it stores:

```javascript
localStorage.setItem('last_session_data', JSON.stringify({
  name: "DOS + JAMBES",      // Workout name
  duration: 45,               // Duration in minutes
  week: 1,                    // Week number (1-26)
  day: "mardi",               // Day key
  exercises: 5,               // Number of exercises
  completedAt: "2024-11-29T12:00:00.000Z"  // ISO timestamp
}));
```

Debrief.html reads this data and combines it with:
- `neon_fit_workout_history`: For detailed sets/reps/volume
- `hybrid_xp`: For rank progression display

## Cache Busting

Update both files when making changes:

```javascript
// version.js
window.APP_VERSION = 'timestamp';

// sw.js
const CACHE_VERSION = 'vtimestamp';
```

## Stats System Architecture

### Fichiers lies

```
session.html → localStorage → stats-data.js → stats.html (React)
```

### StatsData API (stats-data.js)

| Methode | Description |
|---------|-------------|
| `getHistory()` | Array de series completees |
| `getSummary()` | {score, sessions, sets, volume, xp} |
| `getZonesData()` | Force/Hypertrophie/Endurance % |
| `getMusclesData()` | Volume par groupe musculaire |
| `getMusclesHUD()` | Format normalise pour composants |
| `getWeeksData()` | Donnees 4 semaines pour radar |
| `getDailyActivity()` | 7 derniers jours |
| `getChallengesData()` | Challenges actifs |
| `exportAllData()` | JSON backup |
| `importAllData(json)` | Restaurer backup |

### 22 Composants Stats (stats.html)

| Section | Couleur | Composants |
|---------|---------|------------|
| Command Center | Vert | 1 |
| Core Essentials | Cyan | 8 |
| Premium Analytics | Fuchsia | 10 |
| Extra | Amber | 2 |
| Legacy | Gris | 1 |

### Ajouter un composant

1. Creer composant React dans stats.html
2. (Optionnel) Ajouter methode dans stats-data.js
3. Inserer dans StatsPage au bon endroit

### Format donnee workout (localStorage)

```javascript
{
  id: "uuid",
  exercise: "Tirage vertical",
  weight: 60,
  reps: 10,
  week: 3,
  day: "lundi",
  muscle: ["dos"],
  completedAt: "ISO-date"
}
```

## ActiveSeriesModule - Guide Modification

### Flux de donnees Timer

```
program-data-v2.js → SessionPage → ActiveSeriesModule
       ↓                  ↓              ↓
  getWorkout()      parseTempo()    Timer phases
       ↓                  ↓              ↓
  exercises[]     {ecc, iso, con}   UI rendering
```

### Modifier les styles SAFE

| Element | Ou modifier | Exemple |
|---------|-------------|---------|
| Halo couleur | session.html L470-477 | `bg-cyan-500/60` → `bg-blue-500/60` |
| Halo taille | session.html L469 | `-inset-8` → `-inset-12` |
| Halo blur | session.html L469 | `blur-[80px]` → `blur-[100px]` |
| Barre cyan gradient | session.html L447 | Modifier les couleurs hex |
| Barre fuchsia gradient | session.html L640 | Modifier les couleurs hex |
| Badges phase | session.html L460-464 | Classes Tailwind bg/border |

### NE PAS toucher (casse le timer)

- `parseTempo()` function
- `ecc`, `iso`, `con` variables
- `phaseProgress`, `breathProgress` state
- `getEccFill()`, `getConFill()` functions
- Props interface ActiveSeriesModule

### Tester differentes semaines

```bash
# Tempo 3-1-2 (semaines 1-5)
/session.html?week=3&day=dimanche

# Rest-Pause (semaines 7-11)  
/session.html?week=9&day=mardi

# Drop-sets (semaines 13-17)
/session.html?week=15&day=vendredi

# Clusters (semaines 19-23)
/session.html?week=21&day=dimanche

# Deload (semaines 6,12,18,24,26)
/session.html?week=6&day=dimanche
```

### Connexions fichiers critiques

| Fichier | Depend de | Utilise par |
|---------|-----------|-------------|
| program-data-v2.js | - | session.html, briefing.html, workouts.html |
| session.html | program-data-v2.js | debrief.html (via localStorage) |
| stats-data.js | localStorage | stats.html |

### Ecran noir au chargement session.html

**C'est normal!** Babel compile le JSX en runtime = 5-15 secondes d'attente.

Pas de solution sans migration vers build-step (Vite/Webpack).

## See README.md for full documentation
