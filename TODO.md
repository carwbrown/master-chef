Master Chef - Implementation TODO

## Architecture Overview

### Page Structure
- **index.html** - Coming soon landing page
- **login.html** - Authentication (username/password via PocketBase)
- **leaderboard.html** - Game stats landing page (terminal theme)
- **recipes.html** - Recipe collection landing page (clean recipe book theme)
- **game-upload.html** - Upload game screenshot & extract stats
- **recipe-upload.html** - Upload/paste recipe for parsing
- **recipe-view.html** - Single recipe detail view (recipe book theme)
- **player-view.html** - Single player stats view (nice-to-have)

### Styling Strategy
- **Terminal Theme** (theme.css) - Used for: leaderboard, game uploads, player views
- **Recipe Book Theme** (recipe.css) - Used for: recipe list, recipe detail, recipe uploads
  - Clean, simple, easy to read
  - Typography-focused
  - Minimal colors
  - Print-friendly aesthetic

---

## Day 0: Local Development Setup (30 minutes)

### Install PocketBase Locally
1. **Download PocketBase** from https://pocketbase.io/docs/
   - macOS/Linux: `curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip -o pocketbase.zip`
   - Or download from GitHub releases page
2. **Extract** the binary: `unzip pocketbase.zip`
3. **Move to project**: `mv pocketbase /Users/cbrown/github/master-chef/`
4. **Make executable**: `chmod +x pocketbase`
5. **Start locally**: `./pocketbase serve`
6. **Access admin UI**: http://127.0.0.1:8090/_/
7. **Create admin account** when prompted

### Local Development Benefits
- Fast iteration without deployment delays
- No internet required
- Free unlimited storage
- Easy database resets during development
- Admin UI at http://127.0.0.1:8090/_/

### Add to .gitignore
```
pocketbase
pb_data/
node_modules/
.env
.DS_Store
```

### Local Development Workflow
```bash
# Terminal 1: Start PocketBase
./pocketbase serve

# Terminal 2: Serve frontend (choose one)
python3 -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# Access app at: http://localhost:8000
# Access PocketBase admin: http://127.0.0.1:8090/_/
```

### Quick Database Reset (During Development)
```bash
# Stop PocketBase (Ctrl+C)
rm -rf pb_data
./pocketbase serve
# Recreate admin account and collections
```

---

## Day 1: Setup & Authentication (3 hours)

### PocketBase Local Setup (Already Done in Day 0)
- PocketBase running at http://127.0.0.1:8090
- Admin UI accessible
- Ready to create collections

### Database Collections

**users** (built-in PocketBase)
- username (text, unique)
- email (optional)
- password (auto-hashed)

**scores**
- user (relation to users)
- gamertag (text)
- game (select: valorant, cod, apex, fortnite)
- kills (number)
- deaths (number)
- assists (number)
- score (number)
- mmr (number)
- image (file, optional)
- created (auto)

**recipes**
- user (relation to users)
- title (text)
- source_url (url)
- ingredients (json)
- instructions (json)
- prep_time (text)
- cook_time (text)
- servings (text)
- tags (text)
- image (file, optional)
- created (auto)

### Production Deployment Options

#### Option 1: Google Cloud Free Tier (Recommended)

**Google Cloud Run (Backend)**
1. **Prerequisites**
   - Google Cloud account (free tier: 2 million requests/month)
   - gcloud CLI installed: `brew install google-cloud-sdk`
   - Docker installed: `brew install --cask docker`

2. **Create Dockerfile for PocketBase**
   ```dockerfile
   FROM alpine:latest
   
   RUN apk add --no-cache \
       ca-certificates \
       unzip \
       wget
   
   # Download PocketBase
   RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip \
       && unzip pocketbase_0.22.0_linux_amd64.zip \
       && rm pocketbase_0.22.0_linux_amd64.zip
   
   EXPOSE 8080
   
   CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
   ```

