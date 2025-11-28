# NEON FIT V3.0 - Replit Configuration

## Project Overview
NEON FIT is a Progressive Web App (PWA) for fitness tracking with a cyberpunk/sci-fi aesthetic.

**Version**: V3.0 - Architecture Modulaire Stabilisée  
**Original Repository**: ndsedf-stack/neon-fit2  
**Type**: Static frontend web application  

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: TailwindCSS (CDN)
- **Storage**: LocalStorage (no backend)
- **Architecture**: Classic scripts (non ES6 modules for Safari compatibility)
- **Server**: http-server on port 5000

## Project Structure
```
.
├── index.html              # Dashboard principal
├── workouts.html           # Liste des workouts
├── session.html            # Session active (ES6 modules)
├── stats.html              # Statistiques React
├── briefing.html           # Mission Briefing
│
├── app-v2.js               # Classic script - utilitaires (window.X)
├── program-data-v2.js      # Classic script - données (window.X)
├── app.js                  # ES6 module version of app-v2.js
├── program-data.js         # ES6 module version of program-data-v2.js
├── workout-history.js      # Historique workouts (both versions)
├── briefing-integration.js # Override boutons scan
├── sw.js                   # Service Worker
└── version.js              # Version tracking
```

## Development Setup

### Running Locally
The app runs on port 5000 using http-server with CORS enabled:
```bash
npx http-server -p 5000 --cors -a 0.0.0.0
```

This is configured in the Replit workflow and starts automatically.

### Key Features
1. **Gamification System**: XP, levels, ranks
2. **Workout Tracker**: Hybrid Performance Method
3. **Mission Briefing System**: Immersive pre-workout interface
4. **Progress Stats**: Visual tracking and history
5. **PWA Support**: Service worker for offline capability

## Important Notes

### Safari Compatibility
The project uses **classic scripts** instead of ES6 modules because Safari blocks ES6 modules when served via http-server. All JavaScript files expose their exports via `window`:

```javascript
// In JavaScript files:
window.programData = programData;
window.Gamification = Gamification;
window.Utils = Utils;

// In HTML:
<script src="program-data-v2.js"></script>
<script src="app-v2.js"></script>
```

### Cache Management
The service worker is configured to force refresh resources and prevent caching issues. Script URLs include version timestamps to bust cache:

```html
<script src="program-data-v2.js?v=1764336042"></script>
```

### LocalStorage Data
All user data is stored in LocalStorage:
- `hybrid_xp`: User XP points
- `hybrid_current_week`: Current week number
- `hybrid_workout_history`: Workout completion history

## Deployment
This is a static site that can be deployed using Replit's static deployment option. No server-side processing is required.

## Maintenance
- The app is production-ready as-is
- All pages use consistent styling and animations
- No build process required - just serve the HTML/JS/CSS files

## User Preferences
- Language: French (FR)
- Conventions: 2 spaces indentation, camelCase JS
- Commit style: Gitmoji (✨ feature, 🐛 bug, 📝 docs)

## iOS/iPhone Compatibility
All pages include iOS Safari optimizations:
- `viewport-fit=cover` for full-screen on notched devices
- `env(safe-area-inset-*)` padding for notch and home indicator
- `-webkit-backdrop-filter` prefixes for blur effects
- `-webkit-tap-highlight-color: transparent` for clean taps
- `-webkit-overflow-scrolling: touch` for smooth scrolling
- Apple Web App meta tags for PWA homescreen support

## Recent Changes (Replit Import)
- Updated service worker path from `/neon-fit2/sw.js` to `/sw.js`
- Configured http-server workflow on port 5000
- Added Replit deployment configuration
- Created ES6 module versions (app.js, program-data.js) for session.html
- Added iOS Safari compatibility (viewport-fit, safe-area, webkit prefixes)
- Fixed all pages to work with program-data integration

## Stats & Backup System (November 2025)
- Created `stats-data.js` module for aggregating workout data into:
  - Intensity zones (Force/Hypertrophie/Endurance)
  - Muscle volume distribution with mapping to muscle groups
  - Weekly summaries with scores and metrics
- Refactored `stats.html` React components to use real WorkoutHistory data
- Added Export/Import JSON buttons in stats header for manual backups
- Created `workout-history-v2.js` (classic script version for Safari compatibility)
- Updated `briefing.html` with real-time progress circles showing workout completion status

## Script Architecture
- **Classic scripts (non-module)**: app-v2.js, program-data-v2.js, workout-history-v2.js, stats-data.js, cloud-sync.js
- **ES6 modules**: app.js, program-data.js, workout-history.js (used only in session.html)
- All classic scripts expose via `window` object for cross-script access

## Cloud Sync & Authentication (November 2025)
- **Server**: Express.js server with Replit Auth (supports Apple ID, Google, GitHub, email)
- **Database**: PostgreSQL with tables: users, sessions, workout_data
- **API Endpoints**:
  - `GET /api/auth/status` - Check authentication status
  - `GET /api/login` - Initiate login flow
  - `GET /api/logout` - Logout user
  - `GET /api/sync/data` - Pull all workout data from cloud
  - `POST /api/sync/data` - Push single data key to cloud
  - `POST /api/sync/bulk` - Push all workout data to cloud
- **Frontend**: cloud-sync.js module handles auth UI and automatic sync
- **Auto-sync**: Data syncs every 60 seconds when authenticated
- **Offline-first**: LocalStorage used as primary, cloud as backup
