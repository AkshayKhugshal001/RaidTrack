import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

function CreateMatch() {
  const [teams, setTeams] = useState([])
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")

    setTeams(data)
  }

  const createMatch = async () => {
    if (!team1 || !team2 || team1 === team2) {
      alert("Select two different teams")
      return
    }

    const { data: players1 } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", team1)

    const { data: players2 } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", team2)

    if (players1.length < 7 || players2.length < 7) {
      alert("Each team must have at least 7 players")
      return
    }

    const { data } = await supabase
      .from("matches")
      .insert([{
        team1_id: team1,
        team2_id: team2,
        time_remaining: 1200
      }])
      .select()

    navigate(`/live-match/${data[0].id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-black to-purple-900 text-white p-10">

      <h1 className="text-4xl font-bold mb-10 text-center">
        Create Match
      </h1>

      <div className="max-w-md mx-auto flex flex-col gap-6">

        <select
          value={team1}
          onChange={(e) => setTeam1(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="" className="bg-gray-800">
            Select Team 1
          </option>
          {teams.map(team => (
            <option key={team.id} value={team.id} className="bg-gray-800">
              {team.name}
            </option>
          ))}
        </select>

        <select
          value={team2}
          onChange={(e) => setTeam2(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="" className="bg-gray-800">
            Select Team 2
          </option>
          {teams.map(team => (
            <option key={team.id} value={team.id} className="bg-gray-800">
              {team.name}
            </option>
          ))}
        </select>

        <button
          onClick={createMatch}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:scale-105 transition duration-300 px-6 py-3 rounded-xl font-bold text-black shadow-xl"
        >
          Start Match
        </button>

      </div>

    </div>
  )
}

export default CreateMatch
