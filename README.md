# NEON FIT V3.0 - PWA Fitness Tracker Cyberpunk

**Date de mise a jour** : 28 novembre 2025  
**Version** : V3.0 - Timer Guide + Cloud Sync Supabase  
**Repo GitHub** : [ndsedf-stack/neon-fit2](https://github.com/ndsedf-stack/neon-fit2)  
**Live Demo** : [ndsedf-stack.github.io/neon-fit2](https://ndsedf-stack.github.io/neon-fit2)

---

## Table des Matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Technologies utilisees](#3-technologies-utilisees)
4. [Installation et lancement](#4-installation-et-lancement)
5. [Pages de l'application](#5-pages-de-lapplication)
6. [Systeme de Timer Guide](#6-systeme-de-timer-guide)
7. [Systeme de Timer Repos](#7-systeme-de-timer-repos)
8. [Systeme de Gamification XP](#8-systeme-de-gamification-xp)
9. [Cloud Sync Supabase](#9-cloud-sync-supabase)
10. [Guide de modification](#10-guide-de-modification)
11. [Palette de couleurs](#11-palette-de-couleurs)
12. [Animations et effets CSS](#12-animations-et-effets-css)
13. [Compatibilite iOS Safari](#13-compatibilite-ios-safari)
14. [Formats de donnees](#14-formats-de-donnees)
15. [Problemes connus et solutions](#15-problemes-connus-et-solutions)
16. [Conventions de code](#16-conventions-de-code)

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

Widgets React avec visualisations :
- **NeonTracker** - Jauge radiale (score, sessions, sets)
- **WeeklyProgress** - Progression hebdomadaire
- **MuscleMatrix** - Repartition musculaire HUD
- **Bio-Metrics** - 6 groupes musculaires
- **IntensityZones** - Force/Hypertrophie/Endurance
- **MuscleTurbine** - Roue rotative des volumes

---

## 6. Systeme de Timer Guide

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
