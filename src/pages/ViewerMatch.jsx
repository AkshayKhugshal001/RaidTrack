import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
const POLL_INTERVAL = 3000 // fetch every 3 seconds

function ViewerMatch() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team1Name,  setTeam1Name]  = useState("")
  const [team2Name,  setTeam2Name]  = useState("")
  const [t1Score,    setT1Score]    = useState(0)
  const [t2Score,    setT2Score]    = useState(0)
  const [timeLeft,   setTimeLeft]   = useState(0)
  const [isRunning,  setIsRunning]  = useState(false)
  const [status,     setStatus]     = useState("upcoming")
  const [events,     setEvents]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [quitReason, setQuitReason] = useState(null)
  const [lastPoll,   setLastPoll]   = useState("")

  // Refs for tracking previous values to detect changes
  const t1Ref        = useRef(0)
  const t2Ref        = useRef(0)
  const t1NameRef    = useRef("")
  const t2NameRef    = useRef("")
  const lastEventRef = useRef("")
  const isRunningRef = useRef(false)
  const statusRef    = useRef("upcoming")
  const timerRef     = useRef(null)
  const pollRef      = useRef(null)

  useEffect(() => {
    loadMatch()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pollRef.current)  clearInterval(pollRef.current)
    }
  }, [id])

  // ── Local countdown timer ─────────────────────────────────────
  const startLocalTimer = (fromTime) => {
    if (timerRef.current) clearInterval(timerRef.current)
    let current = fromTime
    timerRef.current = setInterval(() => {
      current -= 1
      if (current <= 0) {
        clearInterval(timerRef.current)
        setTimeLeft(0)
        return
      }
      setTimeLeft(current)
    }, 1000)
  }

  const stopLocalTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  // ── Push event to feed ────────────────────────────────────────
  const pushEvent = (text, color = "#fff") => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    })
    setEvents(prev => {
      // Avoid duplicate events
      if (prev.length > 0 && prev[0].text === text) return prev
      return [{ id: `${Date.now()}-${Math.random()}`, text, color, time }, ...prev].slice(0, 30)
    })
  }

  // ── Initial load ──────────────────────────────────────────────
  const loadMatch = async () => {
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("matches")
        .select(`*, team1:team1_id(name), team2:team2_id(name)`)
        .eq("id", id)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error("Match not found")

      const t1 = data.team1?.name || "Team 1"
      const t2 = data.team2?.name || "Team 2"

      setTeam1Name(t1);        t1NameRef.current    = t1
      setTeam2Name(t2);        t2NameRef.current    = t2
      setT1Score(data.team1_score);  t1Ref.current  = data.team1_score
      setT2Score(data.team2_score);  t2Ref.current  = data.team2_score
      setTimeLeft(data.time_remaining ?? 0)
      setIsRunning(data.is_running ?? false)
      isRunningRef.current = data.is_running ?? false
      setStatus(data.status ?? "upcoming")
      statusRef.current = data.status ?? "upcoming"
      setQuitReason(data.quit_reason ?? null)
      lastEventRef.current = data.last_event ?? ""
      setLoading(false)

      if (data.is_running) {
        startLocalTimer(data.time_remaining ?? 0)
      }

      // Start polling after initial load
      startPolling()

    } catch (err) {
      setError("Could not load match. " + (err.message || ""))
      setLoading(false)
    }
  }

  // ── Polling — fetches DB every 3 seconds ──────────────────────
  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await supabase
          .from("matches")
          .select("team1_score, team2_score, time_remaining, is_running, status, last_event, quit_reason")
          .eq("id", id)
          .single()

        if (!data) return

        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        setLastPoll(now)

        // ── Detect score changes ──
        if (data.team1_score !== t1Ref.current) {
          const diff = data.team1_score - t1Ref.current
          if (diff > 0) {
            pushEvent(
              `${t1NameRef.current} +${diff}  →  ${data.team1_score} – ${data.team2_score}`,
              "var(--yellow)"
            )
          }
          setT1Score(data.team1_score)
          t1Ref.current = data.team1_score
        }

        if (data.team2_score !== t2Ref.current) {
          const diff = data.team2_score - t2Ref.current
          if (diff > 0) {
            pushEvent(
              `${t2NameRef.current} +${diff}  →  ${data.team1_score} – ${data.team2_score}`,
              "#fff"
            )
          }
          setT2Score(data.team2_score)
          t2Ref.current = data.team2_score
        }

        // ── Detect special events ──
        if (data.last_event && data.last_event !== lastEventRef.current) {
          lastEventRef.current = data.last_event
          const color =
            data.last_event.includes("Super Raid")   ? "var(--yellow)"  :
            data.last_event.includes("Super Tackle") ? "var(--cyan)"    :
            data.last_event.includes("ALL OUT")      ? "var(--orange)"  :
            data.last_event.includes("Do-or-Die")    ? "var(--orange)"  :
            data.last_event.includes("Half Time")    ? "var(--green)"   :
            data.last_event.includes("Full Time")    ? "var(--green)"   :
            data.last_event.includes("Abandoned")    ? "var(--orange)"  :
            data.last_event.includes("started")      ? "var(--green)"   :
            data.last_event.includes("paused")       ? "var(--yellow)"  :
            data.last_event.includes("tackle")       ? "var(--cyan)"    :
            data.last_event.includes("raid")         ? "var(--yellow)"  :
            "rgba(255,255,255,0.7)"
          pushEvent(data.last_event, color)
        }

        // ── Detect running state change ──
        const wasRunning = isRunningRef.current
        if (data.is_running !== wasRunning) {
          isRunningRef.current = data.is_running
          setIsRunning(data.is_running)
          if (data.is_running) {
            // Match started/resumed — sync timer from DB and start local countdown
            setTimeLeft(data.time_remaining ?? 0)
            startLocalTimer(data.time_remaining ?? 0)
          } else {
            // Match paused — stop timer and sync exact time from DB
            stopLocalTimer()
            setTimeLeft(data.time_remaining ?? 0)
          }
        }

        // ── Always sync timer from DB when running ──
        // This prevents drift — every poll resyncs to DB value
        if (data.is_running) {
          setTimeLeft(data.time_remaining ?? 0)
          startLocalTimer(data.time_remaining ?? 0)
        }

        // ── Detect status change ──
        if (data.status !== statusRef.current) {
          statusRef.current = data.status
          setStatus(data.status)
          if (data.status === "completed") {
            pushEvent("🏁 Full Time!", "var(--green)")
            stopLocalTimer()
            if (pollRef.current) clearInterval(pollRef.current)
          }
          if (data.status === "draw") {
            pushEvent(`Match Abandoned — ${data.quit_reason || ""}`, "var(--orange)")
            stopLocalTimer()
            if (pollRef.current) clearInterval(pollRef.current)
          }
        }

        if (data.quit_reason) setQuitReason(data.quit_reason)

      } catch (err) {
        console.error("Poll error:", err)
      }
    }, POLL_INTERVAL)
  }

  // ── Derived ───────────────────────────────────────────────────
  const totalScore = t1Score + t2Score
  const t1Pct = totalScore > 0 ? Math.round((t1Score / totalScore) * 100) : 50
  const t2Pct = 100 - t1Pct
  const isOver = status === "completed" || status === "draw"
  const isDraw = status === "draw" || (isOver && t1Score === t2Score)
  const winner = isOver && !isDraw
    ? t1Score > t2Score ? team1Name : team2Name
    : null

  // ── Error screen ──────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "var(--orange)", textTransform: "uppercase" }}>Connection Error</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textAlign: "center", maxWidth: 400 }}>{error}</div>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button className="rt-btn-primary" style={{ fontSize: 16, padding: "10px 28px" }} onClick={loadMatch}>Retry</button>
        <button className="rt-btn-secondary" style={{ fontSize: 16, padding: "10px 28px" }} onClick={() => navigate("/viewer")}>Back</button>
      </div>
    </div>
  )

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
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "3px", color: isRunning ? "var(--orange)" : isOver ? "var(--muted)" : "var(--yellow)", textTransform: "uppercase" }}>
            {isOver ? (status === "draw" ? "Abandoned" : "Full Time") : isRunning ? "Live" : status === "upcoming" ? "Upcoming" : "Paused"}
          </span>
        </div>
        <button className="rt-btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => navigate("/viewer")}>
          ← All Matches
        </button>
      </nav>

      {/* Upcoming banner */}
      {status === "upcoming" && (
        <div style={{ background: "rgba(255,214,0,0.08)", border: "1px solid rgba(255,214,0,0.2)", padding: "14px 24px", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 3, color: "var(--yellow)", textTransform: "uppercase" }}>
            Match hasn't started yet — updates automatically every 3 seconds
          </span>
        </div>
      )}

      {/* Match Over Banner */}
      {isOver && (
        <div style={{ background: status === "draw" ? "var(--orange)" : "var(--yellow)", padding: "14px 24px", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "#000", textTransform: "uppercase" }}>
            {status === "draw"
              ? `Match Abandoned — Draw · ${t1Score} – ${t2Score}`
              : winner ? `${winner} Wins! · Final: ${t1Score} – ${t2Score}`
              : `Draw! · Final: ${t1Score} – ${t2Score}`
            }
          </span>
          {quitReason && (
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", marginTop: 4 }}>{quitReason}</div>
          )}
        </div>
      )}

      {/* Scoreboard */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,92,0,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", paddingTop: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 4, color: isRunning ? "var(--orange)" : isOver ? "var(--muted)" : "var(--yellow)", textTransform: "uppercase" }}>
            {isOver ? (status === "draw" ? "Abandoned" : "Full Time") : isRunning ? "● Live" : status === "upcoming" ? "Not Started" : "⏸ Paused"}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: 4, color: "#fff", lineHeight: 1, marginTop: 4 }}>
            {fmt(timeLeft)}
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>{team1Name}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px, 12vw, 100px)", lineHeight: 1, letterSpacing: -2, color: "var(--yellow)", transition: "all 0.3s" }}>{t1Score}</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.15)" }}>–</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>{team2Name}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px, 12vw, 100px)", lineHeight: 1, letterSpacing: -2, color: "#fff", transition: "all 0.3s" }}>{t2Score}</div>
          </div>
        </div>

        <div style={{ padding: "16px 40px 20px", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}>
            <span>{t1Pct}%</span><span>{t2Pct}%</span>
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
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>
              {status === "upcoming" ? "Waiting for match to start..." : "Waiting for events..."}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
              Updates every 3 seconds automatically
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event, idx) => (
              <div key={event.id} style={{
                background: idx === 0 ? "rgba(255,255,255,0.06)" : "var(--card)",
                border: `1px solid ${idx === 0 ? "rgba(255,255,255,0.15)" : "var(--border)"}`,
                borderLeft: `3px solid ${event.color}`,
                borderRadius: 4,
                padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                opacity: Math.max(0.25, 1 - idx * 0.06),
                transition: "all 0.3s",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: event.color }}>{event.text}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, flexShrink: 0 }}>{event.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Poll indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, justifyContent: "center" }}>
          <div className="rt-live-dot" style={{ background: isOver ? "var(--muted)" : "var(--green)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>
            {isOver ? "Match Ended" : `Auto-updating · Last sync: ${lastPoll || "connecting..."}`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ViewerMatch