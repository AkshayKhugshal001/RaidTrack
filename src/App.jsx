import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import CreateMatch from "./pages/CreateMatch"
import LiveMatch from "./pages/LiveMatch"
import Teams from "./pages/Teams"
import TeamDetail from "./pages/TeamDetail"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-match" element={<CreateMatch />} />
        <Route path="/live-match/:id" element={<LiveMatch />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/team/:id" element={<TeamDetail />} />
      </Routes>
    </Router>
  )
}

export default App
