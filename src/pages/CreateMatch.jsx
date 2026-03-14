import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

function CreateMatch() {
  const [teams,    setTeams]    = useState([])
  const [team1,    setTeam1]    = useState("")
  const [team2,    setTeam2]    = useState("")
  const [halfMins, setHalfMins] = useState(20)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const navigate = useNavigate()

  useEffect(() => { fetchTeams() }, [])

  const fetchTeams = async () => {
    const { data, error } = await supabase.from("teams").select("*")
    if (error) console.error("Error fetching teams:", error)
    setTeams(data || [])
  }

  const createMatch = async () => {
    setError("")

    if (!team1 || !team2) { setError("Please select both teams"); return }
    if (team1 === team2)  { setError("Please select two different teams"); return }
    if (halfMins < 3)     { setError("Minimum half duration is 3 minutes"); return }
    if (halfMins > 20)    { setError("Maximum half duration is 20 minutes"); return }

    setLoading(true)

    try {
      const { data: players1, error: e1 } = await supabase
        .from("players").select("*").eq("team_id", team1)
      const { data: players2, error: e2 } = await supabase
        .from("players").select("*").eq("team_id", team2)

      if (e1 || e2) {
        setError("Error fetching players. Try again.")
        setLoading(false)
        return
      }

      if (!players1 || players1.length < 7) {
        setError(`${teams.find(t => String(t.id) === String(team1))?.name} needs at least 7 players`)
        setLoading(false)
        return
      }

      if (!players2 || players2.length < 7) {
        setError(`${teams.find(t => String(t.id) === String(team2))?.name} needs at least 7 players`)
        setLoading(false)
        return
      }

      const halfDuration = halfMins * 60

      const { data, error: insertError } = await supabase
        .from("matches")
        .insert([{
          team1_id:      team1,
          team2_id:      team2,
          time_remaining: halfDuration,
          half_duration:  halfDuration,
          status:         "upcoming",
          team1_score:    0,
          team2_score:    0,
          is_running:     false,
        }])
        .select()

      if (insertError) {
        console.error("Insert error:", insertError)
        setError("Failed to create match: " + insertError.message)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError("Match created but no ID returned. Check Supabase RLS policies.")
        setLoading(false)
        return
      }

      navigate(`/live-match/${data[0].id}`)

    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const team1Name = teams.find(t => String(t.id) === String(team1))?.name
  const team2Name = teams.find(t => String(t.id) === String(team2))?.name

  return (
    <div className="rt-page">

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
        <div className="rt-nav-links">
          <button className="rt-nav-link" onClick={() => navigate("/")}>Dashboard</button>
          <span className="rt-nav-link active">Matches</span>
          <button className="rt-nav-link" onClick={() => navigate("/teams")}>Teams</button>
        </div>
        <button className="rt-nav-cta" onClick={() => navigate("/teams")}>Manage Teams</button>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>

        <div style={{ marginBottom: 36 }}>
          <div className="rt-section-label">New Match</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 3, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
            Create Match
          </h1>
        </div>

        <div className="rt-card" style={{ borderTop: "3px solid var(--yellow)" }}>
          <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Team 1 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--yellow)" }}>
                Team 1
              </label>
              <select className="rt-select" value={team1} onChange={e => { setTeam1(e.target.value); setError("") }}>
                <option value="">Select Team 1</option>
                {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>

            {/* VS divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 4, color: "var(--muted)" }}>VS</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Team 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                Team 2
              </label>
              <select className="rt-select" value={team2} onChange={e => { setTeam2(e.target.value); setError("") }}>
                <option value="">Select Team 2</option>
                {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>

            {/* Half duration — free input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                Half Duration (minutes)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={halfMins}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 3
                    setHalfMins(Math.min(20, Math.max(3, val)))
                    setError("")
                  }}
                  className="rt-input"
                  style={{ width: 100, textAlign: "center", fontSize: 20, fontFamily: "var(--font-display)", letterSpacing: 2 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                    min per half (3 – 20 min)
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--yellow)", marginTop: 2 }}>
                    Total: {halfMins * 2} min · 2 halves of {halfMins} min each
                  </div>
                </div>
              </div>

              {/* Quick select buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {[5, 10, 15, 20].map(m => (
                  <button
                    key={m}
                    onClick={() => { setHalfMins(m); setError("") }}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: 3,
                      border: halfMins === m ? "2px solid var(--yellow)" : "1px solid var(--border)",
                      background: halfMins === m ? "rgba(255,214,0,0.1)" : "var(--card2)",
                      color: halfMins === m ? "var(--yellow)" : "var(--muted)",
                      fontFamily: "var(--font-display)",
                      fontSize: 14,
                      letterSpacing: 1,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Match preview */}
            {team1Name && team2Name && (
              <div style={{ background: "rgba(255,214,0,0.06)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: 3, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--yellow)" }}>{team1Name}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--muted)", letterSpacing: 2 }}>VS</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "#fff" }}>{team2Name}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.3)", borderRadius: 3, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>
                {error}
              </div>
            )}

            <button
              className="rt-btn-primary"
              onClick={createMatch}
              disabled={loading}
              style={{ width: "100%", padding: "13px 0", fontSize: 18 }}
            >
              {loading ? "Creating Match..." : "Create Match →"}
            </button>

          </div>
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.5px", textAlign: "center", marginTop: 16 }}>
          Each team needs at least 7 players. Half duration is per half.
        </p>
      </div>
    </div>
  )
}

export default CreateMatch