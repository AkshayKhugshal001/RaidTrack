import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabaseClient"

const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

function Dashboard() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const [matches,  setMatches]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchMatches() }, [])

  const fetchMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select(`*, team1:team1_id(name), team2:team2_id(name)`)
      .order("created_at", { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  const ongoingMatches  = matches.filter(m => m.status === "live" || m.status === "paused")
  const upcomingMatches = matches.filter(m => m.status === "upcoming")
  const completedMatches= matches.filter(m => m.status === "completed" || m.status === "draw")

  // Only allow starting a new match if no match is currently live
  const hasLiveMatch = matches.some(m => m.status === "live")

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="rt-nav-links">
            <span className="rt-nav-link active">Dashboard</span>
            <button className="rt-nav-link" onClick={() => navigate("/create-match")}>Matches</button>
            <button className="rt-nav-link" onClick={() => navigate("/teams")}>Teams</button>
          </div>
          <button
            className="rt-btn-secondary"
            style={{ fontSize: 13, padding: "6px 16px", marginLeft: 8 }}
            onClick={async () => { await signOut(); navigate("/login") }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Ticker */}
      <div style={{ background: "var(--yellow)", padding: "5px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", gap: 48, animation: "rt-ticker 22s linear infinite" }}>
          {[
            "Pro Kabaddi Match Manager — Live Scoring & Analytics",
            "Track raids, tackles, super raids & do-or-die raids",
            "Real-time match timer with player performance stats",
            "Pro Kabaddi Match Manager — Live Scoring & Analytics",
            "Track raids, tackles, super raids & do-or-die raids",
            "Real-time match timer with player performance stats",
          ].map((text, i) => (
            <span key={i} style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#000", display: "inline-flex", alignItems: "center", gap: 10 }}>
              {text}
              {i % 3 !== 2 && <span style={{ color: "var(--orange)", fontWeight: 900 }}>●</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px 60px" }}>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>

          {/* Create match */}
          <div
            onClick={() => navigate("/create-match")}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--yellow)", borderRadius: 4, padding: "28px 24px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
          >
            <div style={{ width: 44, height: 44, background: "rgba(255,214,0,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="var(--yellow)" strokeWidth="1.5"/>
                <path d="M11 6v10M6 11h10" stroke="var(--yellow)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "var(--yellow)", marginBottom: 8 }}>Create Match</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.6 }}>
              Set up a new fixture between two teams.
            </div>
            <div style={{ marginTop: 16, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--yellow)" }}>Start Now →</div>
          </div>

          {/* Manage teams */}
          <div
            onClick={() => navigate("/teams")}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--orange)", borderRadius: 4, padding: "28px 24px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
          >
            <div style={{ width: 44, height: 44, background: "rgba(255,92,0,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="8" cy="7" r="3" stroke="var(--orange)" strokeWidth="1.5"/>
                <circle cx="16" cy="7" r="3" stroke="var(--orange)" strokeWidth="1.5"/>
                <path d="M2 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 13c2.2.6 4 2.7 4 6" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>Manage Teams</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.6 }}>
              Add teams, players and assign positions.
            </div>
            <div style={{ marginTop: 16, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--orange)" }}>Go to Teams →</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "var(--muted)" }}>Loading matches...</div>
          </div>
        ) : (
          <>
            {/* ── Ongoing Matches ── */}
            {ongoingMatches.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div className="rt-section-label" style={{ color: "var(--orange)" }}>
                  Ongoing Matches
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ongoingMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      type="ongoing"
                      onResume={() => navigate(`/live-match/${match.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Upcoming Matches ── */}
            {upcomingMatches.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div className="rt-section-label" style={{ color: "var(--yellow)" }}>
                  Upcoming Fixtures ({upcomingMatches.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {upcomingMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      type="upcoming"
                      hasLiveMatch={hasLiveMatch}
                      onStart={() => navigate(`/live-match/${match.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Completed Matches ── */}
            {completedMatches.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div className="rt-section-label" style={{ color: "var(--muted)" }}>
                  Match History ({completedMatches.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completedMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      type="completed"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No matches yet */}
            {matches.length === 0 && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "var(--muted)", marginBottom: 12 }}>No Matches Yet</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Create your first match above to get started.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Match Card ────────────────────────────────────────────────
function MatchCard({ match, type, onResume, onStart, hasLiveMatch }) {
  const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

  const accentColor =
    type === "ongoing"   ? "var(--orange)" :
    type === "upcoming"  ? "var(--yellow)" :
    match.status === "draw" ? "var(--cyan)" : "rgba(255,255,255,0.2)"

  const isDraw = match.status === "draw"
  const winner = match.status === "completed"
    ? match.team1_score > match.team2_score
      ? match.team1?.name
      : match.team2_score > match.team1_score
        ? match.team2?.name
        : "Draw"
    : null

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${accentColor}`, borderRadius: 4, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

      {/* Status */}
      <div style={{ minWidth: 80 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, padding: "3px 8px", border: `1px solid ${accentColor}`, borderRadius: 2, display: "inline-block", marginBottom: 4 }}>
          {type === "ongoing" ? (match.status === "live" ? "Live" : "Paused") : type === "upcoming" ? "Upcoming" : isDraw ? "Draw" : "Final"}
        </div>
        {type === "ongoing" && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--muted)", letterSpacing: 1 }}>
            {fmt(match.time_remaining)}
          </div>
        )}
        {type === "upcoming" && (
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
            {match.half_duration / 60}m halves
          </div>
        )}
      </div>

      {/* Teams + Score */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>
            {match.team1?.name}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          {type === "upcoming" ? (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--muted)" }}>vs</div>
          ) : (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2 }}>
              <span style={{ color: "var(--yellow)" }}>{match.team1_score}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 6px" }}>–</span>
              <span style={{ color: "#fff" }}>{match.team2_score}</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "#fff", textTransform: "uppercase" }}>
            {match.team2?.name}
          </div>
        </div>
      </div>

      {/* Winner / Draw reason */}
      {(winner || isDraw) && (
        <div style={{ minWidth: 120, textAlign: "right" }}>
          {winner && winner !== "Draw" && (
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", letterSpacing: 1, textTransform: "uppercase" }}>
              {winner} Won
            </div>
          )}
          {(winner === "Draw" || isDraw) && (
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: 1, textTransform: "uppercase" }}>
              Draw
            </div>
          )}
          {isDraw && match.quit_reason && (
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              {match.quit_reason}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {type === "ongoing" && onResume && (
        <button
          className="rt-btn-primary"
          style={{ fontSize: 14, padding: "8px 20px", flexShrink: 0 }}
          onClick={onResume}
        >
          Resume →
        </button>
      )}

      {type === "upcoming" && onStart && (
        <button
          className="rt-btn-primary"
          style={{ fontSize: 14, padding: "8px 20px", flexShrink: 0, opacity: hasLiveMatch ? 0.4 : 1 }}
          disabled={hasLiveMatch}
          onClick={onStart}
          title={hasLiveMatch ? "Finish the ongoing match first" : ""}
        >
          {hasLiveMatch ? "Match Live" : "Start →"}
        </button>
      )}
    </div>
  )
}

export default Dashboard