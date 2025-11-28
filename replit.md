# NEON FIT V3.0 - Replit Configuration

## Quick Start

```bash
node server/index.js
# App runs on port 5000
```

## File Structure

```
.
├── server/                   # Backend Express.js
│   ├── index.js              # Main server, routes, static files
│   ├── replitAuth.js         # Replit Auth (OpenID Connect)
│   └── db.js                 # PostgreSQL connection
│
├── index.html                # Dashboard (QG)
├── workouts.html             # Workout list (OPS)
├── briefing.html             # Mission Briefing
├── session.html              # Active session + Rest Timer
├── session-tempo.html        # Timer Guide with tempo phases
├── stats.html                # Stats React page
│
├── app.js                    # ES6 module (session.html only)
├── app-v2.js                 # Classic script version
├── program-data.js           # ES6 module (session.html only)
├── program-data-v2.js        # Classic script version
├── workout-history.js        # ES6 module (session.html only)
├── workout-history-v2.js     # Classic script version
├── stats-data.js             # Stats aggregation
├── briefing-integration.js   # Briefing handlers
│
├── config.js                 # Supabase configuration
├── cloud-sync-supabase.js    # Cloud sync logic
├── supabase-schema.sql       # SQL schema reference
│
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
- Commits: Gitmoji

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

-webkit-transform: translateX(-50%);
transform: translateX(-50%);
```

## Color Palette

```css
--void: #020408;      /* Background */
--cyan: #22d3ee;      /* Primary */
--magenta: #c084fc;   /* Accent */
--amber: #f59e0b;     /* Warning */
```

## Timer System Notes

### Rest Timer (session.html)

- Single circle with gradient stroke
- NO CSS transitions on stroke-dashoffset (causes iOS bugs)
- Update via JavaScript directly

### Timer Guide (session-tempo.html)

- 3 phases: Descente (3s) -> Pause (1s) -> Remontee (2s)
- Animated progress bars
- Vibration feedback

## XP Toast

Position: top-20 (not center)
Style: Glass card with icon

## Cache Busting

Update both files when making changes:

```javascript
// version.js
window.APP_VERSION = 'timestamp';

// sw.js
const CACHE_VERSION = 'vtimestamp';
```

## LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| hybrid_xp | number | User XP |
| hybrid_current_week | number | Week 1-4 |
| neon_fit_workout_history | array | Workout entries |

## See README.md for full documentation
