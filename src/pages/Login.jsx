import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Login() {
  const [mode,     setMode]     = useState("choice") // "choice" | "referee" | "viewer"
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleRefereeLogin = async () => {
    if (!email || !password) { setError("Enter email and password"); return }
    setLoading(true)
    setError("")
    const { error } = await signIn(email, password)
    if (error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      navigate("/")
    }
  }

  const handleViewerEnter = () => {
    navigate("/viewer")
  }

  const handleKey = (e) => {
    if (e.key === "Enter") handleRefereeLogin()
  }

  // ── Choice Screen ─────────────────────────────────────────────
  if (mode === "choice") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
          <div style={{ width: 40, height: 40, background: "var(--yellow)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#000" strokeWidth="1.5"/>
              <path d="M5 9C5 9 7 5.5 9 9C11 12.5 13 9 13 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 4, color: "#fff", textTransform: "uppercase" }}>
            Raid<span style={{ color: "var(--yellow)" }}>Track</span>
          </span>
        </div>

        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 5, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>
          Welcome
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 2, color: "#fff", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          How do you want to enter?
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, marginBottom: 48, textAlign: "center" }}>
          Choose your role to continue
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 600 }}>

          {/* Referee card */}
          <div
            onClick={() => setMode("referee")}
            style={{ flex: 1, minWidth: 240, background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--yellow)", borderRadius: 4, padding: "32px 24px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
          >
            <div style={{ width: 48, height: 48, background: "rgba(255,214,0,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="var(--yellow)" strokeWidth="1.5"/>
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="var(--yellow)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "var(--yellow)", marginBottom: 8, textTransform: "uppercase" }}>
              Referee / Host
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.6 }}>
              Manage matches, teams and players. Full access to all controls.
            </div>
            <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--yellow)" }}>
              Login with email →
            </div>
          </div>

          {/* Viewer card */}
          <div
            onClick={handleViewerEnter}
            style={{ flex: 1, minWidth: 240, background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--cyan)", borderRadius: 4, padding: "32px 24px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
          >
            <div style={{ width: 48, height: 48, background: "rgba(0,229,255,0.1)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" stroke="var(--cyan)" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="var(--cyan)" strokeWidth="1.5"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "var(--cyan)", marginBottom: 8, textTransform: "uppercase" }}>
              Viewer
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", lineHeight: 1.6 }}>
              Watch live matches in real time. No login required.
            </div>
            <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--cyan)" }}>
              Enter as viewer →
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ── Referee Login Form ────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      {/* Logo */}
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

      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => { setMode("choice"); setError("") }}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Back
          </button>
          <div className="rt-section-label">Referee Login</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: 3, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
            Sign In
          </h1>
        </div>

        <div className="rt-card" style={{ borderTop: "3px solid var(--yellow)" }}>
          <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                className="rt-input"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
                className="rt-input"
                style={{ width: "100%" }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.3)", borderRadius: 3, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>
                {error}
              </div>
            )}

            <button
              className="rt-btn-primary"
              onClick={handleRefereeLogin}
              disabled={loading}
              style={{ width: "100%", padding: "13px 0", fontSize: 18, marginTop: 4 }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login