# Simple Game Stats Tracker

A lightweight web tool for extracting stats from game screenshots and maintaining a leaderboard.

## Overview

Dead simple approach:
- Upload a screenshot of your game score
- Stats are extracted via client-side OCR (Tesseract.js)
- Enter your gamertag
- Stats are saved to a simple database
- View leaderboard with MMR rankings

No auth, no user accounts, no complexity.

## Architecture

### Technology Stack

**Frontend:**
- Plain HTML + HTMX for interactions
- Tesseract.js for client-side OCR
- Retro terminal theme (pure CSS, no frameworks)

**Backend:**
- PocketBase (just for data storage)
- No custom hooks needed
- Password-protected with basic auth

### Database Schema

Just ONE collection: **scores**

- gamertag (string)
- game (select: "valorant", "cod", "apex", etc.) - hardcoded options
- kills (number)
- deaths (number)
- assists (number)
- score (number)
- mmr (number) - calculated on submit
- submitted_at (datetime)
- image (file) - optional, for reference

That's it. No relations, no complexity.

## How It Works

1. User visits the page (protected by basic auth password)
2. Upload screenshot
3. Tesseract.js runs in browser to extract text
4. User confirms/corrects extracted stats
5. Enter gamertag
6. Click submit
7. MMR calculated with simple Elo formula
8. Record saved to PocketBase
9. Leaderboard updates via HTMX

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
- Can add basic auth password in settings

**HTMX:**
- Form submission without page reload
- Leaderboard updates
- No build process needed
- Works perfectly with retro terminal aesthetic

**Tesseract.js:**
- OCR runs entirely in browser
- No server processing needed
- No API costs

## Deployment (Render - 100% Free)

### PocketBase Backend (Render Web Service)
1. Create Render account (no credit card needed)
2. Create new "Web Service" from Docker image
3. Use PocketBase Docker image: `ghcr.io/muchobien/pocketbase:latest`
4. Add persistent disk at `/pb_data` (250MB free disk)
5. Set start command: `./pocketbase serve --http=0.0.0.0:8080`
6. Deploy (takes 2-3 minutes)
7. Note your URL: `https://your-app.onrender.com`

### Frontend (Render Static Site)
1. Create new "Static Site" on Render
2. Connect your GitHub repo or upload files
3. Set publish directory to `/public` (or wherever your HTML files are)
4. Add environment variable for PocketBase URL
5. Deploy
6. Add password protection via Render headers or use Cloudflare Pages instead

### Keep It Awake (Optional)
- Sign up for UptimeRobot (free)
- Create HTTP monitor pinging your PocketBase URL every 5 minutes
- Prevents 15-minute sleep on free tier

Total setup time: 30 minutes.

## File Structure

```
/
├── public/            (your frontend files)
│   ├── index.html
│   ├── app.js         (OCR + HTMX logic)
│   └── styles.css     (retro terminal theme)
├── Dockerfile         (for PocketBase on Render)
└── README.md
```

## Trade-offs

**Pros:**
- Ridiculously simple
- No backend code to write
- Free/cheap hosting
- Easy to maintain

**Cons:**
- OCR in browser is slower than server-side
- No user accounts means no personal history
- Same gamertag can be used by anyone (no verification)
- Limited to games with clear text in screenshots

## Security Note

Since there's no real auth, the password just keeps random people out. Anyone with the password can:
- View all data
- Submit scores
- Use any gamertag

This is fine for a friends-only leaderboard or small community tool. For anything public, you'd want actual auth.

## Next Steps

See TODO.md for the simplified implementation plan.