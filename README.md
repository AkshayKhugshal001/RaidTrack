# RaidTrack — Pro Kabaddi Match Management System

A full-stack web application for managing and scoring Kabaddi matches following official Pro Kabaddi League (PKL) rules.

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
| Realtime | Supabase Realtime |
| Deployment | Vercel |
| Version Control | Git + GitHub |

---

## Features

### Referee / Host
- Email + password authentication
- Create and manage teams
- Add, remove and assign players (Raider / Defender / Allrounder)
- Create matches between two teams
- Coin toss to decide who raids first
- Full live match management with PKL rules enforced

### Live Match Engine
- 20-minute halves with auto half-time pause
- Strict alternating raids — same team cannot raid twice
- 30-second raid clock with auto timeout
- Tag defending players during raid
- Bonus line point toggle
- Do-or-Die raid enforcement (after 2 consecutive empty raids)
- Super Raid detection (3+ tags in one raid)
- Super Tackle detection (≤3 defenders on mat = 2 pts)
- All-Out detection with +2 bonus and full team revival
- Per-team out queue with FIFO revival sequence
- Correct PKL revival rule — team revives own players per point scored
- Visual + audio alerts for all special events

### Viewer Mode
- Fully public — no login required
- See all live, paused and completed matches
- Real-time scoreboard via Supabase Realtime
- Live events feed (score updates, half time, full time)
- Connected indicator

---

## Database Schema
```
teams
- id, name, created_at

players
- id, name, position, team_id

matches
- id, team1_id, team2_id, team1_score, team2_score
- time_remaining, is_running, created_at

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
    AuthContext.jsx       ← Supabase auth state
  pages/
    Login.jsx             ← Role selection + referee login
    Dashboard.jsx         ← Referee home
    CreateMatch.jsx       ← Match setup
    LiveMatch.jsx         ← Full referee match tool
    Teams.jsx             ← Team management
    TeamDetail.jsx        ← Player roster
    ViewerHome.jsx        ← Public match list
    ViewerMatch.jsx       ← Public live scoreboard
  services/
    supabaseClient.js     ← Supabase connection
  App.jsx                 ← Routes + auth protection
  main.jsx
  index.css               ← Design tokens + shared styles
index.html                ← Fonts (Bebas Neue + Rajdhani)
```

---

## Local Development
```bash
# Clone the repo
git clone https://github.com/AkshayKhugshal001/RaidTrack.git
cd RaidTrack

# Install dependencies
npm install

# Create .env file
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Authentication

| Role | Access |
|---|---|
| Referee / Host | Full access — manage teams, players, matches |
| Viewer | Read-only — watch live matches in real time |

Referee accounts are created manually via the Supabase dashboard under **Authentication → Users**.

---

## PKL Rules Implemented

| Rule | Status |
|---|---|
| Alternating raids | ✅ |
| 30-sec raid clock | ✅ |
| Do-or-Die raid | ✅ |
| Super Raid (3+ tags) | ✅ |
| Super Tackle (≤3 defenders) | ✅ |
| All-Out (+2 bonus) | ✅ |
| Bonus line point | ✅ |
| FIFO revival queue | ✅ |
| Correct revival rule | ✅ |
| Half-time auto pause | ✅ |
| Coin toss | ✅ |

---

## Deployment

Connected to GitHub via Vercel. Every push to `main` triggers an automatic redeployment.

Environment variables are configured in Vercel dashboard under **Settings → Environment Variables**.

---

## Developed By

Akshay Khugshal
PBL Full Stack Project — 2025