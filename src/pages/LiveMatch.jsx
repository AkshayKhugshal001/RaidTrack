import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

function LiveMatch() {
  const { id } = useParams()

  const [match, setMatch] = useState(null)
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [team1Players, setTeam1Players] = useState([])
  const [team2Players, setTeam2Players] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    fetchMatch()
  }, [])

  useEffect(() => {
    let interval

    if (isRunning && time > 0) {
      interval = setInterval(async () => {
        setTime(prev => {
          const newTime = prev - 1

          supabase
            .from("matches")
            .update({ time_remaining: newTime })
            .eq("id", id)

          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, time])

  const fetchMatch = async () => {
    const { data } = await supabase
      .from("matches")
      .select(`
        *,
        team1:team1_id(name),
        team2:team2_id(name)
      `)
      .eq("id", id)
      .single()

    if (!data) return

    setMatch(data)
    setTeam1(data.team1.name)
    setTeam2(data.team2.name)
    setTime(data.time_remaining)
    setIsRunning(data.is_running)

    const { data: players1 } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", data.team1_id)

    const { data: players2 } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", data.team2_id)

    setTeam1Players(players1 || [])
    setTeam2Players(players2 || [])
  }

  const updateScore = async (team, points) => {
    if (!selectedPlayer) {
      alert("Select a player first")
      return
    }

    const updatedScore =
      team === 1
        ? match.team1_score + points
        : match.team2_score + points

    await supabase
      .from("matches")
      .update(
        team === 1
          ? { team1_score: updatedScore }
          : { team2_score: updatedScore }
      )
      .eq("id", id)

    const { data: existing } = await supabase
      .from("player_match_stats")
      .select("*")
      .eq("match_id", id)
      .eq("player_id", selectedPlayer.id)
      .maybeSingle()

    if (!existing) {
      await supabase
        .from("player_match_stats")
        .insert([{
          match_id: id,
          player_id: selectedPlayer.id,
          total_points: points,
          raid_attempts: 1,
          successful_raids: points > 0 ? 1 : 0,
          raid_points: points
        }])
    } else {
      await supabase
        .from("player_match_stats")
        .update({
          total_points: existing.total_points + points,
          raid_attempts: existing.raid_attempts + 1,
          successful_raids: existing.successful_raids + (points > 0 ? 1 : 0),
          raid_points: existing.raid_points + points
        })
        .eq("id", existing.id)
    }

    setSelectedPlayer(null)
    fetchMatch()
  }

  if (!match) return <p className="text-white">Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">

      <h1 className="text-4xl font-bold text-center mb-4">
        LIVE MATCH
      </h1>

      <h2 className="text-center text-3xl font-bold mb-4">
        Time Remaining: {Math.floor(time / 60)}:
        {(time % 60).toString().padStart(2, "0")}
      </h2>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={async () => {
            setIsRunning(true)
            await supabase
              .from("matches")
              .update({ is_running: true })
              .eq("id", id)
          }}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
        >
          Start
        </button>

        <button
          onClick={async () => {
            setIsRunning(false)
            await supabase
              .from("matches")
              .update({ is_running: false })
              .eq("id", id)
          }}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Pause
        </button>
      </div>

      <div className="flex justify-center items-center gap-16 mb-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{team1}</h2>
          <p className="text-7xl font-extrabold text-yellow-400">
            {match.team1_score}
          </p>
        </div>

        <span className="text-4xl font-bold">VS</span>

        <div className="text-center">
          <h2 className="text-2xl font-semibold">{team2}</h2>
          <p className="text-7xl font-extrabold text-yellow-400">
            {match.team2_score}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">{team1} Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {team1Players.map(player => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className={`p-4 rounded-lg cursor-pointer text-center
              ${selectedPlayer?.id === player.id
                ? "bg-yellow-500 text-black"
                : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            <p className="font-semibold">{player.name}</p>
            <p className="text-sm">{player.position}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">{team2} Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {team2Players.map(player => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className={`p-4 rounded-lg cursor-pointer text-center
              ${selectedPlayer?.id === player.id
                ? "bg-yellow-500 text-black"
                : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            <p className="font-semibold">{player.name}</p>
            <p className="text-sm">{player.position}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={() => updateScore(1, 1)}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg"
        >
          +1 Raid Point
        </button>

        <button
          onClick={() => updateScore(2, 1)}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg"
        >
          +1 Tackle Point
        </button>
      </div>

    </div>
  )
}

export default LiveMatch
