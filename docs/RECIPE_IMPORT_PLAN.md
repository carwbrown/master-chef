# Recipe Import & Enhancement Plan

## Overview

This document outlines the implementation plan for enhanced recipe import and display features in Master Chef.

## Goals

1. Import recipes from URLs (extract from ad-heavy recipe sites cleanly)
2. Import recipes from images (OCR for screenshots/photos)
3. Smart ingredient-instruction linking (bidirectional navigation)
4. Automatic amount injection in instructions
5. Recipe scaling (2x, 3x, 4x multipliers)
6. Per-user customizations (ratings, comments, personal tags)
7. Shared recipe visibility (all logged-in users can view all recipes, but only creators can edit/delete)
8. Recipe filtering on main page (by tags, creator, rating, cook time)

## Architecture

### Cost Considerations

| Component | Solution | Cost |
|-----------|----------|------|
| URL Scraping | Netlify Function | Free (125k req/month) |
| Image OCR | Tesseract.js (client-side) | Free |
| Ingredient Parsing | Client-side JS | Free |
| Linking/Injection | Client-side JS | Free |
| Scaling | Client-side multiplication | Free |

**Total estimated cost: $0/month** (within free tiers)

---

## Data Model Changes

### Updated `recipes` Collection

```json
{
  "id": "abc123",
  "user": "user_id",
  "title": "Pasta Carbonara",
  "source_url": "https://example.com/recipe",
  "prep_time": "15 mins",
  "cook_time": "20 mins",
  "servings": 4,
  "servings_unit": "servings",
  "tags": "italian,pasta,quick",
  "image": "optional_file",
  "ingredients": [
    {
      "id": "ing-1",
      "raw": "2 tbsp olive oil",
      "amount": 2,
      "unit": "tbsp",
      "name": "olive oil"
    },
    {
      "id": "ing-2",
      "raw": "1 lb spaghetti",
      "amount": 1,
      "unit": "lb",
      "name": "spaghetti"
    },
    {
      "id": "ing-3",
      "raw": "4 eggs",
      "amount": 4,
      "unit": null,
      "name": "eggs"
    },
    {
      "id": "ing-4",
      "raw": "salt and pepper to taste",
      "amount": null,
      "unit": null,
      "name": "salt and pepper"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "text": "Heat olive oil in a large pan over medium heat.",
      "ingredientRefs": ["ing-1"]
    },
    {
      "step": 2,
      "text": "Cook spaghetti according to package directions.",
      "ingredientRefs": ["ing-2"]
    }
  ],
  "created": "2024-01-15T...",
  "updated": "2024-01-15T..."
}
```

**API Rules:**
- All authenticated users can READ all recipes
- Only the creator (user field) can UPDATE or DELETE their own recipes

### New `user_recipe_data` Collection

Per-user customizations for any recipe:

```json
{
  "id": "urd_123",
  "user": "user_id",
  "recipe": "recipe_id",
  "rating": 4,
  "notes": "Added extra garlic, was delicious",
  "personal_tags": "weeknight,favorites",
  "multiplier": 2,
  "created": "2024-01-15T...",
  "updated": "2024-01-15T..."
}
```

**API Rules:**
- Users can only read/write their own `user_recipe_data`
- One record per user+recipe combination (unique constraint)

---

## Netlify Function Structure

```
master-chef/
├── netlify/
│   └── functions/
│       └── fetch-recipe.js    # URL fetcher + Schema.org parser
├── netlify.toml               # Netlify configuration
└── ... existing files
```

### `netlify.toml`

```toml
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### `netlify/functions/fetch-recipe.js`

**What it does:**
1. Receives a URL
2. Fetches the page HTML
3. Extracts Schema.org JSON-LD Recipe data (most recipe sites have this)
4. Falls back to parsing common HTML patterns if no structured data
5. Returns normalized JSON

**Response format:**
```json
{
  "success": true,
  "data": {
    "title": "...",
    "ingredients": ["..."],
    "instructions": ["..."],
    "prepTime": "PT15M",
    "cookTime": "PT30M",
    "servings": "4"
  },
  "source": "schema.org"
}
```

---

## Client-Side Components

### 1. Ingredient Parser (`scripts/ingredient-parser.js`)

Parses raw ingredient strings into structured data:

```javascript
parseIngredient("2 tbsp olive oil")
// → { amount: 2, unit: "tbsp", name: "olive oil", raw: "2 tbsp olive oil" }

