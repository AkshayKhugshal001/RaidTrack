# RaidTrack — Pro Kabaddi Match Management System

A full-stack web application for managing and scoring Kabaddi matches following official Pro Kabaddi League (PKL) rules. Built as a PBL Full Stack Project.

---

## Live Demo

Deployed on Vercel — [your-vercel-url.vercel.app]

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Supabase (BaaS) |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (Email/Password) |
| Realtime | Polling (3s interval) |
| Deployment | Vercel |
| Version Control | Git + GitHub |

---

## Features

### Referee / Host
- Email + password authentication via Supabase Auth
- Create and manage teams
- Add, remove and assign players (Raider / Defender / Allrounder)
- Create matches with custom half duration (3–20 min per half)
- Coin toss to decide who raids first
- Full live match management with all PKL rules enforced
- Resume ongoing matches after refresh or relogin
- Match history with results
- Quit match as Draw with reason

### Live Match Engine
- Custom half duration — 3 to 20 minutes per half
- 2 halves with auto half-time pause and raid swap
- Strict alternating raids — same team cannot raid twice in a row
- 30-second raid clock with auto empty raid on timeout
- Tag defending players during raid
- Bonus line point toggle (+1 regardless of outcome)
- Do-or-Die raid (after 2 consecutive empty raids per team)
- Super Raid detection (3+ tags in one raid)
- Super Tackle detection (≤3 defenders = +2 pts)
- All-Out detection (+2 bonus, full team revival)
- Per-team out queue with FIFO revival sequence
- Correct PKL revival rule — team revives own players per point scored
- Tackle revives exactly 1 defending player
- Visual + audio alerts for all special events
- All events broadcast to viewer feed

### Viewer Mode
- Fully public — no login required
- See all live, paused, upcoming and completed matches
- Live scoreboard — auto updates every 3 seconds
- Live events feed (raids, tackles, Super Raids, All-Out etc.)
- Shows raider name, defenders tagged, points scored
- Timer syncs from DB — never resets on refresh
- Match history with final scores and results

### Dashboard
- Ongoing matches with Resume button
- Upcoming fixtures — cannot start two matches simultaneously
- Match history with winner, score and draw reasons
- No duplicate buttons — clean single action per task

---

## Database Schema
```
teams
- id, name, created_at

players
- id, name, position (raider/defender/allrounder), team_id

matches
- id, team1_id, team2_id
- team1_score, team2_score
- time_remaining, half_duration
- is_running, status (upcoming/live/paused/completed/draw)
- result, quit_reason, ended_at
- last_event, created_at

player_match_stats
- id, match_id, player_id
- raid_attempts, successful_raids, raid_points
- tackle_attempts, successful_tackles, tackle_points
- total_points
```

---

## Project Structure
```
src/
  context/
    AuthContext.jsx         ← Supabase auth state + signIn/signOut
  pages/
    Login.jsx               ← Role selection + referee login
    Dashboard.jsx           ← Ongoing, upcoming, completed matches
    CreateMatch.jsx         ← Match setup with custom time
    LiveMatch.jsx           ← Full PKL referee tool
    Teams.jsx               ← Team management
    TeamDetail.jsx          ← Player roster + add/remove players
    ViewerHome.jsx          ← Public match list
    ViewerMatch.jsx         ← Public live scoreboard (polling)
  services/
    supabaseClient.js       ← Supabase connection
  App.jsx                   ← Routes + protected routes
  main.jsx
  index.css                 ← Design tokens + shared styles
index.html                  ← Bebas Neue + Rajdhani fonts
vercel.json                 ← SPA routing fix for Vercel
```

---

## Local Development
```bash
# Clone the repo
git clone https://github.com/AkshayKhugshal001/RaidTrack.git
cd RaidTrack

# Install dependencies
npm install

# Create .env file in root
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Set these in `.env` for local dev and in Vercel dashboard for production.

---

## Authentication

| Role | Access |
|---|---|
| Referee / Host | Full access — manage teams, players, matches |
| Viewer | Read-only — watch live matches, no login needed |

Referee accounts are created manually via Supabase dashboard → Authentication → Users.

---

## PKL Rules Implemented

| Rule | Status |
|---|---|
| Alternating raids (no team raids twice) | ✅ |
| 30-sec raid clock with auto timeout | ✅ |
| Do-or-Die raid (per team, after 2 empty) | ✅ |
| Super Raid (3+ tags = alert) | ✅ |
| Super Tackle (≤3 defenders = +2 pts) | ✅ |
| All-Out (+2 bonus + full revival) | ✅ |
| Bonus line point | ✅ |
| FIFO revival queue per team | ✅ |
| Team revives own players per point | ✅ |
| Tackle revives exactly 1 defender | ✅ |
| Half-time auto pause + raid swap | ✅ |
| Coin toss before match | ✅ |
| Custom half duration (3–20 min) | ✅ |

---

## Deployment

Connected to GitHub via Vercel. Every push to `main` triggers automatic redeployment.

Environment variables configured in Vercel → Settings → Environment Variables.

`vercel.json` handles SPA routing so page refresh works on all routes.

---

## Developed By

Akshay Khugshal  
PBL Full Stack Project — 2025