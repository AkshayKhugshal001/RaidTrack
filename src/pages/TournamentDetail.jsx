import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

// ── Helpers ───────────────────────────────────────────────────
const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

// Generate all round-robin fixtures: every team plays every other team once
function generateLeagueFixtures(teams) {
  const fixtures = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      fixtures.push({ team1_id: teams[i].team_id, team2_id: teams[j].team_id })
    }
  }
  return fixtures
}

// Generate knockout bracket fixtures for round 1 (seeded 1v2N, 2v(2N-1), etc.)
function generateKnockoutRound1(teams) {
  const fixtures = []
  const n = teams.length
  for (let i = 0; i < n / 2; i++) {
    fixtures.push({ team1_id: teams[i].team_id, team2_id: teams[n - 1 - i].team_id })
  }
  return fixtures
}

function getRoundLabel(totalTeams, roundNum) {
  const rounds = Math.log2(totalTeams)
  const remaining = rounds - roundNum + 1
  if (remaining === 1) return "Final"
  if (remaining === 2) return "Semi Final"
  if (remaining === 3) return "Quarter Final"
  return `Round ${roundNum}`
}

// ── Nav ───────────────────────────────────────────────────────
const NAV = ({ navigate, tournamentName }) => (
  <nav className="rt-nav">
    <div className="rt-nav-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
      <div className="rt-nav-logo">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7.5" stroke="#000" strokeWidth="1.5"/>
          <path d="M5 9C5 9 7 5.5 9 9C11 12.5 13 9 13 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="rt-nav-title">Raid<span>Track</span></span>
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 3, color: "var(--cyan)", textTransform: "uppercase", flex: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 16px" }}>
      {tournamentName}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button className="rt-btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => navigate("/tournaments")}>
        ← Tournaments
      </button>
      <button className="rt-btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => navigate("/")}>
        Dashboard
      </button>
    </div>
  </nav>
)

