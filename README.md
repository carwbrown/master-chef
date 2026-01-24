# Master Chef

A dual-purpose web tool that lives up to its name - for both gaming masters and culinary chefs.

## Overview

Master Chef serves two distinct purposes:

### 🎮 Game Stats Tracker
- Upload screenshots of your game scores
- Stats extracted via client-side OCR (Tesseract.js)
- Track performance with MMR rankings
- Compete on community leaderboards

### 👨‍🍳 Recipe Parser
- Upload recipes from ad-heavy websites
- Parse into clean, legible format
- No ads, no life stories, just the recipe
- Save and organize your favorite recipes

### 🔐 Authentication
- Real user accounts via PocketBase
- Simple username & password authentication
- Personal recipe collections
- Verified leaderboard entries

## Architecture

### Technology Stack

**Frontend:**
- Plain HTML + HTMX for interactions
- Tesseract.js for client-side OCR
- Dual aesthetic themes:
  - **Terminal theme** (theme.css) - Green phosphor CRT for game stats
  - **Recipe book theme** (recipe.css) - Clean, readable for recipes

**Backend:**
- PocketBase (data storage + authentication)
- Built-in user management
- Real auth system (username + password)

### Page Structure

**Landing Pages:**
- **leaderboard.html** - Game stats landing page with MMR rankings (terminal theme)
- **recipes.html** - Recipe collection landing page with search (recipe book theme)

**Game Stats Pages (Terminal Theme):**
- **game-upload.html** - Upload screenshot & extract stats with OCR
- **player-view.html** - Individual player stats and history (nice-to-have)

**Recipe Pages (Recipe Book Theme):**
- **recipe-upload.html** - Upload/paste recipe for parsing
- **recipe-view.html** - Single recipe detail view with print-friendly layout

**Shared:**
- **index.html** - Coming soon page
- **login.html** - Authentication page

### Database Schema

**Collection: users** (PocketBase built-in)
- username (string, unique)
- email (optional)
- password (hashed automatically)

**Collection: scores**
- user (relation to users) - who submitted
- gamertag (string)
- game (select: "valorant", "cod", "apex", etc.)
- kills (number)
- deaths (number)
- assists (number)
- score (number)
- mmr (number) - calculated on submit
- submitted_at (datetime)
- image (file) - optional screenshot

**Collection: recipes**
- user (relation to users) - who uploaded
- title (string)
- source_url (url) - original recipe URL
- ingredients (json) - parsed ingredient list
- instructions (json) - parsed step-by-step instructions
- prep_time (string)
- cook_time (string)
- servings (string)
- tags (string) - comma-separated
- submitted_at (datetime)
- image (file) - optional recipe photo

## How It Works

### Game Stats Flow
1. User logs in with username/password
2. Land on **leaderboard.html** - view MMR rankings and stats
3. Click "Upload Score" → **game-upload.html**
4. Upload screenshot, click "Extract Stats"
5. Tesseract.js runs OCR in browser (5-10 seconds)
6. Review/edit extracted stats (kills, deaths, assists, score)
7. Submit to PocketBase with calculated MMR
8. Redirect back to **leaderboard.html** with updated rankings
9. Optional: Click player name → **player-view.html** for detailed stats

### Recipe Parsing Flow
1. User logs in with username/password
2. Land on **recipes.html** - searchable list of saved recipes
3. Click "Add Recipe" → **recipe-upload.html**
4. Paste recipe URL or raw text
5. Click "Parse" - client-side extraction runs
6. Review/edit parsed recipe data (ingredients, instructions, times)
7. Optional: upload recipe photo
8. Save to personal collection
9. Click any recipe → **recipe-view.html** for clean, print-friendly view

## MMR Calculation

Simple Elo-style formula:
```
K/D Ratio = kills / (deaths || 1)
Performance Score = (kills × 100) + (assists × 50) - (deaths × 50) + score
MMR = Previous MMR + (Performance Score / 100)
Starting MMR = 1000
```

## Why This Stack?

**PocketBase:**
- Literally just install and run
- Built-in admin UI to view data
- REST API out of the box
- Single binary
- Real authentication system built-in

**HTMX:**
- Form submission without page reload
- Dynamic updates (leaderboard refresh, search)
- No build process needed
- Works with both terminal and recipe book themes

**Tesseract.js:**
- OCR runs entirely in browser
- No server processing needed
- No API costs

**Recipe Parsing:**
- Client-side parsing with regex/DOM parsing
- Extracts ingredients, instructions, times
- No external API dependencies
- Works with most major recipe websites

**Dual Themes:**
- **Terminal theme** matches gaming competitive vibe
- **Recipe book theme** creates calm, focused reading experience
- Each theme optimized for its use case

## Local Development

