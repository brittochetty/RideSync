import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { io } from 'socket.io-client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function WatchRide() {
  const { rideCode } = useParams()
  const [riders, setRiders] = useState([])
  const [rideInfo, setRideInfo] = useState(null)
  const [error, setError] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    // Fetch ride info without auth
    const fetchRide = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rides/watch/${rideCode}`
        )
        const data = await res.json()
        if (res.ok) {
          setRideInfo(data)
        } else {
          setError('Ride not found')
        }
      } catch (err) {
        setError('Could not load ride')
      }
    }
    fetchRide()
  }, [rideCode])

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    )

    socketRef.current.emit('join-ride', rideCode)

    socketRef.current.on('receive-location', (data) => {
      setRiders((prev) => {
        const exists = prev.find((r) => r.userId === data.userId)
        if (exists) {
          return prev.map((r) =>
            r.userId === data.userId ? { ...r, ...data } : r
          )
        }
        return [...prev, data]
      })
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [rideCode])

  const defaultCenter = riders.length > 0 && riders[0].latitude
    ? [riders[0].latitude, riders[0].longitude]
    : [19.0760, 72.8777]

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorText}>❌ {error}</h2>
        <p style={styles.errorSub}>Check the link and try again</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🏍️ RideSync — Live Tracking</h2>
          <p style={styles.code}>Ride Code: {rideCode}</p>
        </div>
        <div style={styles.info}>
          <p style={styles.destination}>
            📍 {rideInfo?.destination?.name || 'Loading...'}
          </p>
          <p style={styles.riderCount}>👥 {riders.length} riders active</p>
        </div>
      </div>

      <div style={styles.banner}>
        👁️ You are viewing this ride as a guest — Read Only
      </div>

      <div style={styles.mapWrapper}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />

          {riders.map((rider) => (
            rider.latitude && rider.longitude && (
              <Marker
                key={rider.userId}
                position={[rider.latitude, rider.longitude]}
              >
                <Popup>🏍️ {rider.name}</Popup>
              </Marker>
            )
          ))}

          {rideInfo?.destination?.latitude && (
            <Marker
              position={[
                rideInfo.destination.latitude,
                rideInfo.destination.longitude
              ]}
              icon={L.divIcon({
                className: '',
                html: `<div style="
                  background-color: #e63946;
                  width: 20px;
                  height: 20px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  border: 3px solid white;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 20]
              })}
            >
              <Popup>🏁 Destination: {rideInfo?.destination?.name}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Powered by 🏍️ RideSync — Ride Together. Stay Connected.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0f0f1a'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#1a1a2e',
    borderBottom: '1px solid #2a2a4a'
  },
  title: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
  },
  code: {
    color: '#e63946',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    margin: 0
  },
  info: {
    textAlign: 'right'
  },
  destination: {
    color: '#aaa',
    fontSize: '13px',
    margin: '0 0 4px 0'
  },
  riderCount: {
    color: 'white',
    fontSize: '13px',
    margin: 0
  },
  banner: {
    backgroundColor: '#16213e',
    color: '#4285F4',
    textAlign: 'center',
    padding: '6px',
    fontSize: '12px',
    borderBottom: '1px solid #2a2a4a'
  },
  mapWrapper: {
    flex: 1
  },
  footer: {
    backgroundColor: '#1a1a2e',
    padding: '8px',
    textAlign: 'center',
    borderTop: '1px solid #2a2a4a'
  },
  footerText: {
    color: '#555',
    fontSize: '11px',
    margin: 0
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#0f0f1a'
  },
  errorText: {
    color: '#e63946',
    fontSize: '24px'
  },
  errorSub: {
    color: '#666',
    fontSize: '14px',
    marginTop: '8px'
  }
}

export default WatchRide