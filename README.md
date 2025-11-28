# 🔥 NEON FIT V3.0 - PWA Fitness Tracker Cyberpunk

**Date de dernière mise à jour** : 28 novembre 2025  
**Version actuelle** : V3.0 - Cloud Sync Supabase  
**Repo GitHub** : [ndsedf-stack/neon-fit2](https://github.com/ndsedf-stack/neon-fit2)  
**Live Demo** : [ndsedf-stack.github.io/neon-fit2](https://ndsedf-stack.github.io/neon-fit2)

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Installation](#-installation)
- [Cloud Sync Supabase](#-cloud-sync-supabase)
- [Guide de modification](#-guide-de-modification)
- [Problèmes connus et solutions](#-problèmes-connus-et-solutions)
- [Roadmap](#-roadmap)

---

## 🎯 Vue d'ensemble

NEON FIT est une **Progressive Web App (PWA)** de suivi d'entraînement avec esthétique **cyberpunk/sci-fi**. Elle combine :

- 🎮 **Système de gamification** (XP, levels, ranks)
- 💪 **Tracker de workout complet** (Hybrid Performance Method - 4 semaines)
- 🖥️ **Interface type HUD** (Heads-Up Display) futuriste
- 🎯 **Mission Briefing System** immersif pré-workout
- ☁️ **Cloud Sync** via Supabase (magic link + OAuth)

### Technologies

| Catégorie | Technologie |
|-----------|-------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Stats Page | React 18 + Babel (in-browser) |
| Styling | TailwindCSS (CDN) + Custom CSS |
| Storage | LocalStorage (offline-first) + Supabase Cloud |
| Auth | Supabase Auth (Magic Link, Google, GitHub) |
| Hosting | GitHub Pages / Vercel (statique) |

---

## ✨ Fonctionnalités

### Pages Principales

| Page | Description |
|------|-------------|
| `index.html` | Dashboard QG - Vue d'ensemble, XP, semaine courante |
| `workouts.html` | Liste OPS - Tous les workouts de la semaine |
| `briefing.html` | Mission Briefing - Détails pré-workout immersif |
| `session.html` | Session active - Timer, sets, validation |
| `stats.html` | Statistiques React - Visualisations avancées |

### Widgets Stats (React)

- **NeonTracker** - Jauge radiale (score, sessions, sets)
- **WeeklyProgress** - Progression hebdomadaire
- **MuscleMatrix** - Répartition musculaire HUD
- **Bio-Metrics** - 6 groupes musculaires (DOS, PECTORAUX, JAMBES, ÉPAULES, BRAS, ABDOS)
- **IntensityZones** - Force / Hypertrophie / Endurance
- **MuscleTurbine** - Roue rotative des volumes

---

## 🏗️ Architecture Technique

### Structure des Fichiers

```
neon-fit2/
├── index.html              # Dashboard principal (QG)
├── workouts.html           # Liste des workouts (OPS)
├── session.html            # Session d'entraînement active
├── stats.html              # Statistiques React (STATS)
├── briefing.html           # Mission Briefing pre-workout
│
├── app-v2.js               # Gamification, Utils, UI helpers
├── program-data-v2.js      # Programme 4 semaines complet
├── workout-history-v2.js   # CRUD historique workouts
├── stats-data.js           # Agrégation stats depuis historique
├── briefing-integration.js # Handlers boutons briefing
│
├── config.js               # Configuration Supabase (URL + anon key)
├── cloud-sync-supabase.js  # Auth UI + sync cloud logic
├── supabase-schema.sql     # Schéma SQL pour Supabase
│
├── sw.js                   # Service Worker PWA
├── version.js              # Timestamp version (cache busting)
├── manifest.json           # PWA manifest
└── README.md               # Cette documentation
```

### Flux de Données

```
LocalStorage (offline-first)
     ↕ sync
Supabase Cloud (PostgreSQL)
     ↕ auth
Magic Link / OAuth (Google, GitHub)
```

---

## 🚀 Installation

### Développement Local

```bash
# Cloner le repo
git clone https://github.com/ndsedf-stack/neon-fit2.git
cd neon-fit2

# Serveur local (option 1 - Node)
npx http-server -p 8000 --cors

# Serveur local (option 2 - Python)
python3 -m http.server 8000

# Ouvrir dans le navigateur
open http://localhost:8000
```

### Déploiement GitHub Pages

```bash
# Les fichiers sont servis directement depuis main
git push origin main
# → Disponible sur https://[username].github.io/neon-fit2
```

---

## ☁️ Cloud Sync Supabase

### Configuration

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)

2. **Exécuter le schéma SQL** :
```sql
-- Copier le contenu de supabase-schema.sql dans l'éditeur SQL Supabase
```

3. **Configurer l'authentification** :
   - Dashboard Supabase → Authentication → Providers
   - Activer Email (Magic Link)
   - Optionnel : Google, GitHub OAuth

4. **Mettre à jour config.js** :
```javascript
window.NEONFIT_CONFIG = {
  SUPABASE_URL: 'https://votre-projet.supabase.co',
  SUPABASE_ANON_KEY: 'votre-anon-key-publique'
};
```

5. **Configurer les URL de redirection** :
   - Dashboard → Authentication → URL Configuration
   - Site URL : `https://ndsedf-stack.github.io/neon-fit2`
   - Redirect URLs : 
     - `https://ndsedf-stack.github.io/neon-fit2/index.html`
     - `https://neon-fit2.vercel.app/index.html`

### Fonctionnement

```
1. Clic sur "Sync Cloud" → Modal auth s'ouvre
2. Email magic link OU OAuth (Google/GitHub)
3. Vérification email → Redirection auto
4. Sync automatique toutes les 60s
5. Données sauvegardées dans Supabase
```

### Sécurité

- L'`anon key` est **publique** (visible dans config.js)
- Protection via **Row Level Security (RLS)** dans Supabase
- Chaque utilisateur ne voit que SES données

---

## 📖 Guide de Modification

### Compatibilité Safari iOS (CRITIQUE)

Utiliser des **scripts classiques** (PAS de modules ES6) :

```javascript
// ❌ NE PAS FAIRE
import programData from './program-data.js';

// ✅ FAIRE
window.programData = programData;
// Puis dans HTML : <script src="program-data-v2.js"></script>
```

### Palette de Couleurs

```css
/* Cyberpunk Theme */
--cyan: #22d3ee;      /* Principal */
--magenta: #d946ef;   /* Accent */
--amber: #f59e0b;     /* Warning */
--emerald: #10b981;   /* Success */
--void: #020408;      /* Background */
```

### Ajouter un Exercice

Fichier : `program-data-v2.js`

```javascript
{
  name: "Goblet Squat",
  sets: 3,
  reps: 12,
  rest: 120,
  weight: 20,
  tempo: "3-1-1-0",
  rpe: 7,
  muscle: ["quadriceps", "fessiers"],
  category: "Compound"
}
```

### Forcer le Rechargement Cache

```html
<!-- Incrémenter ?v=X à chaque modification -->
<script src="app-v2.js?v=6"></script>
```

Ou mettre à jour `version.js` :
```javascript
window.NEONFIT_VERSION = Date.now();
```

---

## 🐛 Problèmes Connus et Solutions

### 1. Jauges ovales sur Stats

**Problème** : Canvas ne maintient pas le ratio 1:1  
**Solution** : `Math.min(width, height)` pour dimensions carrées

### 2. Bio-Metrics affiche 0 groupes

**Problème** : Pas de données = pas d'affichage  
**Solution** : Seed avec 6 groupes musculaires par défaut dans `stats-data.js`

### 3. Cache Safari tenace

**Problème** : Modifications non visibles sur iPhone  
**Solutions** :
- Versioning `?v=X` sur les scripts
- Navigation privée
- Réglages Safari → Effacer données

### 4. Modules ES6 ne chargent pas

**Problème** : `window.programData` = undefined  
**Solution** : Scripts classiques + `window.X = X`

---

## 🗺️ Roadmap

### ✅ Complété (V3.0)

- [x] Architecture modulaire
- [x] Mission Briefing System
- [x] Stats React avec visualisations
- [x] Cloud Sync Supabase
- [x] Magic Link authentication
- [x] PWA Service Worker
- [x] 6 groupes musculaires dans Bio-Metrics
- [x] Jauges rondes (ratio 1:1)

### 🔜 À Venir

- [ ] Charts progression (Line/Bar charts)
- [ ] Mode offline complet
- [ ] Notifications push
- [ ] Export données CSV
- [ ] Dark/Light mode toggle
- [ ] AI coaching suggestions

---

## 📊 Métriques Projet

| Métrique | Valeur |
|----------|--------|
| Lignes de code | ~7,500 |
| Fichiers JS | 7 |
| Pages HTML | 5 |
| Taille totale | ~900KB |

---

## 🤝 Contribution

```bash
# Fork → Clone → Branch
git checkout -b feature/ma-feature

# Développer + tester
npx http-server -p 8000 --cors

# Commit Gitmoji
git commit -m "✨ Add new feature"

# Push + PR
git push origin feature/ma-feature
```

### Conventions

- **Commits** : Gitmoji (✨ feature, 🐛 bug, 📝 docs)
- **Code** : 2 espaces, camelCase
- **Langue** : Français (UI), Anglais (code)

---

## 📄 License

Projet personnel - Tous droits réservés

---

## 👤 Auteur

**Nicolas Di Stefano**  
GitHub: [@ndsedf-stack](https://github.com/ndsedf-stack)

---

## 🙏 Remerciements

- **Claude AI** : Architecture, debug, documentation
- **Supabase** : Backend-as-a-Service
- **TailwindCSS** : Framework CSS
- **Hybrid Performance Method** : Programme d'entraînement

---

*Dernière mise à jour : 28 novembre 2025 - Cloud Sync Supabase opérationnel*  
*Status : ✅ PRODUCTION READY*
