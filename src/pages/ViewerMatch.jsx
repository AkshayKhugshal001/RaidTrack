import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

function ViewerMatch() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [match,     setMatch]     = useState(null)
  const [team1Name, setTeam1Name] = useState("")
  const [team2Name, setTeam2Name] = useState("")
  const [t1Score,   setT1Score]   = useState(0)
  const [t2Score,   setT2Score]   = useState(0)
  const [timeLeft,  setTimeLeft]  = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)

  // Keep team names in a ref so realtime callback can access them
  const team1Ref = useState("")
  const team2Ref = useState("")

  useEffect(() => {
    loadMatch()
  }, [])

  useEffect(() => {
    if (!match) return
    const channel = supabase
      .channel("match-viewer-" + id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new
          const oldT1 = updated.team1_score
          const oldT2 = updated.team2_score

          setT1Score(prev => {
            if (updated.team1_score > prev) {
              const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              setEvents(ev => [{ id: Date.now(), text: `${team1Name} scored! ${updated.team1_score} – ${updated.team2_score}`, color: "var(--yellow)", time: t }, ...ev].slice(0, 20))
            }
            return updated.team1_score
          })

          setT2Score(prev => {
            if (updated.team2_score > prev) {
              const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              setEvents(ev => [{ id: Date.now() + 1, text: `${team2Name} scored! ${updated.team1_score} – ${updated.team2_score}`, color: "#fff", time: t }, ...ev].slice(0, 20))
            }
            return updated.team2_score
          })

          setTimeLeft(updated.time_remaining)
          setIsRunning(updated.is_running)

          if (!updated.is_running && updated.time_remaining === 1200) {
            const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            setEvents(ev => [{ id: Date.now() + 2, text: "Half Time!", color: "var(--green)", time: t }, ...ev].slice(0, 20))
          }

          if (!updated.is_running && updated.time_remaining === 0) {
            const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            setEvents(ev => [{ id: Date.now() + 3, text: "Full Time! Match Over.", color: "var(--orange)", time: t }, ...ev].slice(0, 20))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [match, team1Name, team2Name])

  // Local countdown timer mirrors the match clock
  useEffect(() => {
    if (!isRunning) return
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(iv); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [isRunning])

  const loadMatch = async () => {
    const { data } = await supabase
      .from("matches")
      .select(`*, team1:team1_id(name), team2:team2_id(name)`)
      .eq("id", id).single()
    if (!data) return

    setMatch(data)
    setTeam1Name(data.team1.name)
    setTeam2Name(data.team2.name)
    setT1Score(data.team1_score)
    setT2Score(data.team2_score)
    setTimeLeft(data.time_remaining)
    setIsRunning(data.is_running)
    setLoading(false)
  }

  const totalScore = t1Score + t2Score
  const t1Pct = totalScore > 0 ? Math.round((t1Score / totalScore) * 100) : 50
  const t2Pct = 100 - t1Pct
  const isOver = !isRunning && timeLeft === 0 && match !== null
  const winner = isOver
    ? t1Score > t2Score ? team1Name
    : t2Score > t1Score ? team2Name
    : null
    : null

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "var(--muted)" }}>Loading...</div>
    </div>
  )

  return (
    <div className="rt-page">

      {/* Nav */}
      <nav className="rt-nav">
        <div className="rt-nav-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/viewer")}>
          <div className="rt-nav-logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#000" strokeWidth="1.5"/>
              <path d="M5 9C5 9 7 5.5 9 9C11 12.5 13 9 13 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="rt-nav-title">Raid<span>Track</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isRunning && <div className="rt-live-dot" style={{ background: "var(--orange)" }} />}
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "3px", color: isRunning ? "var(--orange)" : "var(--muted)", textTransform: "uppercase" }}>
            {isOver ? "Full Time" : isRunning ? "Live" : "Paused"}
          </span>
        </div>
        <button className="rt-btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => navigate("/viewer")}>
          ← All Matches
        </button>
      </nav>

      {/* Match Over Banner */}
      {isOver && (
        <div style={{ background: "var(--yellow)", padding: "14px 24px", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "#000", textTransform: "uppercase" }}>
            {winner ? `${winner} Wins!` : "It's a Draw!"} — Final Score: {t1Score} – {t2Score}
          </span>
        </div>
      )}

      {/* Scoreboard */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,92,0,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Timer */}
        <div style={{ textAlign: "center", paddingTop: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 4, color: isRunning ? "var(--orange)" : "var(--muted)", textTransform: "uppercase" }}>
            {isOver ? "Full Time" : isRunning ? "● Live" : "⏸ Paused"}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 4, color: "#fff", lineHeight: 1, marginTop: 4 }}>
            {fmt(timeLeft)}
          </div>
        </div>

        {/* Teams + Scores */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              {team1Name}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px, 12vw, 100px)", lineHeight: 1, letterSpacing: -2, color: "var(--yellow)" }}>
              {t1Score}
            </div>
          </div>

          <div style={{ textAlign: "center", minWidth: 60 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.15)" }}>–</div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              {team2Name}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px, 12vw, 100px)", lineHeight: 1, letterSpacing: -2, color: "#fff" }}>
              {t2Score}
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ padding: "16px 40px 20px", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}>
            <span>{t1Pct}%</span>
            <span>{t2Pct}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", display: "flex", overflow: "hidden" }}>
            <div style={{ width: `${t1Pct}%`, background: "var(--yellow)", transition: "width 0.5s ease" }} />
            <div style={{ width: `${t2Pct}%`, background: "rgba(255,255,255,0.3)", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Events Feed */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>
        <div className="rt-section-label">Live Events</div>

        {events.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--muted)" }}>
              Waiting for match events...
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginTop: 8 }}>
              Score updates will appear here in real time
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event, idx) => (
              <div
                key={event.id}
                style={{
                  background: idx === 0 ? "rgba(255,255,255,0.05)" : "var(--card)",
                  border: `1px solid ${idx === 0 ? "rgba(255,255,255,0.12)" : "var(--border)"}`,
                  borderLeft: `3px solid ${event.color}`,
                  borderRadius: 4,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  opacity: Math.max(0.3, 1 - idx * 0.08),
                  transition: "all 0.3s",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: event.color, letterSpacing: "0.5px" }}>
                  {event.text}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, flexShrink: 0 }}>
                  {event.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Realtime indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, justifyContent: "center" }}>
          <div className="rt-live-dot" style={{ background: "var(--green)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>
            Connected — updates in real time
          </span>
        </div>
      </div>

    </div>
  )
}

export default ViewerMatch