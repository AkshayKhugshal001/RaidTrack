import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

function CreateMatch() {
  const [teams, setTeams] = useState([])
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*")
    setTeams(data || [])
  }

  const createMatch = async () => {
    if (!team1 || !team2 || team1 === team2) {
      alert("Select two different teams")
      return
    }

    setLoading(true)

    const { data: players1 } = await supabase
      .from("players").select("*").eq("team_id", team1)
    const { data: players2 } = await supabase
      .from("players").select("*").eq("team_id", team2)

    if (!players1 || players1.length < 7 || !players2 || players2.length < 7) {
      alert("Each team must have at least 7 players")
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("matches")
      .insert([{ team1_id: team1, team2_id: team2, time_remaining: 1200 }])
      .select()

    navigate(`/live-match/${data[0].id}`)
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
        <button className="rt-nav-cta" onClick={() => navigate("/teams")}>
          Manage Teams
        </button>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--yellow)" }}>
                Team 1
              </label>
              <select className="rt-select" value={team1} onChange={e => setTeam1(e.target.value)}>
                <option value="">Select Team 1</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 4, color: "var(--muted)" }}>VS</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                Team 2
              </label>
              <select className="rt-select" value={team2} onChange={e => setTeam2(e.target.value)}>
                <option value="">Select Team 2</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {team1Name && team2Name && (
              <div style={{ background: "rgba(255,214,0,0.06)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: 3, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--yellow)" }}>{team1Name}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--muted)", letterSpacing: 2 }}>VS</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "#fff" }}>{team2Name}</span>
              </div>
            )}

            <button
              className="rt-btn-primary"
              onClick={createMatch}
              disabled={loading}
              style={{ width: "100%", padding: "13px 0", fontSize: 18 }}
            >
              {loading ? "Starting..." : "Start Match →"}
            </button>

          </div>
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.5px", textAlign: "center", marginTop: 16 }}>
          Each team must have at least 7 players before starting.
        </p>

      </div>
    </div>
  )
}

export default CreateMatch