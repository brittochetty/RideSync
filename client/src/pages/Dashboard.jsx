import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [joinCode, setJoinCode] = useState('')
  const [destination, setDestination] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateRide = async () => {
    if (!destination) {
      setError('Please enter a destination')
      return
    }
    setLoading(true)
    setError('')

    try {
      let destCoords = { name: destination }

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(destination)}&limit=1&countrycodes=in`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'RideSync/1.0'
            }
          }
        )
        const geoData = await geoRes.json()

        if (geoData && geoData.length > 0) {
          destCoords = {
            name: destination,
            latitude: parseFloat(geoData[0].lat),
            longitude: parseFloat(geoData[0].lon)
          }
        } else {
          const geoRes2 = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&q=${encodeURIComponent(destination + ' India')}&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const geoData2 = await geoRes2.json()

          if (geoData2 && geoData2.length > 0) {
            destCoords = {
              name: destination,
              latitude: parseFloat(geoData2[0].lat),
              longitude: parseFloat(geoData2[0].lon)
            }
          }
        }
      } catch (geoErr) {
        console.log('Geocoding failed:', geoErr)
      }

      const res = await API.post('/rides/create', {
        destination: destCoords
      })
      navigate(`/ride/${res.data.rideCode}`)

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ride')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRide = async () => {
    if (!joinCode) {
      setError('Please enter a ride code')
      return
    }
    setLoading(true)
    setError('')

    try {
      await API.post('/rides/join', { rideCode: joinCode.toUpperCase() })
      navigate(`/ride/${joinCode.toUpperCase()}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join ride')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>🏍️</span>
          <span style={styles.headerTitle}>RideSync</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userBadge}>
            <span style={styles.userAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <span style={styles.userName}>{user?.name}</span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>

        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeText}>
            Ready to ride, {user?.name?.split(' ')[0]}? 🏁
          </h2>
          <p style={styles.welcomeSubtext}>
            Create a new ride or join your group
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Create Ride Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🚀</span>
            <div>
              <h3 style={styles.cardTitle}>Create a New Ride</h3>
              <p style={styles.cardDesc}>Set destination and share code with group</p>
            </div>
          </div>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter destination (e.g. Lonavala)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.7 : 1
            }}
            onClick={handleCreateRide}
            disabled={loading}
          >
            {loading ? '⏳ Creating ride...' : '🚀 Create Ride'}
          </button>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Join Ride Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🔗</span>
            <div>
              <h3 style={styles.cardTitle}>Join a Ride</h3>
              <p style={styles.cardDesc}>Enter the code shared by your ride leader</p>
            </div>
          </div>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter ride code (e.g. ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button
            style={{
              ...styles.secondaryBtn,
              opacity: loading ? 0.7 : 1
            }}
            onClick={handleJoinRide}
            disabled={loading}
          >
            {loading ? '⏳ Joining...' : '🔗 Join Ride'}
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    color: '#ffffff'
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2a2a4a'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerIcon: {
    fontSize: '24px'
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e63946',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  userName: {
    color: '#aaa',
    fontSize: '14px'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #2a2a4a',
    color: '#aaa',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  welcomeSection: {
    marginBottom: '32px'
  },
  welcomeText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  welcomeSubtext: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  errorBox: {
    backgroundColor: '#2d1b1b',
    border: '1px solid #e63946',
    color: '#e63946',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #2a2a4a',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  cardIcon: {
    fontSize: '32px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 4px 0'
  },
  cardDesc: {
    color: '#666',
    fontSize: '13px',
    margin: 0
  },
  input: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #2a2a4a',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#0f0f1a',
    color: '#ffffff'
  },
  primaryBtn: {
    padding: '14px',
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  secondaryBtn: {
    padding: '14px',
    backgroundColor: '#16213e',
    color: 'white',
    border: '1px solid #2a2a4a',
    borderRadius: '10px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '8px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#2a2a4a'
  },
  dividerText: {
    color: '#555',
    fontSize: '13px'
  }
}

export default Dashboard