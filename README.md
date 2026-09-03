# AI-Powered Calorie Tracker

A local fullstack application for tracking calories by photo, built for use on your phone. Each household member picks their name, does a one-time setup to get a personal daily calorie target for weight loss, then logs meals by photo — the Cohere API (vision) identifies the food and estimates calories, and a plate-ring progress gauge shows how today stacks up against their goal.

## Features

- Simple household sign-in (pick your name, no password)
- Setup calculates a daily calorie goal from your stats (Mifflin-St Jeor BMR, activity level, and target weight-loss rate)
- Log a meal photo with your phone's native camera/library picker
- Calorie and macro (protein/carbs/fat) estimate and food identification via Cohere's vision API — review and adjust before it's added to your log
- Edit or delete any logged entry, or add a food manually (with optional macros) without a photo — or hit "Estimate" to have the AI look up typical calories/macros for whatever you typed
- Scan a barcode to log packaged foods with exact nutrition from Open Food Facts, instead of an AI estimate
- Star any logged meal as a favorite for one-tap re-logging later
- Log workouts (pick an activity and duration) — calories burned are estimated from a MET-based formula and subtracted from the day's ring
- Daily progress ring (net calories vs. goal), a protein/carbs/fat summary, and a receipt-style daily log mixing meals and workouts, per person (stored in SQLite)
- Progress page: log your weight over time (with an optional goal weight) and see a 14-day calorie history
- Settings menu (top right) to update your fitness goals anytime, switch to dark mode, or switch users

## Tech Stack

- **Frontend:** React (Vite, TypeScript)
- **Backend:** Python (FastAPI)
- **Database:** SQLite (local)
- **AI:** Cohere API (image/vision and text) for food identification and nutrition estimates
- **Barcode data:** Open Food Facts API (free, no key required)

## Getting Started

Requires Node.js and Python 3.11+ installed locally, and a [Cohere API key](https://dashboard.cohere.com/api-keys).

**Backend:**
```
cd backend
pip install -r requirements.txt
cp .env.example .env   # then fill in COHERE_API_KEY
uvicorn main:app --reload
```

**Frontend** (in a separate terminal):
```
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (defaults to http://localhost:5173). Both servers need to be running.

## Running with Docker

Requires Docker and Docker Compose.

```
cd backend
cp .env.example .env   # then fill in COHERE_API_KEY
cd ..
docker compose up --build
```

Then open http://localhost:8080. The frontend container serves the built app via nginx and proxies `/api` requests to the backend container; meal/user data persists in a named Docker volume (`meals-data`) across restarts and rebuilds.

**Security note:** this app has no password — anyone who can reach it can act as any household member (by design, for trusted local-network use per the original README description). Don't expose the Docker containers directly to the public internet (e.g. via a port forward) without adding real authentication in front of them.
