---
name: recipe-to-json
description: Convert a recipe from a URL or pasted text into Master Chef's canonical recipe JSON. Use whenever the user provides a recipe link or recipe text and wants it structured for the family app / PocketBase recipes collection.
---

# Recipe → JSON

Turn a recipe (URL or pasted text) into the exact JSON schema below. Output **only** valid JSON — no prose, no markdown fences — unless the user asks to also save it.

## Steps
1. If given a URL, fetch it with WebFetch. Prefer an embedded schema.org/Recipe JSON-LD block when present; otherwise read the visible recipe. Ignore ads, comments, and the blogger's life-story preamble.
2. If given pasted text, parse it directly and set `source_url` to null.
3. Normalize into the schema, then validate: parseable JSON, required fields present, arrays well-formed.

## Schema
```json
{
  "title": "string",
  "source_url": "string | null",
  "author": "string | null (person, site, or cookbook name — omit or null if unknown)",
  "servings": "number | null",
  "prep_time": "string | null",
  "cook_time": "string | null",
  "tags": ["lowercase-string"],
  "ingredients": [
    { "raw": "string", "amount": "number | null", "unit": "string | null", "name": "string" }
  ],
  "instructions": [
    { "step": 1, "text": "string" }
  ]
}
```

## Field rules
- `raw`: the original ingredient line, verbatim.
- `amount`: number or null. Convert fractions ("1 1/2" → 1.5). For a range ("2-3 cloves") use the lower bound (2) and keep the full range in `raw`.
- `unit`: string or null. "4 eggs" → unit null, name "eggs".
- `name`: the core ingredient, lowercased, without amount/unit/prep notes ("finely chopped").
- `tags`: 2–5 lowercase tags — cuisine, meal type, key diet/technique. Infer if the source doesn't list them.
- `prep_time` / `cook_time`: keep human strings like "15 min" (convert ISO "PT15M" → "15 min").
- `step`: 1-based sequential integers.

## Example
Input: a carbonara URL →
```json
{
  "title": "Spaghetti Carbonara",
  "source_url": "https://example.com/carbonara",
  "servings": 4,
  "prep_time": "15 min",
  "cook_time": "20 min",
  "tags": ["italian", "pasta", "dinner"],
  "ingredients": [
    { "raw": "1 lb spaghetti", "amount": 1, "unit": "lb", "name": "spaghetti" },
    { "raw": "4 large eggs", "amount": 4, "unit": null, "name": "large eggs" }
  ],
  "instructions": [
    { "step": 1, "text": "Bring a large pot of salted water to a boil." },
    { "step": 2, "text": "Cook spaghetti until al dente." }
  ]
}
```

## Optional: save it
If the user asks to save, write the JSON to `recipes/<slug>.json` in the repo, or (if they ask to push to PocketBase) POST it to the `recipes` collection using their authenticated PocketBase client.