### Quick Start
1. **Download PocketBase** (one-time setup):
   ```bash
   curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip -o pocketbase.zip
   unzip pocketbase.zip
   chmod +x pocketbase
   ```

2. **Start PocketBase**:
   ```bash
   ./pocketbase serve
   ```
   - Runs at: http://127.0.0.1:8090
   - Admin UI: http://127.0.0.1:8090/_/

3. **Serve Frontend** (in another terminal):
   ```bash
   python3 -m http.server 8000
   # or: npx serve .
   ```
   - App runs at: http://localhost:8000

4. **Create Collections**: Use admin UI to set up users, scores, recipes collections

### Development Benefits
- ✅ Fast iteration - no deployment needed
- ✅ Works offline
- ✅ Free unlimited storage
- ✅ Easy database resets
- ✅ Built-in admin panel

## Production Deployment

### Option 1: Google Cloud (Recommended - Free Tier)

**Why Google Cloud?**
- 2 million requests/month free on Cloud Run
- No sleep/cold start delays
- Better performance than Render free tier
- 5GB free storage
- Custom domains with SSL

**Backend - Cloud Run**:
```bash
# Install gcloud CLI
brew install google-cloud-sdk

# Login and setup
gcloud auth login
gcloud projects create master-chef-app
gcloud config set project master-chef-app

# Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build and deploy PocketBase
gcloud builds submit --tag gcr.io/master-chef-app/pocketbase
gcloud run deploy pocketbase \\
  --image gcr.io/master-chef-app/pocketbase \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --memory 256Mi
```

**Frontend - Netlify** (recommended):
```bash
# Option 1: Connect GitHub repo (easiest)
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings: leave blank (it's just static HTML)
6. Deploy!

# Option 2: Deploy via CLI
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Netlify Benefits**:
- ✅ 100GB bandwidth/month free
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Instant cache invalidation
- ✅ Deploy previews for branches
- ✅ Forms support (for future contact forms)
- ✅ Edge functions available

**Alternative**: Firebase Hosting or Cloudflare Pages (both also free and excellent)

**Cost**: $0/month within free tier limits

### Option 2: Render (Simpler Setup)

**PocketBase Backend**:
1. Create Render account (no credit card needed)
2. Create "Web Service" from Docker image: `ghcr.io/muchobien/pocketbase:latest`
3. Add persistent disk at `/pb_data` (250MB free)
4. Deploy takes 2-3 minutes

**Frontend - Netlify**:
- Same as above (drag & drop or GitHub connect)

**Trade-off**: Free tier sleeps after 15 min inactivity (but can use UptimeRobot to keep awake)

### Deployment Summary

**Recommended Stack**:
- **Backend**: Google Cloud Run (no sleep, 2M requests/month)
- **Frontend**: Netlify (100GB bandwidth, instant deploys)
- **Cost**: $0/month

**Simpler Stack** (if you prefer):
- **Backend**: Render (sleeps but simpler)
- **Frontend**: Netlify
- **Cost**: $0/month

Total setup time: 
- Local development: 10 minutes
- Google Cloud + Netlify: 30 minutes  
- Render + Netlify: 15 minutes

## File Structure

```
/
├── index.html           (coming soon page)
├── login.html           (authentication)
├── leaderboard.html     (game stats landing - terminal theme)
├── recipes.html         (recipe list landing - recipe book theme)
├── game-upload.html     (upload game screenshot)
├── recipe-upload.html   (upload/paste recipe)
├── recipe-view.html     (single recipe detail)
├── player-view.html     (single player stats - nice to have)
├── theme.css            (retro terminal green theme)
├── recipe.css           (clean recipe book theme)
└── js/
    ├── auth.js          (PocketBase auth handling)
    ├── ocr.js           (Tesseract.js for screenshots)
    ├── recipe-parser.js (recipe parsing logic)
    └── htmx-handlers.js (HTMX interactions)
```

## Trade-offs

**Pros:**
- Simple architecture, easy to maintain
- No backend code to write
- Real user authentication
- Personal collections (recipes + stats)
- All processing happens client-side
- Free/cheap hosting options
- Dual utility - gaming and cooking
- Two distinct aesthetics for different moods

**Cons:**
- OCR in browser is slower than server-side
- Recipe parsing may not work with all websites
- Client-side parsing means no centralized improvements
- Limited to games with clear text in screenshots
- Requires users to create accounts (slight friction)

## Security

With PocketBase authentication:
- Users must create accounts
- Passwords are securely hashed
- Each user owns their submitted content
- Leaderboard entries are verified per user
- Recipes are private to each user (can add sharing later)

## Security Note

Since there's no real auth, the password just keeps random people out. Anyone with the password can:
- View all data
- Submit scores
- Use any gamertag

This is fine for a friends-only leaderboard or small community tool. For anything public, you'd want actual auth.

## Next Steps

See TODO.md for the simplified implementation plan.