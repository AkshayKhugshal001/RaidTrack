import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

const HALF_DURATION    = 1200
const RAID_LIMIT       = 30
const ALL_OUT_BONUS    = 2
const SUPER_TACKLE_PTS = 2

const ALERT = {
  SUPER_RAID:   { color: "#FFD600", label: "SUPER RAID!"     },
  SUPER_TACKLE: { color: "#00E5FF", label: "SUPER TACKLE!"   },
  ALL_OUT:      { color: "#FF5C00", label: "ALL OUT!"        },
  DO_OR_DIE:    { color: "#FF5C00", label: "DO OR DIE RAID!" },
  HALFTIME:     { color: "#76FF03", label: "HALF TIME!"      },
  RAID_TIMEOUT: { color: "#FF5C00", label: "RAID TIME OUT!"  },
}

const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`

function beep(type = "alert") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    if (type === "alert") {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(); osc.stop(ctx.currentTime + 0.4)
    } else if (type === "special") {
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    } else if (type === "halftime") {
      [0, 0.2, 0.4].forEach(offset => {
        const o2 = ctx.createOscillator()
        const g2 = ctx.createGain()
        o2.connect(g2); g2.connect(ctx.destination)
        o2.frequency.value = 660
        g2.gain.setValueAtTime(0.3, ctx.currentTime + offset)
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15)
        o2.start(ctx.currentTime + offset)
        o2.stop(ctx.currentTime + offset + 0.15)
      })
    }
  } catch (_) {}
}

function CoinTossScreen({ team1Name, team2Name, onDecide }) {
  const [flipping, setFlipping] = useState(false)
  const [flipped,  setFlipped]  = useState(false)

  const handlePick = (team) => {
    setFlipping(true)
    setTimeout(() => {
      setFlipping(false)
      setFlipped(true)
      setTimeout(() => onDecide(team), 900)
    }, 1200)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: 24 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
        <div style={{ width: 34, height: 34, background: "var(--yellow)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="#000" strokeWidth="1.5"/>
            <path d="M5 9C5 9 7 5.5 9 9C11 12.5 13 9 13 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 3, color: "#fff" }}>
          Raid<span style={{ color: "var(--yellow)" }}>Track</span>
        </span>
      </div>

      <div style={{ width: 100, height: 100, borderRadius: "50%", background: flipped ? "var(--yellow)" : flipping ? "var(--orange)" : "rgba(255,214,0,0.15)", border: "3px solid var(--yellow)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, transition: "all 0.4s ease" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 36, color: flipped ? "#000" : "var(--yellow)", transition: "color 0.3s" }}>
          {flipped ? "✓" : "?"}
        </span>
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 5, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>
        Coin Toss
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: 2, color: "#fff", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
        Who raids first?
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, marginBottom: 48, textAlign: "center" }}>
        The winning team chooses to raid first. Select below.
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          disabled={flipping || flipped}
          onClick={() => handlePick(1)}
          style={{ background: "var(--yellow)", color: "#000", fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", padding: "18px 48px", borderRadius: 4, border: "none", cursor: flipping || flipped ? "not-allowed" : "pointer", opacity: flipping || flipped ? 0.5 : 1, transition: "opacity 0.2s", minWidth: 220 }}
        >
          {team1Name}
        </button>

        <button
          disabled={flipping || flipped}
          onClick={() => handlePick(2)}
          style={{ background: "transparent", color: "#fff", fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", padding: "18px 48px", borderRadius: 4, border: "2px solid rgba(255,255,255,0.25)", cursor: flipping || flipped ? "not-allowed" : "pointer", opacity: flipping || flipped ? 0.5 : 1, transition: "all 0.2s", minWidth: 220 }}
        >
          {team2Name}
        </button>
      </div>

      {flipping && (
        <div style={{ marginTop: 32, fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 4, color: "var(--orange)", textTransform: "uppercase" }}>
          Tossing coin...
        </div>
      )}
    </div>
  )
}

function LiveMatch() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [screen,       setScreen]       = useState("toss")
  const [match,        setMatch]        = useState(null)
  const [team1Name,    setTeam1Name]    = useState("")
  const [team2Name,    setTeam2Name]    = useState("")
  const [t1Score,      setT1Score]      = useState(0)
  const [t2Score,      setT2Score]      = useState(0)
  const [matchTime,    setMatchTime]    = useState(HALF_DURATION)
  const [isRunning,    setIsRunning]    = useState(false)
  const [half,         setHalf]         = useState(1)
  const [team1Players, setTeam1Players] = useState([])
  const [team2Players, setTeam2Players] = useState([])
  const [t1Mat,        setT1Mat]        = useState([])
  const [t2Mat,        setT2Mat]        = useState([])
  const [t1OutQueue,   setT1OutQueue]   = useState([])
  const [t2OutQueue,   setT2OutQueue]   = useState([])
  const [raidingTeam,   setRaidingTeam]   = useState(1)
  const [firstRaider,   setFirstRaider]   = useState(1)
  const [raidingPlayer, setRaidingPlayer] = useState(null)
  const [raidPhase,     setRaidPhase]     = useState("select_raider")
  const [raidTime,      setRaidTime]      = useState(RAID_LIMIT)
  const [raidRunning,   setRaidRunning]   = useState(false)
  const [taggedPlayers, setTaggedPlayers] = useState([])
  const [emptyStreak,   setEmptyStreak]   = useState({ 1: 0, 2: 0 })
  const [alert,         setAlert]         = useState(null)
  const alertTimer = useRef(null)

  useEffect(() => { loadMatch() }, [])

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
    setMatchTime(data.time_remaining ?? HALF_DURATION)

    const { data: p1 } = await supabase.from("players").select("*").eq("team_id", data.team1_id)
    const { data: p2 } = await supabase.from("players").select("*").eq("team_id", data.team2_id)
    const pl1 = p1 || []
    const pl2 = p2 || []
    setTeam1Players(pl1)
    setTeam2Players(pl2)
    setT1Mat(pl1.slice(0, 7).map(p => p.id))
    setT2Mat(pl2.slice(0, 7).map(p => p.id))
  }

  const handleTossDecision = (team) => {
    setRaidingTeam(team)
    setFirstRaider(team)
    setScreen("match")
  }

  useEffect(() => {
    if (!isRunning) return
    const iv = setInterval(() => {
      setMatchTime(prev => {
        const next = prev - 1
        if (next === 0 && half === 1) {
          clearInterval(iv)
          setIsRunning(false)
          setRaidRunning(false)
          setHalf(2)
          setMatchTime(HALF_DURATION)
          setRaidingTeam(firstRaider === 1 ? 2 : 1)
          setEmptyStreak({ 1: 0, 2: 0 })
          showAlert({ ...ALERT.HALFTIME, sub: "Half Time — 5 min break. Raids swap." }, 4000)
          beep("halftime")
          supabase.from("matches").update({ is_running: false, time_remaining: HALF_DURATION }).eq("id", id)
          return 0
        }
        if (next === 0 && half === 2) {
          clearInterval(iv)
          setIsRunning(false)
          setRaidRunning(false)
          setScreen("over")
          supabase.from("matches").update({ is_running: false, time_remaining: 0 }).eq("id", id)
          return 0
        }
        supabase.from("matches").update({ time_remaining: next }).eq("id", id)
        return next
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [isRunning, half])

  useEffect(() => {
    if (!raidRunning) return
    const iv = setInterval(() => {
      setRaidTime(prev => {
        if (prev <= 1) {
          clearInterval(iv)
          setRaidRunning(false)
          showAlert({ ...ALERT.RAID_TIMEOUT, sub: "30 seconds up — counting as empty raid" }, 2500)
          beep("alert")
          processEmptyRaid()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [raidRunning])

  const showAlert = (data, duration = 2500) => {
    if (alertTimer.current) clearTimeout(alertTimer.current)
    setAlert(data)
    alertTimer.current = setTimeout(() => setAlert(null), duration)
  }

  const isDoOrDie = emptyStreak[raidingTeam] >= 2

  const flipRaidingTeam = () => setRaidingTeam(prev => prev === 1 ? 2 : 1)

  const processEmptyRaid = useCallback(() => {
    setRaidPhase("select_raider")
    setRaidRunning(false)
    setRaidingPlayer(null)
    setTaggedPlayers([])
    setEmptyStreak(prev => ({ ...prev, [raidingTeam]: prev[raidingTeam] + 1 }))
    flipRaidingTeam()
  }, [raidingTeam])

  const startRaid = () => {
    if (!raidingPlayer) {
      showAlert({ color: "var(--orange)", label: "SELECT RAIDER", sub: "Tap a raider from your team first" }, 2000)
      return
    }
    setRaidPhase("raiding")
    setRaidTime(RAID_LIMIT)
    setRaidRunning(true)
    setTaggedPlayers([])
    if (isDoOrDie) {
      showAlert({ ...ALERT.DO_OR_DIE, sub: `${raidingTeam === 1 ? team1Name : team2Name} — must score or raider is out!` }, 2500)
      beep("alert")
    }
  }

  const toggleTag = (pid) => {
    setTaggedPlayers(prev =>
      prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]
    )
  }

  const confirmRaid = async (raidSuccess) => {
    setRaidRunning(false)
    setRaidPhase("select_raider")

    const defendingTeam = raidingTeam === 1 ? 2 : 1
    let newT1Mat      = [...t1Mat]
    let newT2Mat      = [...t2Mat]
    let newT1OutQueue = [...t1OutQueue]
    let newT2OutQueue = [...t2OutQueue]

    const getRaidMat  = () => raidingTeam === 1 ? newT1Mat : newT2Mat
    const getDefMat   = () => raidingTeam === 1 ? newT2Mat : newT1Mat
    const getRaidOutQ = () => raidingTeam === 1 ? newT1OutQueue : newT2OutQueue
    const getDefOutQ  = () => raidingTeam === 1 ? newT2OutQueue : newT1OutQueue
    const setRaidMat  = (v) => { if (raidingTeam === 1) newT1Mat = v; else newT2Mat = v }
    const setDefMat   = (v) => { if (raidingTeam === 1) newT2Mat = v; else newT1Mat = v }
    const setRaidOutQ = (v) => { if (raidingTeam === 1) newT1OutQueue = v; else newT2OutQueue = v }
    const setDefOutQ  = (v) => { if (raidingTeam === 1) newT2OutQueue = v; else newT1OutQueue = v }

    let raidPts   = 0
    let tacklePts = 0
    let newEmptyStreak = { ...emptyStreak }

    if (raidSuccess) {
      raidPts = taggedPlayers.length

      if (isDoOrDie && raidPts === 0) {
        setRaidMat(getRaidMat().filter(x => x !== raidingPlayer?.id))
        setRaidOutQ([...getRaidOutQ(), raidingPlayer?.id])
        newEmptyStreak[raidingTeam] = 0
        showAlert({ color: "var(--orange)", label: "DO-OR-DIE FAILED!", sub: `${raidingTeam === 1 ? team1Name : team2Name} raider is out — no tags scored` }, 3000)
        beep("alert")
      } else {
        taggedPlayers.forEach(pid => {
          setDefMat(getDefMat().filter(x => x !== pid))
          setDefOutQ([...getDefOutQ(), pid])
        })
        if (raidPts >= 3) {
          showAlert({ ...ALERT.SUPER_RAID, sub: `${raidingPlayer?.name} tagged ${raidPts} players — Super Raid!` }, 3000)
          beep("special")
        }
        newEmptyStreak[raidingTeam] = 0
        if (getDefMat().length === 0) {
          raidPts += ALL_OUT_BONUS
          const allDefPlayers = defendingTeam === 1 ? team1Players : team2Players
          setDefMat(allDefPlayers.slice(0, 7).map(p => p.id))
          setDefOutQ([])
          showAlert({ ...ALERT.ALL_OUT, sub: `${defendingTeam === 1 ? team1Name : team2Name} All Out! +${ALL_OUT_BONUS} bonus. Full team revived.` }, 3500)
          beep("special")
        }
      }
    } else {
      const numDefenders = getDefMat().length
      if (numDefenders <= 3) {
        tacklePts = SUPER_TACKLE_PTS
        showAlert({ ...ALERT.SUPER_TACKLE, sub: `${defendingTeam === 1 ? team1Name : team2Name} with ${numDefenders} defenders — Super Tackle! +${SUPER_TACKLE_PTS} pts` }, 3000)
        beep("special")
      } else {
        tacklePts = 1
      }
      setRaidMat(getRaidMat().filter(x => x !== raidingPlayer?.id))
      setRaidOutQ([...getRaidOutQ(), raidingPlayer?.id])
      const defOutQ = getDefOutQ()
      if (defOutQ.length > 0) {
        setDefMat([...getDefMat(), defOutQ[0]])
        setDefOutQ(defOutQ.slice(1))
      }
      newEmptyStreak[raidingTeam] = 0
      if (getRaidMat().length === 0) {
        tacklePts += ALL_OUT_BONUS
        const allRaidPlayers = raidingTeam === 1 ? team1Players : team2Players
        setRaidMat(allRaidPlayers.slice(0, 7).map(p => p.id))
        setRaidOutQ([])
        showAlert({ ...ALERT.ALL_OUT, sub: `${raidingTeam === 1 ? team1Name : team2Name} All Out! +${ALL_OUT_BONUS} bonus. Full team revived.` }, 3500)
        beep("special")
      }
    }

    setT1Mat(newT1Mat)
    setT2Mat(newT2Mat)
    setT1OutQueue(newT1OutQueue)
    setT2OutQueue(newT2OutQueue)
    setEmptyStreak(newEmptyStreak)

    const newT1Score = raidingTeam === 1 ? t1Score + raidPts : t1Score + tacklePts
    const newT2Score = raidingTeam === 2 ? t2Score + raidPts : t2Score + tacklePts
    setT1Score(newT1Score)
    setT2Score(newT2Score)

    await supabase.from("matches").update({ team1_score: newT1Score, team2_score: newT2Score }).eq("id", id)

    if (raidingPlayer) {
      const pts = raidSuccess ? raidPts : 0
      const { data: existing } = await supabase.from("player_match_stats").select("*").eq("match_id", id).eq("player_id", raidingPlayer.id).maybeSingle()
      if (!existing) {
        await supabase.from("player_match_stats").insert([{
          match_id: id, player_id: raidingPlayer.id,
          total_points: pts, raid_attempts: 1,
          successful_raids: raidSuccess && raidPts > 0 ? 1 : 0,
          raid_points: pts, tackle_attempts: 0, successful_tackles: 0, tackle_points: 0,
        }])
      } else {
        await supabase.from("player_match_stats").update({
          total_points: existing.total_points + pts,
          raid_attempts: existing.raid_attempts + 1,
          successful_raids: existing.successful_raids + (raidSuccess && raidPts > 0 ? 1 : 0),
          raid_points: existing.raid_points + pts,
        }).eq("id", existing.id)
      }
    }

    setRaidingPlayer(null)
    setTaggedPlayers([])
    flipRaidingTeam()
  }

  const totalScore = t1Score + t2Score
  const t1Pct = totalScore > 0 ? Math.round((t1Score / totalScore) * 100) : 50
  const t2Pct = 100 - t1Pct
  const raidingTeamName   = raidingTeam === 1 ? team1Name : team2Name
  const defendingTeamName = raidingTeam === 1 ? team2Name : team1Name
  const raidingPlayers    = raidingTeam === 1 ? team1Players : team2Players
  const defendingPlayers  = raidingTeam === 1 ? team2Players : team1Players
  const raidingMat        = raidingTeam === 1 ? t1Mat : t2Mat
  const defendingMat      = raidingTeam === 1 ? t2Mat : t1Mat
  const raidingOutQ       = raidingTeam === 1 ? t1OutQueue : t2OutQueue
  const defendingOutQ     = raidingTeam === 1 ? t2OutQueue : t1OutQueue
  const raidTimePct       = (raidTime / RAID_LIMIT) * 100
  const raidTimeColor     = raidTime > 15 ? "var(--green)" : raidTime > 8 ? "var(--yellow)" : "var(--orange)"

  if (!match) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "var(--muted)" }}>Loading Match...</div>
    </div>
  )

  if (screen === "toss") return <CoinTossScreen team1Name={team1Name} team2Name={team2Name} onDecide={handleTossDecision} />

  if (screen === "over") {
    const winner = t1Score > t2Score ? team1Name : t2Score > t1Score ? team2Name : null
    return (
      <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 6, color: "var(--muted)", textTransform: "uppercase" }}>Full Time</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 8vw, 72px)", letterSpacing: 4, color: "var(--yellow)", textTransform: "uppercase", textAlign: "center", lineHeight: 1 }}>
          {winner ? `${winner} Wins!` : "It's a Draw!"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: 4, color: "#fff" }}>{t1Score} – {t2Score}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>{team1Name} vs {team2Name}</div>
        <button className="rt-btn-primary" style={{ marginTop: 16, fontSize: 18, padding: "12px 40px" }} onClick={() => navigate("/")}>Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="rt-page" style={{ position: "relative" }}>

      {alert && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.78)", pointerEvents: "none" }}>
          <div style={{ background: "var(--card)", border: `3px solid ${alert.color}`, borderRadius: 6, padding: "32px 56px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: 4, color: alert.color, lineHeight: 1 }}>{alert.label}</div>
            {alert.sub && <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, marginTop: 10 }}>{alert.sub}</div>}
          </div>
        </div>
      )}

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="rt-live-dot" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "3px", color: "var(--orange)", textTransform: "uppercase" }}>Live · Half {half}</span>
          {isDoOrDie && (
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 2, color: "#FF5C00", background: "rgba(255,92,0,0.15)", border: "1px solid rgba(255,92,0,0.4)", padding: "2px 10px", borderRadius: 2 }}>
              DO OR DIE — {raidingTeamName}
            </span>
          )}
        </div>
        <button className="rt-btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => navigate("/")}>← Exit</button>
      </nav>

      <div style={{ background: isRunning ? "rgba(255,92,0,0.12)" : "var(--card)", borderBottom: `2px solid ${isRunning ? "var(--orange)" : "var(--border)"}`, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>{fmt(matchTime)}</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginTop: 2 }}>Half {half} of 2</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="rt-btn-primary" style={{ fontSize: 14, padding: "7px 20px", opacity: isRunning ? 0.4 : 1 }} disabled={isRunning}
            onClick={async () => { setIsRunning(true); await supabase.from("matches").update({ is_running: true }).eq("id", id) }}>
            ▶ Start
          </button>
          <button className="rt-btn-secondary" style={{ fontSize: 14, padding: "7px 20px", opacity: !isRunning ? 0.4 : 1 }} disabled={!isRunning}
            onClick={async () => { setIsRunning(false); setRaidRunning(false); await supabase.from("matches").update({ is_running: false }).eq("id", id) }}>
            ⏸ Pause
          </button>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: isRunning ? "var(--green)" : "var(--orange)", textTransform: "uppercase" }}>
            {isRunning ? "● In Progress" : "⏸ Paused"}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, marginTop: 2, textTransform: "uppercase" }}>
            {team1Name} empty: {emptyStreak[1]}/2 · {team2Name} empty: {emptyStreak[2]}/2
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,92,0,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 24px 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", color: raidingTeam === 1 ? "var(--yellow)" : "var(--muted)", textTransform: "uppercase", marginBottom: 2 }}>
              {team1Name} {raidingTeam === 1 ? "▶ RAIDING" : "🛡 DEFENDING"}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 68, lineHeight: 1, letterSpacing: -2, color: "var(--yellow)" }}>{t1Score}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{t1Mat.length} on mat · {t1OutQueue.length} out</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,0.12)" }}>VS</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", color: raidingTeam === 2 ? "var(--yellow)" : "var(--muted)", textTransform: "uppercase", marginBottom: 2 }}>
              {team2Name} {raidingTeam === 2 ? "▶ RAIDING" : "🛡 DEFENDING"}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 68, lineHeight: 1, letterSpacing: -2, color: "#fff" }}>{t2Score}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{t2Mat.length} on mat · {t2OutQueue.length} out</div>
          </div>
        </div>
        <div style={{ padding: "12px 40px 16px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", display: "flex", overflow: "hidden" }}>
            <div style={{ width: `${t1Pct}%`, background: "var(--yellow)", transition: "width 0.5s ease" }} />
            <div style={{ width: `${t2Pct}%`, background: "rgba(255,255,255,0.3)", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 4, color: "var(--yellow)", marginBottom: 10, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <div className="rt-live-dot" style={{ background: "var(--yellow)" }} />
            {raidingTeamName} — Raiding
            {isDoOrDie && <span style={{ fontSize: 11, background: "rgba(255,92,0,0.2)", color: "var(--orange)", padding: "2px 8px", borderRadius: 2, letterSpacing: 1 }}>DO OR DIE</span>}
          </div>

          <div className="rt-card" style={{ borderTop: "3px solid var(--yellow)", marginBottom: 12 }}>
            <div className="rt-card-header">
              <span className="rt-card-title" style={{ fontSize: 15 }}>
                {raidPhase === "select_raider" ? "Select Raider" : `Raiding: ${raidingPlayer?.name}`}
              </span>
              {raidingPlayer && raidPhase === "select_raider" && (
                <button className="rt-btn-primary" style={{ fontSize: 13, padding: "5px 16px" }} onClick={startRaid}>Start Raid →</button>
              )}
            </div>
            <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 6 }}>
              {raidingPlayers.filter(p => raidingMat.includes(p.id)).map(player => (
                <div key={player.id} onClick={() => raidPhase === "select_raider" && setRaidingPlayer(player)}
                  style={{ padding: "10px 12px", borderRadius: 3, cursor: raidPhase === "select_raider" ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "space-between", border: raidingPlayer?.id === player.id ? "1px solid var(--yellow)" : "1px solid var(--border)", background: raidingPlayer?.id === player.id ? "rgba(255,214,0,0.1)" : "var(--card2)", transition: "all 0.12s" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: raidingPlayer?.id === player.id ? "var(--yellow)" : "#fff", letterSpacing: "0.5px" }}>{player.name}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginTop: 1 }}>{player.position}</div>
                  </div>
                  {raidingPlayer?.id === player.id && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--yellow)" }} />}
                </div>
              ))}
            </div>
          </div>

          {raidingOutQ.length > 0 && (
            <div className="rt-card" style={{ borderTop: "3px solid rgba(255,92,0,0.5)" }}>
              <div className="rt-card-header">
                <span className="rt-card-title" style={{ fontSize: 14, color: "var(--orange)" }}>Out Queue</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>First out → first back</span>
              </div>
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 5 }}>
                {raidingOutQ.map((pid, idx) => {
                  const pl = raidingPlayers.find(p => p.id === pid)
                  return pl ? (
                    <div key={pid} style={{ padding: "8px 12px", borderRadius: 3, background: "rgba(255,92,0,0.08)", border: "1px solid rgba(255,92,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--orange)" }}>#{idx + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{pl.name}</span>
                      {idx === 0 && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--orange)", fontWeight: 700, letterSpacing: 1 }}>NEXT UP</span>}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 4, color: "var(--cyan)", marginBottom: 10, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            🛡 {defendingTeamName} — Defending
          </div>

          {raidPhase === "raiding" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 3, color: raidTimeColor, textTransform: "uppercase" }}>Raid Clock</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, color: raidTimeColor }}>{raidTime}s</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${raidTimePct}%`, background: raidTimeColor, transition: "width 1s linear" }} />
              </div>
            </div>
          )}

          <div className="rt-card" style={{ borderTop: "3px solid var(--cyan)", marginBottom: 12 }}>
            <div className="rt-card-header">
              <span className="rt-card-title" style={{ fontSize: 15, color: "var(--cyan)" }}>
                {raidPhase === "raiding" ? "Tap to Tag" : "On Mat"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>
                {defendingMat.length} active {defendingMat.length <= 3 && <span style={{ color: "var(--cyan)" }}>· SUPER TACKLE ZONE</span>}
              </span>
            </div>
            <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 6 }}>
              {defendingPlayers.filter(p => defendingMat.includes(p.id)).map(player => {
                const tagged = taggedPlayers.includes(player.id)
                return (
                  <div key={player.id} onClick={() => raidPhase === "raiding" && toggleTag(player.id)}
                    style={{ padding: "10px 12px", borderRadius: 3, cursor: raidPhase === "raiding" ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "space-between", border: tagged ? "1px solid var(--orange)" : "1px solid var(--border)", background: tagged ? "rgba(255,92,0,0.15)" : "var(--card2)", transition: "all 0.12s", opacity: raidPhase === "raiding" ? 1 : 0.7 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tagged ? "var(--orange)" : "#fff", letterSpacing: "0.5px", textDecoration: tagged ? "line-through" : "none" }}>{player.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginTop: 1 }}>{player.position}</div>
                    </div>
                    {tagged && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", letterSpacing: 1 }}>TAGGED</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {defendingOutQ.length > 0 && (
            <div className="rt-card" style={{ borderTop: "3px solid rgba(255,255,255,0.12)", marginBottom: 12 }}>
              <div className="rt-card-header">
                <span className="rt-card-title" style={{ fontSize: 14, color: "var(--muted)" }}>Out Queue</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>First out → first back</span>
              </div>
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 5 }}>
                {defendingOutQ.map((pid, idx) => {
                  const pl = defendingPlayers.find(p => p.id === pid)
                  return pl ? (
                    <div key={pid} style={{ padding: "8px 12px", borderRadius: 3, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--muted)" }}>#{idx + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{pl.name}</span>
                      {idx === 0 && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--cyan)", fontWeight: 700, letterSpacing: 1 }}>NEXT UP</span>}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {raidPhase === "raiding" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="rt-btn-primary" style={{ width: "100%", padding: "14px 0", fontSize: 17 }} onClick={() => confirmRaid(true)}>
                ✓ Raid Success {taggedPlayers.length > 0 ? `(${taggedPlayers.length} tagged)` : "(0 tags)"}
              </button>
              <button className="rt-btn-danger" style={{ width: "100%", padding: "14px 0", fontSize: 17 }} onClick={() => confirmRaid(false)}>
                ✗ Raider Caught — Tackle
              </button>
              <button onClick={processEmptyRaid}
                style={{ width: "100%", padding: "11px 0", fontSize: 14, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3, color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font-display)", letterSpacing: 2, textTransform: "uppercase" }}>
                Empty Raid (no contact)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveMatch