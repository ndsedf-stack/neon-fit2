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
├── session.html            # Session active
├── stats.html              # Statistiques React
├── briefing.html           # Mission Briefing
│
├── app-v2.js               # Module utilitaires (global)
├── program-data-v2.js      # Données programme (global)
├── workout-history.js      # Historique workouts (global)
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

## Recent Changes (Replit Import)
- Updated service worker path from `/neon-fit2/sw.js` to `/sw.js`
- Configured http-server workflow on port 5000
- Added Replit deployment configuration
