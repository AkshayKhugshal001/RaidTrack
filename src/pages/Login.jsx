import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// ── Shared Logo ───────────────────────────────────────────────
function Logo({ size = "sm" }) {
  const big = size === "lg"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: big ? 56 : 48 }}>
      <div style={{ width: big ? 40 : 34, height: big ? 40 : 34, background: "var(--yellow)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={big ? 22 : 18} height={big ? 22 : 18} viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7.5" stroke="#000" strokeWidth="1.5"/>
          <path d="M5 9C5 9 7 5.5 9 9C11 12.5 13 9 13 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: big ? 36 : 28, letterSpacing: big ? 4 : 3, color: "#fff", textTransform: "uppercase" }}>
        Raid<span style={{ color: "var(--yellow)" }}>Track</span>
      </span>
    </div>
  )
}

function Login() {
  const [mode,      setMode]      = useState("choice") // "choice" | "referee"
  const [authMode,  setAuthMode]  = useState("login")  // "login" | "signup"
  const [email,     setEmail]     = useState("")
  const [password,  setPassword]  = useState("")
  const [confirm,   setConfirm]   = useState("")
  const [error,     setError]     = useState("")
  const [success,   setSuccess]   = useState("")
  const [loading,   setLoading]   = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const resetForm = () => {
    setEmail(""); setPassword(""); setConfirm(""); setError(""); setSuccess("")
  }

  const switchAuthMode = (next) => {
    setAuthMode(next)
    resetForm()
  }

  const handleLogin = async () => {
    if (!email || !password) { setError("Enter email and password"); return }
    setLoading(true); setError("")
    const { error } = await signIn(email, password)
    if (error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      navigate("/")
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirm) { setError("Fill in all fields"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    setLoading(true); setError(""); setSuccess("")
    const { data, error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message || "Sign up failed. Try again.")
    } else {
      // Supabase may auto-confirm or require email confirmation depending on project settings
      if (data?.session) {
        navigate("/")
      } else {
        setSuccess("Account created! Check your email to confirm, then sign in.")
        switchAuthMode("login")
      }
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignUp()
  }

  // ── Choice Screen ─────────────────────────────────────────────
  if (mode === "choice") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Logo size="lg" />

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
            onClick={() => { setMode("referee"); resetForm() }}
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
              Login or Sign Up →
            </div>
          </div>

          {/* Viewer card */}
          <div
            onClick={() => navigate("/viewer")}
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

  // ── Referee Auth Form (Login / Sign Up) ───────────────────────
  const isSignUp = authMode === "signup"

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Logo />

      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Back */}
        <button
          onClick={() => { setMode("choice"); resetForm() }}
          style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back
        </button>

        {/* Toggle tabs */}
        <div style={{ display: "flex", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: 4, marginBottom: 24, gap: 4 }}>
          {["login", "signup"].map(tab => (
            <button
              key={tab}
              onClick={() => switchAuthMode(tab)}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 3, border: "none", cursor: "pointer",
                fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: 2, textTransform: "uppercase",
                background: authMode === tab ? "var(--yellow)" : "transparent",
                color: authMode === tab ? "#000" : "var(--muted)",
                transition: "all 0.15s",
              }}
            >
              {tab === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="rt-card" style={{ borderTop: `3px solid var(--yellow)` }}>
          <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>Email</label>
              <input
                type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
                className="rt-input" style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>Password</label>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                className="rt-input" style={{ width: "100%" }}
              />
            </div>

            {isSignUp && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>Confirm Password</label>
                <input
                  type="password" placeholder="••••••••" value={confirm}
                  onChange={e => setConfirm(e.target.value)} onKeyDown={handleKey}
                  className="rt-input" style={{ width: "100%" }}
                />
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.3)", borderRadius: 3, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: "rgba(118,255,3,0.08)", border: "1px solid rgba(118,255,3,0.3)", borderRadius: 3, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                {success}
              </div>
            )}

            <button
              className="rt-btn-primary"
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={loading}
              style={{ width: "100%", padding: "13px 0", fontSize: 18, marginTop: 4 }}
            >
              {loading
                ? (isSignUp ? "Creating account..." : "Signing in...")
                : (isSignUp ? "Create Account →" : "Sign In →")
              }
            </button>

            {/* Inline toggle link */}
            <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
              {isSignUp ? "Already have an account? " : "New here? "}
              <button
                onClick={() => switchAuthMode(isSignUp ? "login" : "signup")}
                style={{ background: "none", border: "none", color: "var(--yellow)", cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textDecoration: "underline" }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

          </div>
        </div>

        {isSignUp && (
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.5px", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            A confirmation email may be sent depending on your Supabase settings.
          </p>
        )}

      </div>
    </div>
  )
}

export default Login