parseIngredient("1 1/2 cups flour")
// → { amount: 1.5, unit: "cups", name: "flour", raw: "1 1/2 cups flour" }

parseIngredient("salt to taste")
// → { amount: null, unit: null, name: "salt", raw: "salt to taste" }
```

### 2. Instruction Linker (`scripts/instruction-linker.js`)

Scans instructions for ingredient mentions and creates links:

```javascript
linkInstructions(ingredients, instructions)
// Returns instructions with ingredientRefs populated
// Also returns HTML with injected amounts and anchor links
```

### 3. Recipe Scaler (`scripts/recipe-scaler.js`)

```javascript
scaleRecipe(recipe, multiplier)
// Returns recipe with all amounts multiplied
// Handles unit conversions (e.g., 16 tbsp → 1 cup)
```

### 4. OCR Handler (`scripts/ocr.js` - enhancement)

Already planned in TODO.md. Uses Tesseract.js:

```javascript
extractTextFromImage(imageFile)
// Returns raw text from image

parseRecipeFromText(text)
// Attempts to identify ingredients vs instructions from OCR output
```

---

## UI Changes

### 1. Landing Page Change

- `index.html` → Redirect to `/recipes.html` (or make recipes.html the index)
- Move leaderboard to nav menu item (not prominent)

### 2. Recipe List (`recipes.html`)

- Remove user filter (show ALL recipes from all users)
- Add "Uploaded by: username" to recipe cards
- Add filter bar with multiple filter options (see Recipe Filtering below)

#### Recipe Filtering

The main recipe list page will include a filter bar with the following options:

**Filter Options:**

| Filter | Type | Description |
|--------|------|-------------|
| Tags | Multi-select dropdown | Filter by recipe tags (e.g., "italian", "quick", "vegetarian") |
| Creator | Dropdown | Filter by who uploaded the recipe |
| Min Rating | Dropdown (1-5 stars) | Show recipes with average rating >= selected value |
| Max Time | Dropdown/Input | Filter by total time (prep + cook) <= selected value |

**UI Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Tags: [All ▼]  Creator: [All ▼]  Rating: [Any ▼]  Time: [Any ▼]  [Clear Filters]  │
└─────────────────────────────────────────────────────────────────┘
```

**Filter Behavior:**
- Filters are additive (AND logic) - selecting "italian" tag AND "3+ stars" shows only italian recipes with 3+ stars
- Filters persist in URL query params (shareable filtered views)
- "Clear Filters" button resets all filters
- Recipe count updates as filters are applied: "Showing 12 of 45 recipes"
- Filters work client-side for small collections, can add server-side if needed

**Tag Filter:**
- Populated dynamically from all tags used across recipes
- Multi-select: can filter by multiple tags at once
- Shows tag count: "italian (5)" meaning 5 recipes have that tag

**Creator Filter:**
- Populated from all users who have uploaded recipes
- Single-select dropdown
- Shows username

**Rating Filter:**
- Options: Any, 1+ stars, 2+ stars, 3+ stars, 4+ stars, 5 stars
- Based on average rating from `user_recipe_data` collection
- Recipes with no ratings shown when "Any" is selected

**Time Filter:**
- Options: Any, Under 15 min, Under 30 min, Under 1 hour, Over 1 hour
- Based on total time (prep_time + cook_time)
- Requires parsing time strings to minutes for comparison

### 3. Recipe View (`recipe-view.html`)

**Visibility:**
- Any logged-in user can view any recipe
- Edit/Delete buttons only shown to the recipe creator

**Ingredients Section:**
- Each ingredient is clickable
- Click scrolls to first instruction that uses it
- Shows current scaled amount

