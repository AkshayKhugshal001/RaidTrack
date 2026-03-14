import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

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

  const t1Ref        = useRef(0)
  const t2Ref        = useRef(0)
  const t1NameRef    = useRef("")
  const t2NameRef    = useRef("")
  const lastEventRef = useRef("")
  const timerRef     = useRef(null)
  const channelRef   = useRef(null)

  useEffect(() => {
    loadMatch()
    const channel = subscribeToMatch()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
      supabase.removeChannel(channel)
    }
  }, [id])

  // ── Local countdown ───────────────────────────────────────────
  const startLocalTimer = (running, time) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!running) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // ── Load match ────────────────────────────────────────────────
  const loadMatch = async () => {
    setError(null)
    setLoading(true)
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

      setTeam1Name(t1);  t1NameRef.current = t1
      setTeam2Name(t2);  t2NameRef.current = t2
      setT1Score(data.team1_score);  t1Ref.current = data.team1_score
      setT2Score(data.team2_score);  t2Ref.current = data.team2_score
      setTimeLeft(data.time_remaining ?? 0)
      setIsRunning(data.is_running ?? false)
      setStatus(data.status ?? "upcoming")
      setQuitReason(data.quit_reason ?? null)

      // Set last event ref so we don't re-show old events on load
      if (data.last_event) lastEventRef.current = data.last_event

      setLoading(false)
      startLocalTimer(data.is_running, data.time_remaining ?? 0)

    } catch (err) {
      console.error("Load match error:", err)
      setError("Could not load match. " + (err.message || ""))
      setLoading(false)
    }
  }

  // ── Realtime subscription ─────────────────────────────────────
  const subscribeToMatch = () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`viewer-${id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "matches",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const u = payload.new
          console.log("Realtime update received:", u)

          // ── Sync timer ──
          setTimeLeft(u.time_remaining ?? 0)
          startLocalTimer(u.is_running, u.time_remaining ?? 0)

          // ── Sync running + status ──
          setIsRunning(u.is_running)
          setStatus(u.status ?? "upcoming")
          if (u.quit_reason) setQuitReason(u.quit_reason)

          // ── Score changes ──
          const prevT1 = t1Ref.current
          const prevT2 = t2Ref.current

          if (u.team1_score !== prevT1) {
            const diff = u.team1_score - prevT1
            if (diff > 0) {
              pushEvent(
                `${t1NameRef.current} scored +${diff}  →  ${u.team1_score} – ${u.team2_score}`,
                "var(--yellow)"
              )
            }
            setT1Score(u.team1_score)
            t1Ref.current = u.team1_score
          }

          if (u.team2_score !== prevT2) {
            const diff = u.team2_score - prevT2
            if (diff > 0) {
              pushEvent(
                `${t2NameRef.current} scored +${diff}  →  ${u.team1_score} – ${u.team2_score}`,
                "#fff"
              )
            }
            setT2Score(u.team2_score)
            t2Ref.current = u.team2_score
          }

          // ── Special events from last_event ──
          if (u.last_event && u.last_event !== lastEventRef.current) {
            lastEventRef.current = u.last_event

            const color =
              u.last_event.includes("Super Raid")   ? "var(--yellow)"  :
              u.last_event.includes("Super Tackle") ? "var(--cyan)"    :
              u.last_event.includes("ALL OUT")      ? "var(--orange)"  :
              u.last_event.includes("Do-or-Die")    ? "var(--orange)"  :
              u.last_event.includes("Half Time")    ? "var(--green)"   :
              u.last_event.includes("Full Time")    ? "var(--green)"   :
              u.last_event.includes("Abandoned")    ? "var(--orange)"  :
              u.last_event.includes("raid")         ? "var(--yellow)"  :
              u.last_event.includes("tackle")       ? "var(--cyan)"    :
              "rgba(255,255,255,0.7)"

            pushEvent(u.last_event, color)
          }

          // ── Match over ──
          if (u.status === "completed") {
            pushEvent("🏁 Full Time! Match over.", "var(--green)")
          }
          if (u.status === "draw" && u.quit_reason) {
            pushEvent(`Match Abandoned — ${u.quit_reason}`, "var(--orange)")
          }
        }
      )
      .subscribe((subStatus, err) => {
        console.log("Realtime status:", subStatus, err)
        if (subStatus === "CHANNEL_ERROR") {
          console.log("Channel error — retrying in 3s")
          setTimeout(() => subscribeToMatch(), 3000)
        }
      })

    channelRef.current = channel
    return channel
  }

  // ── Push event ────────────────────────────────────────────────
  const pushEvent = (text, color = "#fff") => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    })
    setEvents(prev => [
      { id: `${Date.now()}-${Math.random()}`, text, color, time },
      ...prev
    ].slice(0, 30))
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
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 3, color: "var(--orange)", textTransform: "uppercase" }}>
        Connection Error
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textAlign: "center", maxWidth: 400 }}>
        {error}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button className="rt-btn-primary" style={{ fontSize: 16, padding: "10px 28px" }} onClick={loadMatch}>
          Retry
        </button>
        <button className="rt-btn-secondary" style={{ fontSize: 16, padding: "10px 28px" }} onClick={() => navigate("/viewer")}>
          Back
        </button>
      </div>
    </div>
  )

  // ── Loading screen ────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "var(--muted)" }}>
        Loading...
      </div>
    </div>
  )

  // ── Main render ───────────────────────────────────────────────
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
            {isOver
              ? status === "draw" ? "Abandoned" : "Full Time"
              : isRunning ? "Live" : "Paused"
            }
          </span>
        </div>
        <button className="rt-btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => navigate("/viewer")}>
          ← All Matches
        </button>
      </nav>

      {/* Match Over Banner */}
      {isOver && (
        <div style={{ background: status === "draw" ? "var(--orange)" : "var(--yellow)", padding: "14px 24px", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "#000", textTransform: "uppercase" }}>
            {status === "draw"
              ? `Match Abandoned — Draw · ${t1Score} – ${t2Score}`
              : winner
                ? `${winner} Wins! · Final: ${t1Score} – ${t2Score}`
                : `Draw! · Final: ${t1Score} – ${t2Score}`
            }
          </span>
          {quitReason && (
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", marginTop: 4 }}>
              {quitReason}
            </div>
          )}
        </div>
      )}

      {/* Scoreboard */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,92,0,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Timer */}
        <div style={{ textAlign: "center", paddingTop: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 4, color: isRunning ? "var(--orange)" : isOver ? "var(--muted)" : "var(--yellow)", textTransform: "uppercase" }}>
            {isOver
              ? status === "draw" ? "Abandoned" : "Full Time"
              : isRunning ? "● Live" : "⏸ Paused"
            }
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: 4, color: "#fff", lineHeight: 1, marginTop: 4 }}>
            {fmt(timeLeft)}
          </div>
        </div>

        {/* Teams + Scores */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              {team1Name}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px, 12vw, 100px)", lineHeight: 1, letterSpacing: -2, color: "var(--yellow)", transition: "all 0.3s" }}>
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
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px, 12vw, 100px)", lineHeight: 1, letterSpacing: -2, color: "#fff", transition: "all 0.3s" }}>
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
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>
              Waiting for events...
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
              Score updates, raids and tackles appear here in real time
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event, idx) => (
              <div
                key={event.id}
                style={{
                  background: idx === 0 ? "rgba(255,255,255,0.06)" : "var(--card)",
                  border: `1px solid ${idx === 0 ? "rgba(255,255,255,0.15)" : "var(--border)"}`,
                  borderLeft: `3px solid ${event.color}`,
                  borderRadius: 4,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  opacity: Math.max(0.25, 1 - idx * 0.06),
                  transition: "all 0.3s",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: event.color }}>
                  {event.text}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, flexShrink: 0 }}>
                  {event.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Connection indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, justifyContent: "center" }}>
          <div className="rt-live-dot" style={{ background: isOver ? "var(--muted)" : "var(--green)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>
            {isOver ? "Match Ended" : "Connected — Real Time"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ViewerMatch