3. **Setup Google Cloud**
   ```bash
   # Login to Google Cloud
   gcloud auth login
   
   # Create new project
   gcloud projects create master-chef-app --name="Master Chef"
   gcloud config set project master-chef-app
   
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Build and Deploy to Cloud Run**
   ```bash
   # Build container
   gcloud builds submit --tag gcr.io/master-chef-app/pocketbase
   
   # Deploy to Cloud Run
   gcloud run deploy pocketbase \
     --image gcr.io/master-chef-app/pocketbase \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 256Mi \
     --min-instances 0 \
     --max-instances 1
   ```

5. **Add Persistent Storage (Google Cloud Storage)**
   - Mount GCS bucket for `/pb_data` persistence
   - Or use Cloud SQL for database (more expensive)
   - Free tier: 5GB storage

6. **Note your URL**: `https://pocketbase-xxxxx-uc.a.run.app`

**Google Cloud Storage (Frontend - Static Hosting)**
1. Create bucket: `gsutil mb gs://master-chef-frontend`
2. Make public: `gsutil iam ch allUsers:objectViewer gs://master-chef-frontend`
3. Upload files: `gsutil -m cp -r * gs://master-chef-frontend`
4. Enable website: `gsutil web set -m index.html gs://master-chef-frontend`
5. Access at: `https://storage.googleapis.com/master-chef-frontend/index.html`

**Firebase Hosting (Alternative Frontend - Also Free)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```
- Free tier: 10GB storage, 360MB/day transfer
- Custom domain support
- Automatic SSL

**Google Cloud Free Tier Limits:**
- Cloud Run: 2 million requests/month
- Cloud Storage: 5GB storage
- Cloud Build: 120 build-minutes/day
- Egress: 1GB/month to North America

#### Option 2: Render (Alternative - Simpler but Sleeps)

**PocketBase on Render**
- Free tier sleeps after 15 minutes of inactivity
- 750 hours/month free
- Setup: see original Day 1 instructions (commented below)

```
# Render setup (if preferred):
# 1. Sign up for Render.com
# 2. Create "Web Service" from Docker image
# 3. Use: ghcr.io/muchobien/pocketbase:latest
# 4. Add persistent disk at /pb_data
# 5. Set start command: ./pocketbase serve --http=0.0.0.0:8080
```

### Project Structure
```
/
├── index.html          (coming soon page)
├── login.html          (auth page)
├── leaderboard.html    (game stats landing)
├── recipes.html        (recipe collection landing)
├── game-upload.html    (upload game screenshot)
├── recipe-upload.html  (upload/paste recipe)
├── recipe-view.html    (single recipe detail)
├── player-view.html    (single player stats - nice to have)
├── theme.css           (terminal green theme)
├── recipe.css          (clean recipe book theme)
└── js/
    ├── auth.js         (PocketBase authentication)
    ├── ocr.js          (Tesseract.js for screenshots)
    ├── recipe-parser.js (recipe parsing logic)
    └── htmx-handlers.js
