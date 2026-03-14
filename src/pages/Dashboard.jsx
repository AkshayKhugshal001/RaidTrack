import { useNavigate } from "react-router-dom"

function Dashboard() {
  const navigate = useNavigate()

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
        <div className="rt-nav-links">
          <span className="rt-nav-link active">Dashboard</span>
          <button className="rt-nav-link" onClick={() => navigate("/create-match")}>Matches</button>
          <button className="rt-nav-link" onClick={() => navigate("/teams")}>Teams</button>
        </div>
        <button className="rt-nav-cta" onClick={() => navigate("/create-match")}>
          + New Match
        </button>
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
            <span
              key={i}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#000",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {text}
              {i % 3 !== 2 && <span style={{ color: "var(--orange)", fontWeight: 900 }}>●</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "56px 24px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,214,0,0.08) 0%, transparent 65%)",
          pointerEvents: "none"
        }} />

        <div style={{
          display: "inline-block",
          background: "var(--orange)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontSize: 12,
          letterSpacing: "3px",
          padding: "4px 16px",
          borderRadius: 2,
          marginBottom: 20,
        }}>
          Pro Kabaddi League · Season 2025
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(48px, 8vw, 96px)",
          letterSpacing: "4px",
          lineHeight: 1,
          color: "#fff",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>
          Raid<span style={{ color: "var(--yellow)" }}>Track</span>
        </h1>

        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "2px",
          color: "var(--muted)",
          textTransform: "uppercase",
          marginBottom: 40,
        }}>
          Live Scoring · Player Analytics · Match Timer · Full Team Control
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <button className="rt-btn-primary" style={{ fontSize: 18, padding: "12px 40px" }} onClick={() => navigate("/create-match")}>
            Start a Match →
          </button>
          <button className="rt-btn-secondary" style={{ fontSize: 18, padding: "12px 40px" }} onClick={() => navigate("/teams")}>
            Manage Teams
          </button>
        </div>
      </div>

      {/* ── Action Cards ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 48px" }}>
        <div className="rt-section-label">Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>

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
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>Create Match</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.5 }}>
              Select teams, configure timer and start live PKL scoring.
            </div>
          </div>

          <div
            onClick={() => navigate("/teams")}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--orange)", borderRadius: 4, padding: "28px 24px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
          >
            <div style={{ width: 44, height: 44, background: "rgba(255,92,0,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="4" width="18" height="14" rx="2" stroke="var(--orange)" strokeWidth="1.5"/>
                <path d="M6 9h10M6 13h6" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>Manage Teams</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.5 }}>
              Add teams, manage players and track match performance.
            </div>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--cyan)", borderRadius: 4, padding: "28px 24px", opacity: 0.6, cursor: "not-allowed" }}>
            <div style={{ width: 44, height: 44, background: "rgba(0,229,255,0.1)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M9 2l2.2 4.4L17 7.3l-4 3.9.9 5.4L9 14l-4.9 2.6.9-5.4L1 7.3l5.8-1z" stroke="var(--cyan)" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>Analytics</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.5 }}>
              Player performance dashboard — coming soon.
            </div>
          </div>

        </div>
      </div>

      {/* ── Feature Highlights ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 20px" }}>
        <div className="rt-section-label">Built For PKL</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Live Timer",    desc: "Start / pause match clock",   color: "var(--yellow)" },
            { label: "Raid Points",   desc: "Track every raid live",        color: "var(--orange)" },
            { label: "Super Raids",   desc: "3+ points in one raid",        color: "var(--cyan)"   },
            { label: "Super Tackles", desc: "Low-player-count bonus",       color: "var(--green)"  },
          ].map(f => (
            <div key={f.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: f.color }}>{f.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.5px", marginTop: 4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Dashboard