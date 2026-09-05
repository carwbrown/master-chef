# Master Chef

## Code Review Requirement
**All code changes must be shown to the user and approved before writing files.**

## Package Manager
**This project uses `npm`, not pnpm.** Run scripts with `npm run <script>` (e.g. `npm run deploy:schema`, `npm run import:prod`, `npm run import-events:prod`).

## Design Philosophy
- Follow plainvanillaweb.com principles
- Simplicity is paramount - no unnecessary complexity
- No build tools, no frameworks
- ES modules for JavaScript
- Web components for reusable UI
- Vanilla CSS with custom properties
- PocketBase SDK for backend (loaded from CDN)
- Dual-theme design: Terminal theme (gaming) + Recipe book theme (cooking)

## Architecture
- Frontend: Vanilla HTML + CSS + JavaScript
- Backend: PocketBase (SQLite with REST API)
- OCR: Tesseract.js (client-side, for game screenshots)
- Hosting: Frontend on Netlify (mcc-recipe.netlify.app), Backend on GCP

## Development Decisions
- Start with auth system first - all features require login
- Feature priority: Auth → Recipes → Game Stats/Leaderboard
- Use PocketBase SDK directly (no HTMX)
- Build locally first, deploy PocketBase to GCP later

## File Structure
```
master-chef/
├── index.html           # Coming soon landing page
├── login.html           # Authentication page
├── leaderboard.html     # Game stats (terminal theme)
├── recipes.html         # Recipe collection (recipe book theme)
├── game-upload.html     # Upload game screenshot
├── recipe-upload.html   # Upload/paste recipe
├── recipe-view.html     # Single recipe detail
├── player-view.html     # Single player stats (nice-to-have)
├── theme.css            # Terminal green CRT theme
├── recipe.css           # Clean recipe book theme
├── scripts/
│   ├── config.js        # PocketBase URL config
│   ├── auth.js          # PocketBase auth handling
│   ├── ocr.js           # Tesseract.js for screenshots
│   └── recipe-parser.js # Recipe parsing logic
├── components/
│   ├── login-form.js    # Login web component
│   └── recipe-card.js   # Recipe card web component
├── pb_data/             # PocketBase data (gitignored)
├── README.md
└── TODO.md
```

## Key Files
- `theme.css` - Retro terminal green phosphor CRT aesthetic (game pages)
- `recipe.css` - Clean, serif typography, print-friendly (recipe pages)
- `scripts/config.js` - PocketBase URL with dev/prod detection
- `scripts/auth.js` - PocketBase authentication handlers
- `scripts/ocr.js` - Client-side OCR with Tesseract.js
- `scripts/recipe-parser.js` - Parse recipes from URLs or raw text

## PocketBase Collections

### users (built-in)
- username, email, password

### scores (game stats)
- `user` (relation), `gamertag`, `game` (select)
- `kills`, `deaths`, `assists`, `score`, `mmr`
- `image` (file, optional)

### recipes
- `user` (relation), `title`, `source_url`
- `ingredients` (json), `instructions` (json)
- `prep_time`, `cook_time`, `servings`, `tags`
- `image` (file, optional)

## Dual Theme System
- **Terminal Theme** (`theme.css`): Green phosphor CRT, monospace fonts, scanlines - for game stats pages
- **Recipe Book Theme** (`recipe.css`): Clean serif fonts, high contrast, generous whitespace - for recipe pages

## Development
```bash
# Terminal 1: Start PocketBase
pocketbase serve
# Or if using local binary: ./pocketbase serve
# Admin UI at http://127.0.0.1:8090/_/

# Terminal 2: Serve frontend
python3 -m http.server 8000
# App at http://localhost:8000
```

## GCP Deployment (PocketBase Backend)

### Google Cloud Run (Recommended)
```bash
# Setup
gcloud auth login
gcloud projects create master-chef-app
gcloud config set project master-chef-app
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM alpine:latest
RUN apk add --no-cache ca-certificates wget unzip
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.23.4/pocketbase_0.23.4_linux_amd64.zip \
    && unzip pocketbase_0.23.4_linux_amd64.zip \
    && rm pocketbase_0.23.4_linux_amd64.zip
RUN mkdir -p /pb/pb_data
EXPOSE 8090
CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090"]
EOF

# Deploy
gcloud builds submit --tag gcr.io/master-chef-app/pocketbase
gcloud run deploy pocketbase \
  --image gcr.io/master-chef-app/pocketbase \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi
```

### Frontend Deployment: Netlify
- Connect GitHub repo
- Publish directory: `.` (root)
- No build command needed
- Update `scripts/config.js` with Cloud Run URL
