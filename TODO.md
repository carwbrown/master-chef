# Master Chef - TODO

## Completed

### Auth & Core
- [x] Create login page (`login.html`)
- [x] Create login form web component (`components/login-form.js`)
- [x] Create auth helpers (`scripts/auth.js`)
- [x] Create config file (`scripts/config.js`)
- [x] Set up .gitignore for secrets

### Recipe Pages (Recipe Book Theme)
- [x] Create recipes list page (`recipes.html`)
- [x] Create recipe card web component (`components/recipe-card.js`)
- [x] Create add recipe page (`recipe-upload.html`)
- [x] Create view recipe page (`recipe-view.html`)
- [x] Create edit recipe page (`recipe-edit.html`)
- [x] Ingredients list with dynamic add/remove
- [x] Instructions list with numbered steps
- [x] Delete recipe functionality

### Documentation
- [x] Update README with local dev instructions
- [x] Create GCP deployment guide
- [x] Create CLAUDE.md with project guidelines

## Remaining

### PocketBase Setup (Local)
- [ ] Download and run PocketBase locally
- [ ] Create `recipes` collection with schema
- [ ] Create `scores` collection with schema
- [ ] Set up API rules for user-owned data
- [ ] Create test user account

### Recipe Features
- [ ] Recipe URL parser (`scripts/recipe-parser.js`)
- [ ] Image upload for recipes
- [ ] Print-friendly recipe view (CSS print styles)
- [ ] Recipe search/filter by tags
- [ ] Recipe scaling (adjust servings)

### Game Stats Pages (Terminal Theme)
- [ ] Create leaderboard page (`leaderboard.html`)
- [ ] Create game upload page (`game-upload.html`)
- [ ] Create player view page (`player-view.html`)
- [ ] Create terminal theme CSS (`theme.css`)

### OCR Implementation
- [ ] Integrate Tesseract.js (`scripts/ocr.js`)
- [ ] Screenshot upload and preview
- [ ] Stats extraction from OCR text
- [ ] MMR calculation

### Deployment
- [ ] Deploy PocketBase to GCP
- [ ] Update `scripts/config.js` with production URL
- [ ] Test production environment

### Polish
- [ ] Mobile responsive testing
- [ ] Loading spinners during async operations
- [ ] Toast notifications for success/error
- [ ] Navigation header component (shared across pages)
- [ ] Empty states for no recipes/no scores
