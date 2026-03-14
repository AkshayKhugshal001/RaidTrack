import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

function ViewerHome() {
  const [matches,  setMatches]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchLiveMatches()
  }, [])

  const fetchLiveMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select(`
        *,
        team1:team1_id(name),
        team2:team2_id(name)
      `)
      .order("created_at", { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  const liveMatches     = matches.filter(m => m.is_running)
  const recentMatches   = matches.filter(m => !m.is_running && m.time_remaining === 0)
  const pausedMatches   = matches.filter(m => !m.is_running && m.time_remaining > 0)

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

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px" }}>

        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 5, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 12 }}>
            Live Now
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: 3, color: "#fff", textTransform: "uppercase", lineHeight: 1 }}>
            Watch Matches
          </h1>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, marginTop: 12 }}>
            Select a match below to watch live updates in real time
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "var(--muted)" }}>Loading matches...</div>
          </div>
        ) : (
          <>
            {/* Live matches */}
            {liveMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--orange)" }}>
                  Live Now ({liveMatches.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {liveMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      status="live"
                      onClick={() => navigate(`/viewer/${match.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Paused matches */}
            {pausedMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--yellow)" }}>
                  In Progress — Paused ({pausedMatches.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pausedMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      status="paused"
                      onClick={() => navigate(`/viewer/${match.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed matches */}
            {recentMatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="rt-section-label" style={{ color: "var(--muted)" }}>
                  Completed ({recentMatches.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {recentMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      status="completed"
                      onClick={() => navigate(`/viewer/${match.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No matches at all */}
            {matches.length === 0 && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "64px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "var(--muted)", marginBottom: 12 }}>
                  No Matches Yet
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                  Check back when a referee starts a match.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Match Card ────────────────────────────────────────────────
function MatchCard({ match, status, onClick }) {
  const isLive      = status === "live"
  const isPaused    = status === "paused"
  const isCompleted = status === "completed"

  const accentColor = isLive ? "var(--orange)" : isPaused ? "var(--yellow)" : "rgba(255,255,255,0.2)"

  const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

  return (
    <div
      onClick={onClick}
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${accentColor}`, borderRadius: 4, padding: "20px 24px", cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 16 }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
    >
      {/* Status badge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
        {isLive && <div className="rt-live-dot" style={{ background: "var(--orange)" }} />}
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: accentColor,
          padding: "3px 8px",
          border: `1px solid ${accentColor}`,
          borderRadius: 2,
        }}>
          {isLive ? "Live" : isPaused ? "Paused" : "Final"}
        </span>
        {!isCompleted && (
          <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--muted)", letterSpacing: 1 }}>
            {fmt(match.time_remaining)}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>
            {match.team1?.name}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "#fff" }}>
            <span style={{ color: "var(--yellow)" }}>{match.team1_score}</span>
            <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 8px" }}>–</span>
            <span>{match.team2_score}</span>
          </div>
        </div>

        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>
            {match.team2?.name}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
        <path d="M7 4l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default ViewerHome