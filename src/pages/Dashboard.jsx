import { useNavigate } from "react-router-dom"

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white">

      {/* Hero Section */}
      <div className="text-center pt-20 pb-16 px-6">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          PRO KABADDI MATCH MANAGER
        </h1>
        <p className="text-gray-300 mt-6 text-lg">
          Live Scoring • Player Analytics • Match Timer • Full Team Control
        </p>
      </div>

      {/* Action Cards */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 px-10 pb-20">

        <div
          onClick={() => navigate("/create-match")}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 p-10 rounded-3xl w-80 text-black cursor-pointer shadow-2xl hover:scale-105 transition duration-300"
        >
          <h2 className="text-3xl font-bold mb-4">Create Match</h2>
          <p className="font-medium">
            Select teams, configure timer and start live PKL scoring.
          </p>
        </div>

        <div
          onClick={() => navigate("/teams")}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-10 rounded-3xl w-80 text-white cursor-pointer shadow-2xl hover:scale-105 transition duration-300"
        >
          <h2 className="text-3xl font-bold mb-4">Manage Teams</h2>
          <p>
            Add teams, manage players and track match performance.
          </p>
        </div>

      </div>

    </div>
  )
}

export default Dashboard
