import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

function Teams() {
  const [teams, setTeams] = useState([])
  const [teamName, setTeamName] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false })
    setTeams(data || [])
  }

  const addTeam = async () => {
    if (!teamName.trim()) return
    await supabase.from("teams").insert([{ name: teamName.trim() }])
    setTeamName("")
    fetchTeams()
  }

  const handleKey = (e) => {
    if (e.key === "Enter") addTeam()
  }

  const accents = ["var(--yellow)", "var(--orange)", "var(--cyan)", "var(--green)"]

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
          <button className="rt-nav-link" onClick={() => navigate("/create-match")}>Matches</button>
          <span className="rt-nav-link active">Teams</span>
        </div>
        <button className="rt-nav-cta" onClick={() => navigate("/create-match")}>
          + New Match
        </button>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>

        <div style={{ marginBottom: 36 }}>
          <div className="rt-section-label">Team Management</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 3, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
            Manage Teams
          </h1>
        </div>

        <div className="rt-card" style={{ borderTop: "3px solid var(--yellow)", marginBottom: 32 }}>
          <div className="rt-card-header">
            <span className="rt-card-title">Add New Team</span>
          </div>
          <div style={{ padding: "20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Enter team name..."
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              onKeyDown={handleKey}
              className="rt-input"
              style={{ flex: 1, minWidth: 240 }}
            />
            <button className="rt-btn-primary" onClick={addTeam}>
              Add Team
            </button>
          </div>
        </div>

        <div className="rt-section-label">All Teams ({teams.length})</div>

        {teams.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>No Teams Yet</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Add your first team above to get started.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {teams.map((team, i) => {
              const accent = accents[i % accents.length]
              return (
                <div
                  key={team.id}
                  onClick={() => navigate(`/team/${team.id}`)}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: `3px solid ${accent}`, borderRadius: 4, padding: "24px 20px", cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 1, color: accent, marginBottom: 6 }}>
                      {team.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 3)}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
                      {team.name}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", textTransform: "uppercase", marginTop: 6 }}>
                      View Players →
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
                    <path d="M7 4l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Teams