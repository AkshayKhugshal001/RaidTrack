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

    setTeams(data)
  }

  const addTeam = async () => {
    if (!teamName) return

    await supabase
      .from("teams")
      .insert([{ name: teamName }])

    setTeamName("")
    fetchTeams()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-black to-purple-900 text-white p-10">

      <h1 className="text-4xl font-bold mb-8 text-center">
        Manage Teams
      </h1>

      <div className="flex justify-center gap-4 mb-10">
        <input
        type="text"
        placeholder="Enter team name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-72"
        />


        <button
          onClick={addTeam}
          className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
        >
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map(team => (
          <div
            key={team.id}
            onClick={() => navigate(`/team/${team.id}`)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-2xl cursor-pointer hover:scale-105 transition duration-300 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white">
              {team.name}
            </h2>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Teams
