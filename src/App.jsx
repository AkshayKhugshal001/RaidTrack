import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"

import Dashboard    from "./pages/Dashboard"
import CreateMatch  from "./pages/CreateMatch"
import LiveMatch    from "./pages/LiveMatch"
import Teams        from "./pages/Teams"
import TeamDetail   from "./pages/TeamDetail"
import Login        from "./pages/Login"
import ViewerHome   from "./pages/ViewerHome"
import ViewerMatch  from "./pages/ViewerMatch"

// ── Protected Route ───────────────────────────────────────────
// Redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "var(--muted)" }}>
        Loading...
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── App Routes ────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 4, color: "var(--muted)" }}>
        Loading...
      </div>
    </div>
  )

  return (
    <Routes>
      {/* Public routes — no login needed */}
      <Route path="/login"        element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/viewer"       element={<ViewerHome />} />
      <Route path="/viewer/:id"   element={<ViewerMatch />} />

      {/* Protected routes — referee/host only */}
      <Route path="/" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/create-match" element={
        <ProtectedRoute><CreateMatch /></ProtectedRoute>
      } />
      <Route path="/live-match/:id" element={
        <ProtectedRoute><LiveMatch /></ProtectedRoute>
      } />
      <Route path="/teams" element={
        <ProtectedRoute><Teams /></ProtectedRoute>
      } />
      <Route path="/team/:id" element={
        <ProtectedRoute><TeamDetail /></ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App