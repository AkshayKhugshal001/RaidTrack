import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

const NAV = ({ navigate }) => (
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
      <button className="rt-nav-link" onClick={() => navigate("/teams")}>Teams</button>
      <span className="rt-nav-link active">Tournaments</span>
    </div>
    <button className="rt-nav-cta" onClick={() => navigate("/create-match")}>+ New Match</button>
  </nav>
)

function Tournaments() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [teams,       setTeams]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [creating,    setCreating]    = useState(false)
  const [error,       setError]       = useState("")

  // Form state
  const [name,         setName]         = useState("")
  const [format,       setFormat]       = useState("league")
  const [halfMins,     setHalfMins]     = useState(10)
  const [selectedTeams,setSelectedTeams]= useState([])
  const [showForm,     setShowForm]     = useState(false)

  useEffect(() => {
    fetchTournaments()
    fetchTeams()
  }, [])

  const fetchTournaments = async () => {
    const { data } = await supabase
      .from("tournaments")
      .select("*, tournament_teams(team_id, teams(name))")
      .order("created_at", { ascending: false })
    setTournaments(data || [])
    setLoading(false)
  }

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*").order("name")
    setTeams(data || [])
  }

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(t => t !== teamId) : [...prev, teamId]
    )
    setError("")
  }

  const createTournament = async () => {
    setError("")
    if (!name.trim())          { setError("Enter a tournament name"); return }
    if (selectedTeams.length < 2) { setError("Select at least 2 teams"); return }
    if (format === "knockout") {
      const validCounts = [2, 4, 8, 16]
      if (!validCounts.includes(selectedTeams.length)) {
        setError(`Knockout format needs exactly 2, 4, 8, or 16 teams. You selected ${selectedTeams.length}.`)
        return
      }
    }

    setCreating(true)
    try {
      // 1. Create tournament
      const { data: tournament, error: tErr } = await supabase
        .from("tournaments")
        .insert([{
          name: name.trim(),
          format,
          status: "upcoming",
          half_duration: halfMins * 60,
        }])
        .select()
        .single()

      if (tErr) { setError("Failed to create tournament: " + tErr.message); setCreating(false); return }

      // 2. Add teams to tournament
      const teamRows = selectedTeams.map(team_id => ({
        tournament_id: tournament.id,
        team_id,
        played: 0, wins: 0, losses: 0, draws: 0, points: 0, score_for: 0, score_against: 0,
      }))
      const { error: ttErr } = await supabase.from("tournament_teams").insert(teamRows)
      if (ttErr) { setError("Failed to add teams: " + ttErr.message); setCreating(false); return }

      navigate(`/tournament/${tournament.id}`)
    } catch (e) {
      setError("Something went wrong. Please try again.")
      setCreating(false)
    }
  }

  const statusColor = (s) =>
    s === "ongoing"   ? "var(--orange)" :
    s === "completed" ? "var(--muted)"  : "var(--yellow)"

  const statusLabel = (s) =>
    s === "ongoing"   ? "Ongoing"   :
    s === "completed" ? "Completed" : "Upcoming"

  return (
    <div className="rt-page">
      <NAV navigate={navigate} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="rt-section-label" style={{ color: "var(--cyan)" }}>Tournament Manager</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 3, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
              Tournaments
            </h1>
          </div>
          <button
            className="rt-btn-primary"
            style={{ fontSize: 16, padding: "10px 28px" }}
            onClick={() => { setShowForm(f => !f); setError("") }}
          >
            {showForm ? "✕ Cancel" : "+ New Tournament"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rt-card" style={{ borderTop: "3px solid var(--cyan)", marginBottom: 40 }}>
            <div className="rt-card-header">
              <span className="rt-card-title">Create Tournament</span>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--cyan)" }}>
                  Tournament Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. RaidTrack Premier League 2025"
                  value={name}
                  onChange={e => { setName(e.target.value); setError("") }}
                  className="rt-input"
                  style={{ fontSize: 16 }}
                />
              </div>

              {/* Format */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                  Format
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { key: "league",   label: "League",   sub: "Round Robin — every team plays each other" },
                    { key: "knockout", label: "Knockout", sub: "Single elimination — needs 2/4/8/16 teams" },
                  ].map(f => (
                    <div
                      key={f.key}
                      onClick={() => { setFormat(f.key); setError("") }}
                      style={{
                        flex: 1, padding: "16px", borderRadius: 4, cursor: "pointer",
                        border: format === f.key ? "2px solid var(--cyan)" : "1px solid var(--border)",
                        background: format === f.key ? "rgba(0,229,255,0.07)" : "var(--card2)",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: format === f.key ? "var(--cyan)" : "#fff" }}>
                        {f.label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 4 }}>{f.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Half Duration */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                  Half Duration (all matches)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[5, 10, 15, 20].map(m => (
                    <button
                      key={m}
                      onClick={() => setHalfMins(m)}
                      style={{
                        flex: 1, padding: "9px 0", borderRadius: 3, cursor: "pointer",
                        border: halfMins === m ? "2px solid var(--yellow)" : "1px solid var(--border)",
                        background: halfMins === m ? "rgba(255,214,0,0.1)" : "var(--card2)",
                        color: halfMins === m ? "var(--yellow)" : "var(--muted)",
                        fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 1,
                        transition: "all 0.15s",
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Teams */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
                  Select Teams ({selectedTeams.length} selected)
                </label>
                {teams.length === 0 ? (
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>
                    No teams found. Create teams first from the Teams page.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                    {teams.map(team => {
                      const selected = selectedTeams.includes(team.id)
                      return (
                        <div
                          key={team.id}
                          onClick={() => toggleTeam(team.id)}
                          style={{
                            padding: "12px 14px", borderRadius: 3, cursor: "pointer",
                            border: selected ? "2px solid var(--cyan)" : "1px solid var(--border)",
                            background: selected ? "rgba(0,229,255,0.08)" : "var(--card2)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            transition: "all 0.12s",
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 1, color: selected ? "var(--cyan)" : "#fff" }}>
                            {team.name}
                          </span>
                          {selected && (
                            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#000", fontWeight: 900, flexShrink: 0 }}>✓</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.3)", borderRadius: 3, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>
                  {error}
                </div>
              )}

              <button
                className="rt-btn-primary"
                onClick={createTournament}
                disabled={creating}
                style={{ width: "100%", padding: "14px 0", fontSize: 18, background: "var(--cyan)", color: "#000" }}
              >
                {creating ? "Creating..." : `Create Tournament →`}
              </button>
            </div>
          </div>
        )}

        {/* Tournaments List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, color: "var(--muted)" }}>Loading...</div>
          </div>
        ) : tournaments.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "64px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 3, color: "var(--muted)", marginBottom: 12 }}>No Tournaments Yet</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Create your first tournament above.</div>
          </div>
        ) : (
          <>
            {["ongoing", "upcoming", "completed"].map(status => {
              const list = tournaments.filter(t => t.status === status)
              if (list.length === 0) return null
              return (
                <div key={status} style={{ marginBottom: 36 }}>
                  <div className="rt-section-label" style={{ color: statusColor(status) }}>
                    {statusLabel(status)} ({list.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {list.map(t => (
                      <TournamentCard key={t.id} tournament={t} onClick={() => navigate(`/tournament/${t.id}`)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

function TournamentCard({ tournament, onClick }) {
  const teamCount = tournament.tournament_teams?.length ?? 0
  const accentColor =
    tournament.status === "ongoing"   ? "var(--orange)" :
    tournament.status === "completed" ? "rgba(255,255,255,0.15)" : "var(--cyan)"

  const statusLabel =
    tournament.status === "ongoing"   ? "Ongoing"   :
    tournament.status === "completed" ? "Completed" : "Upcoming"

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderLeft: `3px solid ${accentColor}`, borderRadius: 4,
        padding: "20px 24px", cursor: "pointer", transition: "background 0.15s",
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
    >
      {/* Status badge */}
      <div style={{ minWidth: 90 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, padding: "3px 8px", border: `1px solid ${accentColor}`, borderRadius: 2, display: "inline-block", marginBottom: 6 }}>
          {statusLabel}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase" }}>
          {tournament.format}
        </div>
      </div>

      {/* Name */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 2, color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: 6 }}>
          {tournament.name}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: 1 }}>
          {teamCount} teams · {tournament.half_duration / 60}m halves
        </div>
      </div>

      {/* Teams preview */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 300 }}>
        {tournament.tournament_teams?.slice(0, 4).map(tt => (
          <span key={tt.team_id} style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 2, letterSpacing: 1 }}>
            {tt.teams?.name}
          </span>
        ))}
        {teamCount > 4 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", padding: "3px 8px" }}>
            +{teamCount - 4} more
          </span>
        )}
      </div>

      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
        <path d="M7 4l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default Tournaments