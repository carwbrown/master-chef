Simple Game Stats Tracker - TODO
Day 1: Setup (2 hours)
PocketBase Setup on Render

    Sign up for Render.com (no credit card needed)
    Create new "Web Service"
    Select "Deploy from Docker image"
    Use image: ghcr.io/muchobien/pocketbase:latest
    Set service name (e.g., game-stats-pb)
    Add persistent disk: 250MB at /pb_data
    Set start command: ./pocketbase serve --http=0.0.0.0:8080
    Deploy and wait ~3 minutes
    Visit https://your-app.onrender.com/_/ to create admin account
    Create scores collection with fields:
        gamertag (text, required)
        game (select: valorant, cod, apex, fortnite)
        kills (number)
        deaths (number)
        assists (number)
        score (number)
        mmr (number)
        image (file, optional)
    Set API rules: allow read/create for everyone

Project Structure

    Create GitHub repo (makes Render deployment easier)
    Create public/ folder
    Create public/index.html
    Create public/app.js
    Create public/styles.css (retro terminal theme)
    Add HTMX CDN link
    Add Tesseract.js CDN link

Day 2: Upload & OCR (3-4 hours)
Image Upload Form

    Create file input for screenshot
    Add image preview on upload
    Add game dropdown (hardcoded options)
    Add gamertag text input
    Add stats fields (kills, deaths, assists, score)

Client-Side OCR

    Initialize Tesseract.js worker
    Run OCR on uploaded image
    Extract numbers from OCR text
    Map numbers to stat fields (basic pattern matching)
    Pre-fill form fields with extracted values
    Add loading indicator during OCR
    Add manual override (user can edit fields)

Form Polish

    Add validation (numbers only for stats)
    Add clear/reset button
    Add preview of what will be submitted

Day 3: Save & Calculate (2-3 hours)
MMR Calculation

    Write simple MMR calculation function in JavaScript

javascript

// Get gamertag's current MMR from PocketBase
// Calculate new MMR based on performance
// Return new MMR value

    Fetch latest MMR for gamertag before calculating
    Default starting MMR = 1000

Form Submission

    Submit form via HTMX to PocketBase API
    Calculate MMR in JavaScript before submit
    Include MMR in submission
    Show success message
    Clear form after submit
    Add error handling

Day 4: Leaderboard (2-3 hours)
Display Leaderboard

    Fetch scores from PocketBase (sorted by MMR desc)
    Display in retro terminal-style table: Rank, Gamertag, Game, MMR, K/D, Recent Score
    Calculate K/D ratio for display
    Add HTMX polling to auto-refresh leaderboard
    Style with terminal green text on black background

Leaderboard Features

    Show top 50 or 100 scores
    Add filter by game (tabs or dropdown)
    Highlight current session submissions (optional)
    Add timestamp formatting

Stats Display

    Show total submissions count
    Show top gamertag
    Show average MMR

Day 5: Polish & Deploy (2-3 hours)
UI Polish

    Add retro ASCII art header/logo
    Improve mobile responsiveness
    Add helpful instructions in terminal style
    Add OCR tips (e.g., "Make sure text is clear")
    Add loading states with terminal spinners
    Test on different browsers

Password Protection

    Deploy frontend to Render Static Site
    Connect GitHub repo
    Set publish directory to public/
    Add password via Render environment variable + custom auth page
    OR use Cloudflare Pages with Access for easier password protection

PocketBase Deployment (Already Done on Day 1!)

    PocketBase running on Render
    Test API connection from frontend
    Update frontend API URL to production Render URL

Keep Awake (Optional)

    Sign up for UptimeRobot (free)
    Create HTTP monitor
    Set to ping your PocketBase URL every 5 minutes
    Verify it's staying awake

Testing

    Test full flow: upload → OCR → submit → leaderboard
    Test with different games
    Test with poor quality images
    Test manual stat entry (skip OCR)
    Test on mobile

Optional Enhancements (Later)
Better OCR

    Add image preprocessing (contrast, rotate)
    Game-specific OCR regions (template matching)
    Confidence scores for extractions
    Allow retry if OCR fails

Leaderboard Features

    Add time filters (today, week, all-time)
    Show recent submissions feed
    Add gamertag search
    Show detailed stats per gamertag

Data Management

    Add admin view to delete bad submissions
    Export leaderboard to CSV
    Add data reset option

MMR Improvements

    Different MMR formulas per game
    Decay for inactive players
    Win/loss tracking (if applicable)

Minimum Viable Product (1 Day)

To get something working ASAP, do this:

Hour 1:

    PocketBase setup + scores collection
    Basic HTML form with manual stat entry
    Skip OCR entirely

Hour 2:

    Simple MMR calculation (just average of stats)
    HTMX form submission

Hour 3:

    Basic leaderboard display
    Deploy PocketBase

Hour 4:

    Deploy frontend with password
    Test and fix bugs

Then add OCR later once the basic flow works.
Tech Decision: Still Use This Stack?

YES - even simpler now:

PocketBase:

    Perfect for this. You literally just need a database with an API
    No backend code needed
    Built-in admin panel to view/delete data

HTMX:

    Perfect for form submit + leaderboard updates
    No build process

Tesseract.js:

    Only concern: OCR in browser is slow (5-10 seconds)
    Consider starting WITHOUT OCR (manual entry)
    Add OCR as v2 feature

Alternative: If OCR is too slow, skip it entirely and just make a quick stat entry form. Users can manually type stats from their screenshots. Still useful!

Simpler Alternative to PocketBase:

    Supabase (free tier, easier deploy, has instant APIs)
    But PocketBase is actually simpler for this use case

Stick with the plan!
