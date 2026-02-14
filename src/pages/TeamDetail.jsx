import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

function TeamDetail() {
  const { id } = useParams()
  const [players, setPlayers] = useState([])
  const [playerName, setPlayerName] = useState("")
  const [position, setPosition] = useState("raider")

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", id)

    setPlayers(data)
  }

  const addPlayer = async () => {
    if (!playerName) return

    await supabase
      .from("players")
      .insert([{
        name: playerName,
        position,
        team_id: id
      }])

    setPlayerName("")
    fetchPlayers()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900 text-white p-10">

      <h1 className="text-4xl font-bold mb-8 text-center">
        Manage Players
      </h1>

      <div className="flex justify-center gap-4 mb-10">
        <input
        type="text"
        placeholder="Enter player name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />

        <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
        <option value="raider">Raider</option>
        <option value="defender">Defender</option>
        <option value="allrounder">Allrounder</option>
        </select>

        <button
          onClick={addPlayer}
          className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg"
        >
          Add Player
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {players.map(player => (
          <div
            key={player.id}
            className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-xl font-bold">
              {player.name}
            </h2>
            <p className="text-sm mt-2">
              Position: {player.position}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default TeamDetail
