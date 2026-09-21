import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RideMap from './pages/RideMap'
import WatchRide from './pages/WatchRide'
import Assist from './assist/Assist'
import Mechanic from './assist/Mechanic'
import BikeSwap from './assist/BikeSwap'
import Marketplace from './assist/Marketplace'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride/:rideCode"
            element={
              <ProtectedRoute>
                <RideMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:rideCode"
            element={<WatchRide />}
          />
          <Route path="/assist" element={
            <ProtectedRoute><Assist /></ProtectedRoute>
          } />
          <Route path="/assist/mechanic" element={
            <ProtectedRoute><Mechanic /></ProtectedRoute>
          } />
          <Route path="/assist/swap" element={
            <ProtectedRoute><BikeSwap /></ProtectedRoute>
          } />
          <Route path="/assist/marketplace" element={
            <ProtectedRoute><Marketplace /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App