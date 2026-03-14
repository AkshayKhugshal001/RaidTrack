import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Dashboard() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <div className="rt-page">

      {/* ── Nav ── */}
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
            onClick={async () => {
              await signOut()
              navigate("/login")
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Ticker ── */}
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

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "56px 24px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,214,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-block", background: "var(--orange)", color: "#fff", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", padding: "4px 16px", borderRadius: 2, marginBottom: 20 }}>
          Pro Kabaddi League · Season 2025
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px, 8vw, 96px)", letterSpacing: "4px", lineHeight: 1, color: "#fff", textTransform: "uppercase", marginBottom: 16 }}>
          Raid<span style={{ color: "var(--yellow)" }}>Track</span>
        </h1>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600, letterSpacing: "2px", color: "var(--muted)", textTransform: "uppercase", marginBottom: 0 }}>
          Live Scoring · Player Analytics · Match Timer · Full Team Control
        </p>
      </div>

      {/* ── Two Action Cards ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Create Match */}
        <div
          onClick={() => navigate("/create-match")}
          style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--yellow)", borderRadius: 4, padding: "32px 24px", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
        >
          <div style={{ width: 44, height: 44, background: "rgba(255,214,0,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="var(--yellow)" strokeWidth="1.5"/>
              <path d="M11 6v10M6 11h10" stroke="var(--yellow)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, color: "var(--yellow)", marginBottom: 8 }}>
            Create Match
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.6 }}>
            Select two teams, do the coin toss and start live PKL scoring with full referee tools.
          </div>
          <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--yellow)" }}>
            Start Now →
          </div>
        </div>

        {/* Manage Teams */}
        <div
          onClick={() => navigate("/teams")}
          style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--orange)", borderRadius: 4, padding: "32px 24px", cursor: "pointer", transition: "background 0.15s" }}
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
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>
            Manage Teams
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.6 }}>
            Create teams, add players and assign positions before the match starts.
          </div>
          <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--orange)" }}>
            Go to Teams →
          </div>
        </div>

      </div>

      {/* ── Feature Strip ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Live Timer",    color: "var(--yellow)" },
          { label: "Super Raids",   color: "var(--orange)" },
          { label: "Super Tackles", color: "var(--cyan)"   },
          { label: "Do or Die",     color: "var(--green)"  },
        ].map(f => (
          <div key={f.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: 1, color: f.color }}>{f.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Dashboard