**Instructions Section:**
- Ingredient mentions are highlighted (different color/style)
- Shows amount before ingredient name: "Heat **2 tbsp olive oil** in a pan"
- Click on ingredient mention scrolls to ingredient list

**Scaling Controls:**
- Buttons: 1x | 2x | 3x | 4x
- Updates all displayed amounts in real-time
- Saves preference to `user_recipe_data`

**User Actions:**
- Rate recipe (1-5 stars)
- Add personal notes
- Add personal tags

### 4. Recipe Upload (`recipe-upload.html`)

**Import Options:**
1. **From URL** - Paste URL, click "Import", auto-fills form
2. **From Image** - Upload/take photo, OCR extracts text, user reviews/corrects
3. **Manual** - Current behavior (type everything)

**Post-Import Review:**
- Show parsed ingredients in editable list
- Allow corrections before saving
- Preview the linking (see which instructions reference which ingredients)

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create `netlify.toml` and folder structure
- [ ] Create `fetch-recipe.js` Netlify function
- [ ] Update recipe JSON schema in PocketBase
- [ ] Create `user_recipe_data` collection
- [ ] Update API rules for shared recipe visibility

### Phase 2: Import Features
- [ ] Create `ingredient-parser.js`
- [ ] Update `recipe-upload.html` with URL import
- [ ] Integrate Tesseract.js for image import
- [ ] Add import review/edit step

### Phase 3: Display Enhancements
- [ ] Create `instruction-linker.js`
- [ ] Update `recipe-view.html` with linking
- [ ] Add scaling UI and `recipe-scaler.js`
- [ ] Style injected amounts (highlight)

### Phase 4: User Features & Filtering
- [ ] Add rating system to recipe view
- [ ] Add personal notes/tags
- [ ] Show "Uploaded by" on recipe cards
- [ ] Update recipes.html to show all recipes
- [ ] Ensure non-creators can view but not edit/delete
- [ ] Add filter bar UI to recipes.html
- [ ] Implement tag filter (multi-select)
- [ ] Implement creator filter (dropdown)
- [ ] Implement minimum rating filter
- [ ] Implement max time filter
- [ ] Add "Clear Filters" button
- [ ] Persist filters in URL query params
- [ ] Show filtered recipe count

### Phase 5: Navigation Changes
- [ ] Make recipes.html the main landing page
- [ ] Move leaderboard to menu dropdown/buried location
- [ ] Update navigation across all pages

---

## Common Recipe Unit Conversions (for scaling)

```javascript
const conversions = {
  tsp: { tbsp: 3, cup: 48 },
  tbsp: { tsp: 1/3, cup: 16 },
  cup: { tbsp: 1/16, tsp: 1/48 },
  oz: { lb: 16, g: 1/28.35 },
  lb: { oz: 1/16, kg: 2.2 },
  // etc.
};
```

---

## Testing Checklist

- [ ] URL import works with AllRecipes
- [ ] URL import works with Food Network
- [ ] URL import works with NYT Cooking (may have paywall issues)
- [ ] URL import works with blogs (less structured)
- [ ] OCR extracts readable text from clear photos
- [ ] Ingredient parsing handles fractions (1/2, 1 1/2)
- [ ] Ingredient parsing handles ranges (2-3 cloves)
- [ ] Scaling multiplies correctly
- [ ] Links scroll smoothly between sections
- [ ] Non-creator can view recipe but cannot see edit/delete buttons
- [ ] Creator can edit and delete their own recipes
- [ ] Mobile responsive

### Filtering Tests
- [ ] Tag filter shows only recipes with selected tag(s)
- [ ] Multiple tags filter correctly (AND logic)
- [ ] Creator filter shows only that user's recipes
- [ ] Rating filter shows recipes at or above threshold
- [ ] Time filter correctly parses and compares time strings
- [ ] Combining multiple filters works correctly
- [ ] Clear Filters resets all filters
- [ ] Filter state persists in URL
- [ ] Sharing filtered URL loads correct filters
- [ ] Recipe count updates when filtering
