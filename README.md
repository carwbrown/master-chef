# Master Chef

A dual-purpose web tool for gaming stats and recipe management.

**Live:** [mcc-recipe.netlify.app](https://mcc-recipe.netlify.app)

## Tech Stack

- **Frontend:** Vanilla HTML + CSS + JavaScript (Web Components)
- **Backend:** PocketBase (SQLite with REST API)
- **OCR:** Tesseract.js (client-side, for game screenshots)
- **Hosting:** Netlify (frontend) + GCP (backend)

## Features

- **Game Stats:** Upload screenshots, extract stats via OCR, track MMR
- **Recipes:** Save recipes from URLs, organize your collection

## Local Development

### Prerequisites
- [PocketBase](https://pocketbase.io/docs/) (`brew install pocketbase` on Mac)

### Quick Start

```bash
# 1. Start PocketBase (Terminal 1)
pocketbase serve
# Admin UI: http://127.0.0.1:8090/_/

# 2. Serve frontend (Terminal 2)
python3 -m http.server 8000

# 3. Open http://localhost:8000
```

### First Time PocketBase Setup

1. Open Admin UI at `http://127.0.0.1:8090/_/`
2. Create admin account
3. Create `recipes` collection (user, title, source_url, ingredients, instructions, prep_time, cook_time, servings, tags)
4. Create `scores` collection (user, gamertag, game, kills, deaths, assists, score, mmr)
5. Set API rules for user-owned data

## File Structure

```
master-chef/
├── login.html              # Authentication
├── recipes.html            # Recipe list
├── recipe-upload.html      # Add recipe
├── recipe-view.html        # View recipe
├── recipe-edit.html        # Edit recipe
├── leaderboard.html        # Game stats (terminal theme)
├── scripts/
│   ├── config.js           # PocketBase URL
│   └── auth.js             # Auth helpers
└── components/
    ├── login-form.js       # Login web component
    └── recipe-card.js      # Recipe card web component
```

## Dual Theme System

- **Terminal Theme:** Green phosphor CRT aesthetic for game stats
- **Recipe Book Theme:** Clean serif typography for recipes

## Deployment

- **Frontend:** Netlify (auto-deploy from GitHub)
- **Backend:** See [docs/GCP_DEPLOYMENT.md](docs/GCP_DEPLOYMENT.md)