```

### Authentication Setup
- Add PocketBase JavaScript SDK
- Create login form (username + password)
- Implement login/logout handlers
- Store auth token in localStorage
- Add auth check on protected pages
- Redirect to login if not authenticated

---

## Day 2: Recipe Book Theme & Recipe Pages (3-4 hours)

### Create recipe.css (Clean Recipe Book Theme)
- Clean serif fonts (Georgia, Garamond)
- High contrast black text on white/cream background
- Generous whitespace
- Clear typography hierarchy
- Print-friendly styles
- Simple borders and dividers
- Minimal decorative elements
- Focus on readability

### recipes.html (Landing Page)
- List all user's recipes
- Search/filter by title, tags, ingredients
- Grid or list view toggle
- Recipe card preview (title, image, prep time)
- Sort by: recent, alphabetical, prep time
- "Add Recipe" button → recipe-upload.html
- Click recipe → recipe-view.html?id={id}

### recipe-view.html (Single Recipe Detail)
- Clean, print-friendly layout
- Large title at top
- Prep/cook time, servings metadata
- Ingredients list (checkboxes for marking off)
- Step-by-step instructions (numbered)
- Source URL link (if applicable)
- Edit/Delete buttons (for recipe owner)
- "Print Recipe" button
- Back to recipes list button

### recipe-upload.html (Add Recipe)
- Two input methods:
  1. Paste URL from recipe website
  2. Paste raw recipe text
- Parse button triggers recipe-parser.js
- Display parsed results for review/editing
- Manual form fields for all recipe data:
  - Title
  - Source URL
  - Ingredients (textarea, one per line)
  - Instructions (textarea, numbered steps)
  - Prep time, cook time, servings
  - Tags (comma-separated)
- Image upload (optional)
- Save to PocketBase
- Redirect to recipe-view.html

---

## Day 3: Game Stats & Leaderboard (3-4 hours)

### leaderboard.html (Landing Page - Terminal Theme)
- Display scores sorted by MMR descending
- Terminal-style table: Rank, Player, Game, MMR, K/D, Score
- Filter by game (dropdown or tabs)
- Search by gamertag
- Auto-refresh with HTMX polling
- "Upload Score" button → game-upload.html
- Click player name → player-view.html?user={id} (nice-to-have)
- Show stats: total submissions, top player, avg MMR

### game-upload.html (Upload Score - Terminal Theme)
- File input for screenshot
- Image preview on upload
- "Extract Stats" button triggers OCR
- Loading spinner during OCR (5-10 seconds)
- Pre-fill form with extracted values:
  - Game (dropdown)
  - Gamertag (auto-fill from profile)
  - Kills, deaths, assists, score
- Manual editing allowed
- MMR calculation preview
- Submit to PocketBase
- Redirect to leaderboard.html

### player-view.html (Single Player Stats - Nice-to-Have)
- Show all scores for selected player
- Stats overview: total games, avg MMR, best game
- Chart of MMR over time
- Filter by game type
- Recent submissions list
- Back to leaderboard button

---

## Day 4: OCR & Recipe Parsing Logic (3-4 hours)

---

## Day 4: OCR & Recipe Parsing Logic (3-4 hours)

### OCR Implementation (ocr.js)
- Initialize Tesseract.js worker
- Run OCR on uploaded game screenshot
- Extract numbers from OCR text
- Pattern matching for stats (kills, deaths, assists, score)
- Return structured data object
- Error handling for failed OCR
- Quality preprocessing (contrast enhancement)

### Recipe Parser (recipe-parser.js)
- Parse recipe URLs using fetch + DOM parsing:
  - Extract title from `<h1>` or meta tags
  - Find ingredients (usually in `<li>` or specific classes)
  - Find instructions (numbered/bulleted lists)
  - Extract prep/cook time (regex patterns)
  - Extract servings (regex patterns)
- Parse raw text recipes:
  - Identify sections (ingredients, instructions, times)
  - Regex for common patterns
  - Handle various formats (blog style, traditional)
- Return structured JSON:
  ```javascript
  {
    title: string,
    ingredients: string[],
    instructions: string[],
    prepTime: string,
    cookTime: string,
    servings: string,
    sourceUrl: string
  }
  ```
- Support popular sites: AllRecipes, Food Network, NYT Cooking, etc.

### MMR Calculation
```javascript
// Calculate MMR for game stats
function calculateMMR(prevMMR, kills, deaths, assists, score) {
  const kdRatio = kills / (deaths || 1);
  const performanceScore = 
    (kills × 100) + 
    (assists × 50) - 
    (deaths × 50) + 
    score;
  const mmrChange = performanceScore / 100;
  return Math.round(prevMMR + mmrChange);
}
// Starting MMR = 1000
```

---

## Day 5: Polish & Deploy (3-4 hours)

### UI Polish
- **Terminal pages**: Add ASCII art, loading spinners, terminal prompts
- **Recipe pages**: Refine typography, spacing, print styles
- Mobile responsiveness for all pages
- Loading states for async operations
- Success/error toast notifications
- Form validation feedback
- Image upload previews
- Empty states (no recipes, no scores)

### Navigation
- Add nav menu/header to each page:
  - Leaderboard link
  - Recipes link
  - Profile/Logout
- Consistent navigation across both themes

### Testing
- **Local testing first**: Test everything with local PocketBase
- Test full game flow: upload → OCR → review → submit → leaderboard
- Test recipe flow: paste → parse → review → save → view
- Test authentication: login, logout, protected routes
- Test on different screen sizes
- Test with various image qualities
- Test recipe parsing on different websites
- Test error scenarios

### Production Deployment

**Choose your deployment method** (see Day 1 for detailed steps):

**Option A: Google Cloud Run + Netlify (Recommended)**

1. **Backend**: Deploy PocketBase to Google Cloud Run
   ```bash
   # Build and deploy
   gcloud builds submit --tag gcr.io/master-chef-app/pocketbase
   gcloud run deploy pocketbase \
     --image gcr.io/master-chef-app/pocketbase \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```
   - Note your Cloud Run URL: `https://pocketbase-xxxxx-uc.a.run.app`
   
