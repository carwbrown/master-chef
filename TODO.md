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
- [ ] Create `recipes` collection with updated schema (structured ingredients/instructions JSON)
- [ ] Create `user_recipe_data` collection (ratings, notes, tags, multiplier per user)
- [ ] Create `scores` collection with schema
- [ ] Set up API rules for user-owned data
- [ ] Set up API rules for shared recipe visibility (all users can read, only creator can edit/delete)
- [ ] Create test user account

### Recipe Import (Phase 1-2)
- [ ] Create `netlify.toml` configuration
- [ ] Create `netlify/functions/fetch-recipe.js` (URL scraper + Schema.org parser)
- [ ] Create `scripts/ingredient-parser.js` (parse "2 tbsp olive oil" → structured data)
- [ ] Update `recipe-upload.html` with URL import option
- [ ] Integrate Tesseract.js for image-to-text import (`scripts/ocr.js`)
- [ ] Add import review/edit step before saving

### Recipe Display Enhancements (Phase 3)
- [ ] Create `scripts/instruction-linker.js` (link ingredients ↔ instructions)
- [ ] Update `recipe-view.html` with bidirectional linking
- [ ] Add scaling UI (1x, 2x, 3x, 4x buttons)
- [ ] Create `scripts/recipe-scaler.js`
- [ ] Style injected amounts in instructions (highlight/different color)
- [ ] Smooth scroll between ingredient and instruction anchors

### User Features & Filtering (Phase 4)
- [ ] Add rating system (1-5 stars) to recipe view
- [ ] Add personal notes field per recipe
- [ ] Add personal tags per recipe
- [ ] Show "Uploaded by: username" on recipe cards and recipe view
- [ ] Update `recipes.html` to show ALL recipes (not just user's own)
- [ ] Non-creators can view any recipe, only creator can edit/delete

### Recipe Filtering (Phase 4)
- [ ] Add filter bar UI to `recipes.html`
- [ ] Implement tag filter (multi-select dropdown, populated from all recipe tags)
- [ ] Implement creator filter (dropdown of users who have uploaded recipes)
- [ ] Implement minimum rating filter (show recipes with avg rating >= X stars)
- [ ] Implement max time filter (prep + cook time <= selected duration)
- [ ] Add "Clear Filters" button
- [ ] Persist filter state in URL query params (shareable filtered views)
- [ ] Show filtered recipe count ("Showing 12 of 45 recipes")

### Navigation Changes (Phase 5)
- [ ] Make `recipes.html` the main landing page (or redirect index.html)
- [ ] Bury leaderboard in nav menu (not prominent)
- [ ] Update navigation header across all pages

### Recipe Features (Original)
- [ ] Image upload for recipes
- [ ] Print-friendly recipe view (CSS print styles)

### Game Stats Pages (Terminal Theme)
- [ ] Create leaderboard page (`leaderboard.html`)
- [ ] Create game upload page (`game-upload.html`)
- [ ] Create player view page (`player-view.html`)
- [ ] Terminal theme CSS already exists (`theme.css`)

### OCR Implementation (for Game Stats)
- [ ] Screenshot upload and preview
- [ ] Stats extraction from OCR text
- [ ] MMR calculation

### Deployment
- [x] Deploy PocketBase to GCP
- [x] Update `scripts/config.js` with production URL
- [ ] Test production environment
- [ ] Test Netlify function in production

### Polish
- [ ] Mobile responsive testing
- [ ] Loading spinners during async operations
- [ ] Toast notifications for success/error
- [ ] Navigation header component (shared across pages)
- [ ] Empty states for no recipes/no scores
