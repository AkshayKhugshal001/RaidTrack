import { useState } from "react"
import { supabase } from "../services/supabaseClient"

function Home() {

  const [teamName, setTeamName] = useState("")

  const addTeam = async () => {
    if (!teamName) {
      alert("Enter team name")
      return
    }

    const { data, error } = await supabase
      .from("teams")
      .insert([{ name: teamName }])

    if (error) {
      console.log("Error:", error)
    } else {
      alert("Team Added Successfully")
      setTeamName("")
    }
  }

  return (
    <div>
      <h2>Kabaddi Scoring App</h2>

      <input
        type="text"
        placeholder="Enter team name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
      />

      <button onClick={addTeam}>
        Add Team
      </button>
    </div>
  )
}

export default Home