// ── League Standings Table ────────────────────────────────────
function LeagueStandings({ standings }) {
  return (
    <div className="rt-card" style={{ borderTop: "3px solid var(--cyan)", marginBottom: 32 }}>
      <div className="rt-card-header">
        <span className="rt-card-title">Standings</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>
          Win=5 pts · Draw=1 pt · Loss=0
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["#", "Team", "P", "W", "D", "L", "SF", "SA", "Pts"].map(h => (
                <th key={h} style={{ padding: "10px 14px", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", textAlign: h === "Team" ? "left" : "center", fontWeight: 400 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => (
              <tr
                key={row.team_id}
                style={{ borderBottom: "1px solid var(--border)", background: idx === 0 ? "rgba(255,214,0,0.04)" : "transparent" }}
              >
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: idx === 0 ? "var(--yellow)" : "var(--muted)", letterSpacing: 1 }}>
                    {idx + 1}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: idx === 0 ? "var(--yellow)" : "#fff", textTransform: "uppercase" }}>
                    {row.teams?.name}
                  </div>
                </td>
                {[row.played, row.wins, row.draws, row.losses, row.score_for, row.score_against].map((val, i) => (
                  <td key={i} style={{ padding: "12px 14px", textAlign: "center", fontFamily: "var(--font-display)", fontSize: 16, color: "var(--muted)", letterSpacing: 1 }}>
                    {val}
                  </td>
                ))}
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 1, color: idx === 0 ? "var(--yellow)" : "#fff" }}>
                    {row.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Knockout Bracket ──────────────────────────────────────────
function KnockoutBracket({ matches, teamMap, totalTeams }) {
  const maxRound = Math.log2(totalTeams)

  // Group matches by round
  const rounds = {}
  for (let r = 1; r <= maxRound; r++) {
    rounds[r] = matches.filter(m => m.tournament_round === r)
  }

  return (
    <div className="rt-card" style={{ borderTop: "3px solid var(--cyan)", marginBottom: 32, overflowX: "auto" }}>
      <div className="rt-card-header">
        <span className="rt-card-title">Bracket</span>
      </div>
      <div style={{ padding: "20px", display: "flex", gap: 20, minWidth: maxRound * 220 }}>
        {Array.from({ length: maxRound }, (_, i) => i + 1).map(round => (
          <div key={round} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "space-around" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 3, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
              {getRoundLabel(totalTeams, round)}
            </div>
            {rounds[round]?.length > 0 ? rounds[round].map(m => {
              const t1 = teamMap[m.team1_id]
              const t2 = teamMap[m.team2_id]
              const isCompleted = m.status === "completed" || m.status === "draw"
              const winner = isCompleted
                ? m.team1_score > m.team2_score ? m.team1_id
                : m.team2_score > m.team1_score ? m.team2_id
                : null
                : null
              return (
                <div key={m.id} style={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  {[{ id: m.team1_id, name: t1, score: m.team1_score }, { id: m.team2_id, name: t2, score: m.team2_score }].map((team, ti) => (
                    <div key={ti} style={{
                      padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: ti === 0 ? "1px solid var(--border)" : "none",
                      background: winner === team.id ? "rgba(255,214,0,0.08)" : "transparent",
                    }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 1, color: winner === team.id ? "var(--yellow)" : team.name ? "#fff" : "var(--muted)", textTransform: "uppercase" }}>
                        {team.name || "TBD"}
                      </span>
                      {isCompleted && (
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: winner === team.id ? "var(--yellow)" : "var(--muted)" }}>
                          {team.score}
                        </span>
                      )}
                    </div>
                  ))}
                  <div style={{ padding: "4px 12px", background: "rgba(0,0,0,0.3)" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: m.status === "live" ? "var(--orange)" : "var(--muted)" }}>
                      {m.status === "live" ? "● Live" : m.status === "completed" ? "Final" : m.status === "paused" ? "Paused" : "Upcoming"}
                    </span>
                  </div>
                </div>
              )
            }) : (
              <div style={{ background: "var(--card2)", border: "1px dashed var(--border)", borderRadius: 4, padding: "24px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: 1 }}>Waiting</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Match Row ─────────────────────────────────────────────────
function MatchRow({ match, onStart, hasLiveMatch, navigate }) {
  const isLive      = match.status === "live"
  const isPaused    = match.status === "paused"
  const isOngoing   = isLive || isPaused
  const isCompleted = match.status === "completed" || match.status === "draw"
  const isUpcoming  = match.status === "upcoming"

  const accentColor = isLive ? "var(--orange)" : isPaused ? "var(--yellow)" : isCompleted ? "rgba(255,255,255,0.15)" : "var(--muted)"

  const winner = isCompleted
    ? match.team1_score > match.team2_score ? match.team1?.name
    : match.team2_score > match.team1_score ? match.team2?.name
    : "Draw"
    : null

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${accentColor}`,
      borderRadius: 4, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
    }}>
      {/* Round label + status */}
      <div style={{ minWidth: 90 }}>
        {match.round_label && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--cyan)", marginBottom: 4 }}>
            {match.round_label}
          </div>
        )}
        <div style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, padding: "2px 7px", border: `1px solid ${accentColor}`, borderRadius: 2, display: "inline-block" }}>
          {isLive ? "Live" : isPaused ? "Paused" : isCompleted ? (match.status === "draw" ? "Draw" : "Final") : "Upcoming"}
        </div>
        {isOngoing && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--muted)", marginTop: 4, letterSpacing: 1 }}>
            {fmt(match.time_remaining)}
          </div>
        )}
      </div>

      {/* Teams + Score */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>
            {match.team1?.name}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          {isUpcoming ? (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--muted)" }}>vs</div>
          ) : (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2 }}>
              <span style={{ color: "var(--yellow)" }}>{match.team1_score}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 6px" }}>–</span>
              <span style={{ color: "#fff" }}>{match.team2_score}</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>
            {match.team2?.name}
          </div>
        </div>
      </div>

      {/* Winner */}
      {winner && winner !== "Draw" && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", letterSpacing: 1, textTransform: "uppercase", minWidth: 80, textAlign: "right" }}>
          {winner} Won
        </div>
      )}
      {winner === "Draw" && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: 1, textTransform: "uppercase", minWidth: 80, textAlign: "right" }}>
          Draw
        </div>
      )}

      {/* Actions */}
      {isOngoing && (
        <button className="rt-btn-primary" style={{ fontSize: 13, padding: "7px 18px", flexShrink: 0 }} onClick={() => navigate(`/live-match/${match.id}`)}>
          Resume →
        </button>
      )}
      {isUpcoming && (
        <button
          className="rt-btn-primary"
          style={{ fontSize: 13, padding: "7px 18px", flexShrink: 0, opacity: hasLiveMatch ? 0.4 : 1 }}
          disabled={hasLiveMatch}
          title={hasLiveMatch ? "Finish the ongoing match first" : ""}
          onClick={() => onStart(match.id)}
        >
          {hasLiveMatch ? "Match Live" : "Start →"}
        </button>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
function TournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tournament,  setTournament]  = useState(null)
  const [standings,   setStandings]   = useState([])   // tournament_teams rows sorted by points
  const [matches,     setMatches]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState("")
  const [tab,         setTab]         = useState("fixtures") // "fixtures" | "standings/bracket"

  const fetchAll = useCallback(async () => {
    // Load tournament
    const { data: t } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single()
    setTournament(t)

    // Load standings (tournament_teams with team name)
    const { data: tt } = await supabase
      .from("tournament_teams")
      .select("*, teams(name)")
      .eq("tournament_id", id)
      .order("points", { ascending: false })
    setStandings(tt || [])

    // Load matches for this tournament
    const { data: m } = await supabase
      .from("matches")
      .select("*, team1:team1_id(name), team2:team2_id(name)")
      .eq("tournament_id", id)
      .order("tournament_round", { ascending: true })
      .order("created_at", { ascending: true })
    setMatches(m || [])

    setLoading(false)
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  // After a match completes we need to update standings + possibly generate next knockout round
  // We poll every 5s if any match is live
  useEffect(() => {
    const hasLive = matches.some(m => m.status === "live" || m.status === "paused")
    if (!hasLive) return
    const iv = setInterval(fetchAll, 5000)
    return () => clearInterval(iv)
  }, [matches, fetchAll])

  const hasLiveMatch   = matches.some(m => m.status === "live")
  const fixturesExist  = matches.length > 0

  // ── Generate league fixtures ───────────────────────────────
  const generateLeagueMatches = async () => {
    if (fixturesExist) return
    setGenerating(true)
    setError("")

    const fixtures = generateLeagueFixtures(standings)
    const rows = fixtures.map(f => ({
      team1_id:       f.team1_id,
      team2_id:       f.team2_id,
      tournament_id:  id,
      tournament_round: 1,
      round_label:    "League",
      time_remaining: tournament.half_duration,
      half_duration:  tournament.half_duration,
      status:         "upcoming",
      team1_score:    0,
      team2_score:    0,
      is_running:     false,
    }))

    const { error: e } = await supabase.from("matches").insert(rows)
    if (e) { setError("Failed to generate fixtures: " + e.message); setGenerating(false); return }

    // Move tournament to ongoing
    await supabase.from("tournaments").update({ status: "ongoing" }).eq("id", id)
    await fetchAll()
    setGenerating(false)
    setTab("fixtures")
  }

  // ── Generate knockout round 1 ──────────────────────────────
  const generateKnockoutRound1 = async () => {
    if (fixturesExist) return
    setGenerating(true)
    setError("")

    const fixtures = generateKnockoutRound1Fn(standings)
    const roundLabel = getRoundLabel(standings.length, 1)
    const rows = fixtures.map(f => ({
      team1_id:       f.team1_id,
      team2_id:       f.team2_id,
      tournament_id:  id,
      tournament_round: 1,
      round_label:    roundLabel,
      time_remaining: tournament.half_duration,
      half_duration:  tournament.half_duration,
      status:         "upcoming",
      team1_score:    0,
      team2_score:    0,
      is_running:     false,
    }))

    const { error: e } = await supabase.from("matches").insert(rows)
    if (e) { setError("Failed to generate bracket: " + e.message); setGenerating(false); return }

    await supabase.from("tournaments").update({ status: "ongoing" }).eq("id", id)
    await fetchAll()
    setGenerating(false)
    setTab("fixtures")
  }

  // ── After a knockout match completes, update standings & generate next round ─
  const handleMatchComplete = useCallback(async (completedMatch) => {
    if (!tournament || tournament.format !== "knockout") return

    const currentRound = completedMatch.tournament_round
    const roundMatches = matches.filter(m => m.tournament_round === currentRound)
    const allDone = roundMatches.every(m => m.status === "completed" || m.status === "draw")
    if (!allDone) return

    // Check if this was the final
    const maxRound = Math.log2(standings.length)
    if (currentRound >= maxRound) {
      await supabase.from("tournaments").update({ status: "completed" }).eq("id", id)
      await fetchAll()
      return
    }

    // Generate next round with winners
    const nextRound = currentRound + 1
    const nextRoundLabel = getRoundLabel(standings.length, nextRound)

    const winners = roundMatches.map(m => {
      if (m.team1_score > m.team2_score) return m.team1_id
      if (m.team2_score > m.team1_score) return m.team2_id
      return m.team1_id // in case of draw, team1 advances (rare edge case)
    })

    const nextFixtures = []
    for (let i = 0; i < winners.length; i += 2) {
      nextFixtures.push({ team1_id: winners[i], team2_id: winners[i + 1] })
    }

    const rows = nextFixtures.map(f => ({
      team1_id:       f.team1_id,
      team2_id:       f.team2_id,
      tournament_id:  id,
      tournament_round: nextRound,
      round_label:    nextRoundLabel,
      time_remaining: tournament.half_duration,
      half_duration:  tournament.half_duration,
      status:         "upcoming",
      team1_score:    0,
      team2_score:    0,
      is_running:     false,
    }))

    await supabase.from("matches").insert(rows)
    await fetchAll()
  }, [tournament, matches, standings, id, fetchAll])

  // ── Start a match ─────────────────────────────────────────
  const startMatch = async (matchId) => {
    navigate(`/live-match/${matchId}`)
  }

  // ── Update league standings after a completed match ───────
  const syncLeagueStandings = useCallback(async () => {
    if (!tournament || tournament.format !== "league") return
    const completedMatches = matches.filter(m => m.status === "completed" || m.status === "draw")

    // Recalculate all standings from scratch
    const stats = {}
    standings.forEach(row => {
      stats[row.team_id] = { played: 0, wins: 0, losses: 0, draws: 0, points: 0, score_for: 0, score_against: 0 }
    })

    completedMatches.forEach(m => {
      if (!stats[m.team1_id] || !stats[m.team2_id]) return
      stats[m.team1_id].played++
      stats[m.team2_id].played++
      stats[m.team1_id].score_for      += m.team1_score
      stats[m.team1_id].score_against  += m.team2_score
      stats[m.team2_id].score_for      += m.team2_score
      stats[m.team2_id].score_against  += m.team1_score

      if (m.status === "draw") {
        stats[m.team1_id].draws++; stats[m.team1_id].points += 1
        stats[m.team2_id].draws++; stats[m.team2_id].points += 1
      } else if (m.team1_score > m.team2_score) {
        stats[m.team1_id].wins++; stats[m.team1_id].points += 5
        stats[m.team2_id].losses++
      } else {
        stats[m.team2_id].wins++; stats[m.team2_id].points += 5
        stats[m.team1_id].losses++
      }
    })

    // Push updates to DB
    for (const [team_id, s] of Object.entries(stats)) {
      await supabase.from("tournament_teams").update(s).eq("tournament_id", id).eq("team_id", team_id)
    }

    // Check if all league fixtures are done
    const total = matches.length
    if (total > 0 && completedMatches.length === total) {
      await supabase.from("tournaments").update({ status: "completed" }).eq("id", id)
    }

    await fetchAll()
  }, [tournament, matches, standings, id, fetchAll])

  // Watch for newly completed matches and sync
  useEffect(() => {
    const prev = matches.filter(m => m.status === "completed" || m.status === "draw").length
    if (prev === 0) return

    if (tournament?.format === "league") {
      syncLeagueStandings()
    } else if (tournament?.format === "knockout") {
      const lastCompleted = matches.find(m => m.status === "completed" || m.status === "draw")
      if (lastCompleted) handleMatchComplete(lastCompleted)
    }
  }, [matches.map(m => m.status).join(",")])

  // ── Derived ───────────────────────────────────────────────
  const teamMap = {}
  standings.forEach(row => { teamMap[row.team_id] = row.teams?.name })

  const ongoingMatches   = matches.filter(m => m.status === "live" || m.status === "paused")
  const upcomingMatches  = matches.filter(m => m.status === "upcoming")
  const completedMatches = matches.filter(m => m.status === "completed" || m.status === "draw")

  const currentKnockoutRound = matches.length > 0 ? Math.max(...matches.map(m => m.tournament_round || 1)) : 0
  const currentRoundMatches  = matches.filter(m => m.tournament_round === currentKnockoutRound)
  const currentRoundDone     = currentRoundMatches.length > 0 && currentRoundMatches.every(m => m.status === "completed" || m.status === "draw")

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 4, color: "var(--muted)" }}>Loading...</div>
    </div>
  )

  if (!tournament) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 4, color: "var(--orange)" }}>Tournament not found.</div>
    </div>
  )

  const statusColor = tournament.status === "ongoing" ? "var(--orange)" : tournament.status === "completed" ? "var(--muted)" : "var(--cyan)"

  return (
    <div className="rt-page">
      <NAV navigate={navigate} tournamentName={tournament.name} />

      {/* Ticker */}
      <div style={{ background: "var(--cyan)", padding: "5px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", gap: 48, animation: "rt-ticker 22s linear infinite" }}>
          {[tournament.name, `${standings.length} Teams`, `${tournament.format === "league" ? "Round Robin" : "Knockout Bracket"}`, `${tournament.half_duration / 60}m Halves`, tournament.name, `${standings.length} Teams`, `${tournament.format === "league" ? "Round Robin" : "Knockout Bracket"}`, `${tournament.half_duration / 60}m Halves`].map((text, i) => (
            <span key={i} style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#000" }}>
              {text}
              {i % 4 !== 3 && <span style={{ color: "rgba(0,0,0,0.4)", marginLeft: 12 }}>●</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: statusColor, padding: "3px 10px", border: `1px solid ${statusColor}`, borderRadius: 2 }}>
              {tournament.status}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--cyan)", padding: "3px 10px", border: "1px solid var(--cyan)", borderRadius: 2 }}>
              {tournament.format === "league" ? "League" : "Knockout"}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: 3, textTransform: "uppercase", color: "#fff", lineHeight: 1, marginBottom: 8 }}>
            {tournament.name}
          </h1>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", letterSpacing: 1 }}>
            {standings.length} teams · {tournament.half_duration / 60}m halves · {matches.length} fixtures · {completedMatches.length} played
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Teams",     value: standings.length,       color: "var(--cyan)"   },
            { label: "Fixtures",  value: matches.length,         color: "var(--yellow)" },
            { label: "Played",    value: completedMatches.length, color: "var(--green)"  },
            { label: "Remaining", value: upcomingMatches.length + ongoingMatches.length, color: "var(--orange)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: `3px solid ${s.color}`, borderRadius: 4, padding: "16px 20px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 2, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Generate Fixtures button (shown when no fixtures exist yet) */}
        {!fixturesExist && tournament.status !== "completed" && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--cyan)", borderRadius: 4, padding: "32px 24px", textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "#fff", marginBottom: 8 }}>Ready to Start</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 20 }}>
              {tournament.format === "league"
                ? `Auto-generate ${standings.length * (standings.length - 1) / 2} round-robin fixtures for ${standings.length} teams.`
                : `Auto-generate the Round 1 bracket for ${standings.length} teams.`}
            </div>
            {error && (
              <div style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.3)", borderRadius: 3, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--orange)", marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button
              className="rt-btn-primary"
              style={{ fontSize: 18, padding: "12px 40px", background: "var(--cyan)", color: "#000" }}
              disabled={generating}
              onClick={tournament.format === "league" ? generateLeagueMatches : generateKnockoutRound1}
            >
              {generating ? "Generating..." : tournament.format === "league" ? "Generate All Fixtures →" : "Generate Bracket →"}
            </button>
          </div>
        )}

        {/* Generate next knockout round */}
        {tournament.format === "knockout" && fixturesExist && currentRoundDone && tournament.status !== "completed" && (
          <div style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 4, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--cyan)" }}>
                {getRoundLabel(standings.length, currentKnockoutRound)} Complete!
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 4 }}>
                Ready to generate {getRoundLabel(standings.length, currentKnockoutRound + 1)}
              </div>
            </div>
            <button
              className="rt-btn-primary"
              style={{ fontSize: 15, padding: "10px 28px", background: "var(--cyan)", color: "#000", flexShrink: 0 }}
              disabled={generating}
              onClick={async () => {
                setGenerating(true)
                const nextRound = currentKnockoutRound + 1
                const nextLabel = getRoundLabel(standings.length, nextRound)
                const winners = currentRoundMatches.map(m =>
                  m.team1_score >= m.team2_score ? m.team1_id : m.team2_id
                )
                const nextFixtures = []
                for (let i = 0; i < winners.length; i += 2) {
                  nextFixtures.push({ team1_id: winners[i], team2_id: winners[i + 1] })
                }
                const rows = nextFixtures.map(f => ({
                  team1_id: f.team1_id, team2_id: f.team2_id,
                  tournament_id: id, tournament_round: nextRound, round_label: nextLabel,
                  time_remaining: tournament.half_duration, half_duration: tournament.half_duration,
                  status: "upcoming", team1_score: 0, team2_score: 0, is_running: false,
                }))
                await supabase.from("matches").insert(rows)
                await fetchAll()
                setGenerating(false)
              }}
            >
              {generating ? "Generating..." : `Generate ${getRoundLabel(standings.length, currentKnockoutRound + 1)} →`}
            </button>
          </div>
        )}

        {/* Tournament completed banner */}
        {tournament.status === "completed" && (
          <div style={{ background: "rgba(255,214,0,0.08)", border: "2px solid var(--yellow)", borderRadius: 4, padding: "24px", textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 4, color: "var(--yellow)", textTransform: "uppercase", marginBottom: 8 }}>🏆 Tournament Complete</div>
            {tournament.format === "league" && standings.length > 0 && (
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>
                Champion: <span style={{ color: "var(--yellow)" }}>{standings[0]?.teams?.name}</span>
              </div>
            )}
            {tournament.format === "knockout" && (() => {
              const finalMatch = matches.find(m => m.round_label === "Final" && (m.status === "completed" || m.status === "draw"))
              if (!finalMatch) return null
              const champId = finalMatch.team1_score >= finalMatch.team2_score ? finalMatch.team1_id : finalMatch.team2_id
              return (
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>
                  Champion: <span style={{ color: "var(--yellow)" }}>{teamMap[champId]}</span>
                </div>
              )
            })()}
          </div>
        )}

        {/* Tabs */}
        {fixturesExist && (
          <>
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
              {[
                { key: "fixtures",         label: "Fixtures" },
                { key: "standings_bracket", label: tournament.format === "league" ? "Standings" : "Bracket" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: 2, textTransform: "uppercase",
                    padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
                    color: tab === t.key ? "var(--cyan)" : "var(--muted)",
                    borderBottom: tab === t.key ? "2px solid var(--cyan)" : "2px solid transparent",
                    marginBottom: "-1px", transition: "color 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Standings / Bracket tab */}
            {tab === "standings_bracket" && (
              tournament.format === "league"
                ? <LeagueStandings standings={standings} />
                : <KnockoutBracket matches={matches} teamMap={teamMap} totalTeams={standings.length} />
            )}

            {/* Fixtures tab */}
            {tab === "fixtures" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {ongoingMatches.length > 0 && (
                  <div>
                    <div className="rt-section-label" style={{ color: "var(--orange)" }}>Ongoing ({ongoingMatches.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ongoingMatches.map(m => <MatchRow key={m.id} match={m} navigate={navigate} hasLiveMatch={hasLiveMatch} onStart={startMatch} />)}
                    </div>
                  </div>
                )}

                {upcomingMatches.length > 0 && (
                  <div>
                    <div className="rt-section-label" style={{ color: "var(--yellow)" }}>Upcoming ({upcomingMatches.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {upcomingMatches.map(m => <MatchRow key={m.id} match={m} navigate={navigate} hasLiveMatch={hasLiveMatch} onStart={startMatch} />)}
                    </div>
                  </div>
                )}

                {completedMatches.length > 0 && (
                  <div>
                    <div className="rt-section-label" style={{ color: "var(--muted)" }}>Completed ({completedMatches.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {completedMatches.map(m => <MatchRow key={m.id} match={m} navigate={navigate} hasLiveMatch={false} onStart={startMatch} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// expose the helper with a different name to avoid naming collision
function generateKnockoutRound1Fn(teams) {
  const fixtures = []
  const n = teams.length
  for (let i = 0; i < n / 2; i++) {
    fixtures.push({ team1_id: teams[i].team_id, team2_id: teams[n - 1 - i].team_id })
  }
  return fixtures
}

export default TournamentDetail