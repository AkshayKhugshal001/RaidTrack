import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

function ViewerHome() {
  const [matches,     setMatches]     = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState("matches") // "matches" | "tournaments"
  const [expandedT,   setExpandedT]   = useState(null)     // expanded tournament id
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: m }, { data: t }] = await Promise.all([
      supabase.from("matches").select(`*, team1:team1_id(name), team2:team2_id(name)`).order("created_at", { ascending: false }),
      supabase.from("tournaments").select("*, tournament_teams(team_id, teams(name))").order("created_at", { ascending: false }),
    ])
    setMatches(m || [])
    setTournaments(t || [])
    setLoading(false)
  }

  // For matches tab — only standalone (non-tournament) matches
  const standaloneMatches = matches.filter(m => !m.tournament_id)
  const liveMatches      = standaloneMatches.filter(m => m.status === "live")
  const pausedMatches    = standaloneMatches.filter(m => m.status === "paused")
  const upcomingMatches  = standaloneMatches.filter(m => m.status === "upcoming")
  const completedMatches = standaloneMatches.filter(m => m.status === "completed" || m.status === "draw")

  const tabStyle = (key) => ({
    fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, textTransform: "uppercase",
    padding: "10px 24px", background: "none", border: "none", cursor: "pointer",
    color: tab === key ? "var(--cyan)" : "var(--muted)",
    borderBottom: tab === key ? "2px solid var(--cyan)" : "2px solid transparent",
    marginBottom: "-1px", transition: "color 0.15s",
  })

  return (
    <div className="rt-page">

      {/* Nav */}
      <nav className="rt-nav">
        <div className="rt-nav-brand">
          <div className="rt-nav-logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#000" strokeWidth="1.5"/>
              <path d="M5 9C5 9 7 5.5 9 9C11 12.5 13 9 13 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="rt-nav-title">Raid<span>Track</span></span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 3, color: "var(--cyan)", textTransform: "uppercase" }}>
          Viewer Mode
        </div>
        <button
          className="rt-btn-secondary"
          style={{ fontSize: 13, padding: "6px 16px" }}
          onClick={() => navigate("/login")}
        >
          Referee Login
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 5, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 12 }}>
            Viewer Mode
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: 3, color: "#fff", textTransform: "uppercase", lineHeight: 1 }}>
            Watch Live
          </h1>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, marginTop: 12 }}>
            Real-time scores · no login required
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
          <button style={tabStyle("matches")}   onClick={() => setTab("matches")}>Matches</button>
          <button style={tabStyle("tournaments")} onClick={() => setTab("tournaments")}>Tournaments</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "var(--muted)" }}>Loading...</div>
          </div>
        ) : tab === "matches" ? (
          <>
            {/* Live */}
            {liveMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--orange)" }}>Live Now ({liveMatches.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {liveMatches.map(match => (
                    <MatchCard key={match.id} match={match} status="live" onClick={() => navigate(`/viewer/${match.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Paused */}
            {pausedMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--yellow)" }}>In Progress — Paused ({pausedMatches.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pausedMatches.map(match => (
                    <MatchCard key={match.id} match={match} status="paused" onClick={() => navigate(`/viewer/${match.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--muted)" }}>Upcoming Fixtures ({upcomingMatches.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {upcomingMatches.map(match => (
                    <MatchCard key={match.id} match={match} status="upcoming" onClick={() => navigate(`/viewer/${match.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--muted)" }}>Match History ({completedMatches.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completedMatches.map(match => (
                    <MatchCard key={match.id} match={match} status={match.status} onClick={() => navigate(`/viewer/${match.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {standaloneMatches.length === 0 && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "64px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "var(--muted)", marginBottom: 12 }}>No Matches Yet</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Check back when a referee starts a match.</div>
              </div>
            )}
          </>
        ) : (
          /* ── Tournaments Tab ─────────────────────────── */
          <>
            {tournaments.length === 0 ? (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "64px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "var(--muted)", marginBottom: 12 }}>No Tournaments Yet</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Check back when a referee creates a tournament.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {tournaments.map(t => {
                  const isExpanded = expandedT === t.id
                  const tMatches = matches.filter(m => m.tournament_id === t.id)
                  const tLive = tMatches.filter(m => m.status === "live")
                  const tUpcoming = tMatches.filter(m => m.status === "upcoming")
                  const tCompleted = tMatches.filter(m => m.status === "completed" || m.status === "draw")
                  const accentColor =
                    t.status === "ongoing"   ? "var(--orange)" :
                    t.status === "completed" ? "var(--muted)"  : "var(--cyan)"

                  return (
                    <div key={t.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${accentColor}`, borderRadius: 4, overflow: "hidden" }}>
                      {/* Tournament header row */}
                      <div
                        onClick={() => setExpandedT(isExpanded ? null : t.id)}
                        style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Status badge */}
                        <div style={{ minWidth: 90 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, padding: "3px 8px", border: `1px solid ${accentColor}`, borderRadius: 2, display: "inline-block", marginBottom: 4 }}>
                            {t.status}
                          </div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase" }}>
                            {t.format}
                          </div>
                        </div>

                        {/* Name + info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: 4 }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: 1 }}>
                            {t.tournament_teams?.length} teams · {t.half_duration / 60}m halves · {tCompleted.length}/{tMatches.length} played
                          </div>
                        </div>

                        {/* Live badge */}
                        {tLive.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="rt-live-dot" style={{ background: "var(--orange)" }} />
                            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 2, color: "var(--orange)", textTransform: "uppercase" }}>
                              {tLive.length} Live
                            </span>
                          </div>
                        )}

                        {/* Expand arrow */}
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ opacity: 0.4, flexShrink: 0, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
                          <path d="M6 3l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>

                      {/* Expanded: matches inside this tournament */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: "var(--card2)" }}>
                          {tMatches.length === 0 ? (
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>No fixtures generated yet.</div>
                          ) : (
                            <>
                              {tLive.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: 3, color: "var(--orange)", textTransform: "uppercase", marginBottom: 8 }}>● Live</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {tLive.map(m => <ViewerMatchRow key={m.id} match={m} onClick={() => navigate(`/viewer/${m.id}`)} />)}
                                  </div>
                                </div>
                              )}
                              {tUpcoming.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Upcoming</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {tUpcoming.map(m => <ViewerMatchRow key={m.id} match={m} onClick={() => navigate(`/viewer/${m.id}`)} />)}
                                  </div>
                                </div>
                              )}
                              {tCompleted.length > 0 && (
                                <div>
                                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Results</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {tCompleted.map(m => <ViewerMatchRow key={m.id} match={m} onClick={() => navigate(`/viewer/${m.id}`)} />)}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Compact match row for tournament viewer ───────────────────
function ViewerMatchRow({ match, onClick }) {
  const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
  const isLive      = match.status === "live"
  const isUpcoming  = match.status === "upcoming"
  const isCompleted = match.status === "completed" || match.status === "draw"

  const accentColor = isLive ? "var(--orange)" : isCompleted ? "rgba(255,255,255,0.15)" : "var(--muted)"

  const winner = isCompleted
    ? match.team1_score > match.team2_score ? match.team1?.name
    : match.team2_score > match.team1_score ? match.team2?.name
    : "Draw"
    : null

  return (
    <div
      onClick={onClick}
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `2px solid ${accentColor}`, borderRadius: 3, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
      onMouseEnter={e => e.currentTarget.style.background = "#1e1e1e"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
    >
      {match.round_label && (
        <span style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, color: "var(--cyan)", textTransform: "uppercase", minWidth: 60 }}>
          {match.round_label}
        </span>
      )}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>{match.team1?.name}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--muted)", margin: "0 4px" }}>
          {isUpcoming ? "vs" : `${match.team1_score} – ${match.team2_score}`}
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>{match.team2?.name}</span>
      </div>
      {isLive && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div className="rt-live-dot" style={{ background: "var(--orange)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: 2, color: "var(--orange)", textTransform: "uppercase" }}>Live · {fmt(match.time_remaining)}</span>
        </div>
      )}
      {winner && (
        <span style={{ fontSize: 11, fontWeight: 700, color: winner === "Draw" ? "var(--cyan)" : "var(--green)", letterSpacing: 1, textTransform: "uppercase" }}>
          {winner === "Draw" ? "Draw" : `${winner} Won`}
        </span>
      )}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
        <path d="M4 2l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

// ── Match Card (for standalone matches tab) ───────────────────
function MatchCard({ match, status, onClick }) {
  const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

  const isLive      = status === "live"
  const isPaused    = status === "paused"
  const isUpcoming  = status === "upcoming"
  const isCompleted = status === "completed"
  const isDraw      = status === "draw"

  const accentColor =
    isLive      ? "var(--orange)" :
    isPaused    ? "var(--yellow)" :
    isUpcoming  ? "rgba(255,255,255,0.2)" :
    isDraw      ? "var(--cyan)" :
    "rgba(255,255,255,0.15)"

  const statusLabel =
    isLive ? "Live" : isPaused ? "Paused" : isUpcoming ? "Upcoming" : isDraw ? "Draw" : "Final"

  const winner = isCompleted
    ? match.team1_score > match.team2_score ? match.team1?.name
    : match.team2_score > match.team1_score ? match.team2?.name
    : "Draw"
    : null

  return (
    <div
      onClick={onClick}
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${accentColor}`, borderRadius: 4, padding: "18px 20px", cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
    >
      <div style={{ minWidth: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          {isLive && <div className="rt-live-dot" style={{ background: "var(--orange)" }} />}
          <span style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, padding: "3px 8px", border: `1px solid ${accentColor}`, borderRadius: 2 }}>{statusLabel}</span>
        </div>
        {(isLive || isPaused) && <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--muted)", letterSpacing: 1 }}>{fmt(match.time_remaining)}</div>}
        {isUpcoming && <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>{(match.half_duration || 1200) / 60}m halves</div>}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>{match.team1?.name}</div></div>
        <div style={{ textAlign: "center" }}>
          {isUpcoming
            ? <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--muted)" }}>vs</div>
            : <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2 }}><span style={{ color: "var(--yellow)" }}>{match.team1_score}</span><span style={{ color: "rgba(255,255,255,0.2)", margin: "0 6px" }}>–</span><span style={{ color: "#fff" }}>{match.team2_score}</span></div>
          }
        </div>
        <div style={{ flex: 1, textAlign: "right" }}><div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>{match.team2?.name}</div></div>
      </div>
      {(winner || isDraw) && (
        <div style={{ minWidth: 100, textAlign: "right" }}>
          {winner && winner !== "Draw" && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", letterSpacing: 1, textTransform: "uppercase" }}>{winner} Won</div>}
          {(winner === "Draw" || isDraw) && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: 1, textTransform: "uppercase" }}>Draw</div>}
        </div>
      )}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
        <path d="M7 4l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default ViewerHome