2. **Frontend**: Deploy to Netlify
   ```bash
   # Option 1: GitHub (easiest)
   - Push to GitHub
   - Connect repo at app.netlify.com
   - Auto-deploy on push
   
   # Option 2: CLI
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```
   
3. **Update frontend config**:
   - Create `config.js` with PocketBase URL
   - Set to Cloud Run endpoint
   - Commit and push (auto-deploys via Netlify)
   
4. **Benefits**:
   - ✅ No sleep issues (Cloud Run wakes instantly)
   - ✅ 100GB bandwidth/month (Netlify)
   - ✅ Custom domains with SSL
   - ✅ Deploy previews for branches

**Option B: Render + Netlify (Simpler Setup)**
1. Deploy PocketBase to Render Web Service (Docker)
2. Deploy frontend to Netlify (same as above)
3. Optional: Use UptimeRobot to prevent Render sleep

### Environment Configuration
- Create `config.js` in root:
  ```javascript
  const POCKETBASE_URL = 
    window.location.hostname === 'localhost' 
      ? 'http://127.0.0.1:8090'
      : 'https://pocketbase-xxxxx-uc.a.run.app'; // or your Render URL
  ```
- Add to .gitignore if using different URLs per environment

### Netlify Specific Setup
1. **Build settings**: None needed (static HTML)
2. **Environment variables** (optional): 
   - Can set `POCKETBASE_URL` in Netlify dashboard
3. **Redirects** (optional): Create `_redirects` file for SPA routing
   ```
   /*    /index.html   200
   ```
4. **Headers** (optional): Create `_headers` for security
   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
   ```

### Post-Deployment Checklist
- ✅ PocketBase accessible and admin login works
- ✅ Frontend can connect to PocketBase API
- ✅ User registration and login functional
- ✅ File uploads working
- ✅ CORS configured correctly
- ✅ SSL/HTTPS enabled
- ✅ Database collections created
- ✅ Test with real data

---

## Optional Enhancements (Future)

### Recipe Features
- Recipe sharing (make recipes public)
- Recipe collections/cookbooks
- Meal planning calendar
- Shopping list generator from ingredients
- Recipe ratings and comments
- Nutrition info parsing/calculation
- Recipe scaling (adjust servings)
- Recipe import from photo (OCR for cookbooks)
- Dark mode toggle for recipe view

### Game Features
- Detailed player analytics (graphs, trends)
- Game-specific leaderboards (per game type)
- Team/squad leaderboards
- Achievement badges
- MMR decay for inactive players
- Win/loss tracking
- Match history timeline
- Screenshot gallery
- Social features (follow players, comments)

### Technical Improvements
- Offline support with service workers
- Better OCR preprocessing
- Batch recipe import
- CSV export for leaderboards
- Admin dashboard for moderation
- Rate limiting for uploads
- Image optimization/compression
- Real-time updates with WebSockets

---

## Minimum Viable Product (Quick Start)

### MVP - Game Stats Only (4 hours)
**Hour 1**: PocketBase + auth setup  
**Hour 2**: leaderboard.html with manual entry form  
**Hour 3**: Basic MMR calculation + submission  
**Hour 4**: Deploy and test

### MVP - Recipes Only (4 hours)
**Hour 1**: PocketBase + auth setup  
**Hour 2**: recipes.html list view  
**Hour 3**: recipe-upload.html with manual entry  
**Hour 4**: recipe-view.html detail page

### Full MVP - Both Features (8-10 hours)
Combine both MVPs above, then add:
- OCR for game stats (2 hours)
- Recipe URL parsing (2 hours)
- Polish and deploy (2 hours)

---

## Design Philosophy

### Terminal Theme (Game Stats)
- Green phosphor CRT aesthetic
- Scanlines and subtle flicker
- Monospace font (Share Tech Mono)
- ASCII art and terminal prompts
- Retro gaming vibe
- Focused on performance and competition

### Recipe Book Theme (Recipes)
- Clean, minimal, readable
- Serif fonts for warmth (Georgia, Garamond)
- High contrast for easy reading
- Generous whitespace
- Print-friendly
- Focused on cooking and clarity
- Like opening a quality cookbook

**The dual aesthetic reflects the dual purpose**: competitive gaming intensity vs. calm culinary creativity.

