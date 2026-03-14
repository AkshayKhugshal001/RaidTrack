import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [playerName, setPlayerName] = useState("")
  const [position, setPosition] = useState("raider")

  useEffect(() => {
    fetchTeam()
    fetchPlayers()
  }, [])

  const fetchTeam = async () => {
    const { data } = await supabase.from("teams").select("*").eq("id", id).single()
    setTeam(data)
  }

  const fetchPlayers = async () => {
    const { data } = await supabase.from("players").select("*").eq("team_id", id)
    setPlayers(data || [])
  }

  const addPlayer = async () => {
    if (!playerName.trim()) return
    await supabase.from("players").insert([{
      name: playerName.trim(),
      position,
      team_id: id,
    }])
    setPlayerName("")
    fetchPlayers()
  }

  const handleKey = (e) => {
    if (e.key === "Enter") addPlayer()
  }

  const raiders     = players.filter(p => p.position === "raider")
  const defenders   = players.filter(p => p.position === "defender")
  const allrounders = players.filter(p => p.position === "allrounder")

  const groups = [
    { label: "Raiders",     list: raiders,     accent: "var(--yellow)" },
    { label: "Defenders",   list: defenders,   accent: "var(--cyan)"   },
    { label: "Allrounders", list: allrounders, accent: "var(--green)"  },
  ]

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
          <button className="rt-nav-link active" onClick={() => navigate("/teams")}>Teams</button>
        </div>
        <button className="rt-nav-cta" onClick={() => navigate("/create-match")}>
          + New Match
        </button>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>

        <button
          onClick={() => navigate("/teams")}
          style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to Teams
        </button>

        <div style={{ marginBottom: 36 }}>
          <div className="rt-section-label">Team Roster</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 3, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
            {team?.name || "Loading..."}
          </h1>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", marginTop: 8, textTransform: "uppercase" }}>
            {players.length} / 7 min players
            {players.length >= 7
              ? <span style={{ color: "var(--green)", marginLeft: 10 }}>● Ready to play</span>
              : <span style={{ color: "var(--orange)", marginLeft: 10 }}>● Need {7 - players.length} more</span>
            }
          </div>
        </div>

        <div className="rt-card" style={{ borderTop: "3px solid var(--yellow)", marginBottom: 32 }}>
          <div className="rt-card-header">
            <span className="rt-card-title">Add Player</span>
          </div>
          <div style={{ padding: "20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Player name..."
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={handleKey}
              className="rt-input"
              style={{ flex: 1, minWidth: 200 }}
            />
            <select
              className="rt-select"
              value={position}
              onChange={e => setPosition(e.target.value)}
            >
              <option value="raider">Raider</option>
              <option value="defender">Defender</option>
              <option value="allrounder">Allrounder</option>
            </select>
            <button className="rt-btn-primary" onClick={addPlayer}>
              Add Player
            </button>
          </div>
        </div>

        {groups.map(group => (
          group.list.length > 0 && (
            <div key={group.label} style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "4px", textTransform: "uppercase", color: group.accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                {group.label} ({group.list.length})
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {group.list.map((player, idx) => (
                  <div
                    key={player.id}
                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ width: 36, height: 36, background: `${group.accent}1a`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 18, color: group.accent, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: group.accent, letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>
                        {player.position}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {players.length === 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: "var(--muted)" }}>No Players Yet</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginTop: 8 }}>Add players above to build your roster.</div>
          </div>
        )}

      </div>
    </div>
  )
}

export default TeamDetail