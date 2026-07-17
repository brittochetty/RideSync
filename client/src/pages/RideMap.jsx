import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'
import { useMap } from 'react-leaflet'

import API from '../utils/api'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapBounds({ myLocation, destination }) {
  const map = useMap()

  useEffect(() => {
    if (myLocation && destination?.latitude) {
      const bounds = [
        [myLocation.latitude, myLocation.longitude],
        [destination.latitude, destination.longitude]
      ]
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (myLocation) {
      map.setView([myLocation.latitude, myLocation.longitude], 14)
    }
  }, [myLocation, destination])

  return null
}
function RideMap() {
  const { rideCode } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [riders, setRiders] = useState([])
  const [totalRiders, setTotalRiders] = useState(1)
  const [riderDistances, setRiderDistances] = useState([])  

  const [myLocation, setMyLocation] = useState(null)
  const [rideInfo, setRideInfo] = useState(null)
  const [reaction, setReaction] = useState('')
  const socketRef = useRef(null)
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE || 'http://localhost:5000')

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

      if (myLocation) {
        const dist = calculateDistance(
          myLocation.latitude,
          myLocation.longitude,
          data.latitude,
          data.longitude
        )
        const distNum = parseFloat(dist)
        setRiderDistances((prev) => {
          const exists = prev.find((r) => r.userId === data.userId)
          const newEntry = {
            userId: data.userId,
            name: data.name,
            distance: distNum,
            position: distNum < 0.1 ? 'same location' :
              data.latitude > myLocation.latitude ? 'ahead' : 'behind'
          }
          if (exists) {
            return prev.map((r) => r.userId === data.userId ? newEntry : r)
          }
          return [...prev, newEntry]
        })
      }
    })

    socketRef.current.on('rider-count-update', (data) => {
      setTotalRiders(data.count)
    })

    socketRef.current.on('receive-reaction', (data) => {
      setReaction(`${data.name}: ${data.reaction}`)
      setTimeout(() => setReaction(''), 3000)
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [rideCode])

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/rides/${rideCode}`)
        setRideInfo(res.data)
        console.log('Ride info loaded:', res.data)
        console.log('Destination:', res.data.destination)
      } catch (err) {
        console.log('Error fetching ride:', err)
      }
    }
    fetchRide()
  }, [rideCode])
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 500)
  }, [])
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMyLocation({ latitude, longitude })

        socketRef.current.emit('send-location', {
          userId: user?.id,
          name: user?.name,
          rideCode,
          latitude,
          longitude
        })
        // Calculate distance from each rider
        if (riders.length > 0) {
          const distances = riders
            .filter(r => r.latitude && r.longitude)
            .map(r => {
              const dist = calculateDistance(
                latitude, longitude,
                r.latitude, r.longitude
              )
              const distNum = parseFloat(dist)
              return {
                name: r.name,
                distance: distNum,
                position: distNum < 0.1 ? 'same location' :
                  r.latitude > latitude ? 'ahead' : 'behind'
              }
            })
          setRiderDistances(distances)
        }

        if (rideInfo?.destination?.latitude && rideInfo?.destination?.longitude) {
          const dist = calculateDistance(
            latitude,
            longitude,
            rideInfo.destination.latitude,
            rideInfo.destination.longitude
          )
          setDistance(dist)
        }
      },

      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
return () => navigator.geolocation.clearWatch(watchId)
  }, [rideCode, user, rideInfo])

  // ADD THE NEW useEffect RIGHT HERE 👇
  useEffect(() => {
    if (myLocation && riders.length > 0) {
      const distances = riders
        .filter(r => r.latitude && r.longitude)
        .map(r => {
          const dist = calculateDistance(
            myLocation.latitude,
            myLocation.longitude,
            r.latitude,
            r.longitude
          )
          const distNum = parseFloat(dist)
          return {
            userId: r.userId,
            name: r.name,
            distance: distNum,
            position: distNum < 0.1 ? 'same location' :
              r.latitude > myLocation.latitude ? 'ahead' : 'behind'
          }
        })
      setRiderDistances(distances)
    }
  }, [riders, myLocation])

  

  const sendReaction = (emoji) => {
    socketRef.current.emit('send-reaction', {
      name: user?.name,
      reaction: emoji,
      rideCode
    })
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(1)
  }

  const openGoogleMaps = () => {
    if (rideInfo?.destination?.name) {
      const destination = encodeURIComponent(rideInfo.destination.name)
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
        '_blank'
      )
    }
  }

  const defaultCenter = myLocation
    ? [myLocation.latitude, myLocation.longitude]
    : [19.0760, 72.8777]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div>
          <h2 style={styles.title}>🏍️ Live Ride</h2>
          <p style={styles.code}>Code: {rideCode}</p>
        </div>
       <div style={styles.rideStats}>
          <p style={styles.riderCount}>👥 {totalRiders} riders</p>
        </div>
      </div>


      {riderDistances.length > 0 && (
        <div style={styles.riderPanel}>
          {riderDistances.map((r, i) => (
            <div key={i} style={styles.riderRow}>
              <span style={styles.riderName}>👤 {r.name}</span>
              <span style={{
                ...styles.riderDist,
                color: r.position === 'ahead' ? '#4caf50' : 
                       r.position === 'behind' ? '#e63946' : '#aaa'
              }}>
                {r.position === 'same location' ? '📍 Same location' :
                 `${r.distance} km ${r.position}`}
                {r.position === 'behind' && r.distance > 5 && ' ⚠️'}
              </span>
            </div>
          ))}
        </div>
      )}


      {rideInfo?.destination?.name && (
        <div style={styles.destBar}>
          <span style={styles.destIcon}>📍</span>
          <span style={styles.destText}>
            Heading to: <strong>{rideInfo.destination.name}</strong>
          </span>
          {distance && (
            <span style={styles.destDistance}>{distance} km away</span>
          )}
        </div>
      )}


      {reaction && (
        <div style={styles.reactionBanner}>
          {reaction}
        </div>
      )}

      <div style={styles.mapWrapper} id="map-wrapper">
       <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => {
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'))
            }, 100)
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
          <MapBounds 
  myLocation={myLocation} 
  destination={rideInfo?.destination} 
/>

          {myLocation && (
            <Marker position={[myLocation.latitude, myLocation.longitude]}>
              <Popup>You ({user?.name})</Popup>
            </Marker>
          )}
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
              <Popup>
                🏁 Destination: {rideInfo?.destination?.name}
              </Popup>
            </Marker>
          )}
          {myLocation && rideInfo?.destination?.latitude && (
  <Polyline
    positions={[
      [myLocation.latitude, myLocation.longitude],
      [rideInfo.destination.latitude, rideInfo.destination.longitude]
    ]}
    pathOptions={{
      color: '#e63946',
      weight: 5,
      opacity: 0.7,
      dashArray: '10, 10'
    }}
  />
)}
          {riders.map((rider) => (
            rider.latitude && rider.longitude && (
              <Marker
                key={rider.userId}
                position={[rider.latitude, rider.longitude]}
              >
                <Popup>{rider.name}</Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
          <div style={styles.googleMapsBtn}>
        <button
          style={styles.gmapBtn}
          onClick={openGoogleMaps}
        >
          🗺️ Navigate to {rideInfo?.destination?.name || 'Destination'} via Google Maps
        </button>
      </div>
      <div style={styles.reactions}>
        <p style={styles.reactionTitle}>Quick Reactions</p>
        <div style={styles.reactionButtons}>
          {['✅ I am fine', '⛽ Need fuel', '🛑 Stop needed'].map((r) => (
            <button
              key={r}
              style={styles.reactionBtn}
              onClick={() => sendReaction(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0f0f1a'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#1a1a2e',
    borderBottom: '1px solid #2a2a4a'
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #2a2a4a',
    color: '#aaa',
    padding: '6px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  title: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 2px 0'
  },
  code: {
    color: '#e63946',
    fontSize: '11px',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: '2px'
  },
  rideStats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px'
  },
  riderCount: {
    color: 'white',
    fontSize: '12px'
  },
  distanceText: {
    color: '#e63946',
    fontSize: '10px',
    fontWeight: 'bold'
  },
  reactionBanner: {
    backgroundColor: '#e63946',
    color: 'white',
    textAlign: 'center',
    padding: '6px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  stragglerBanner: {
    backgroundColor: '#ff9f1c',
    color: 'white',
    textAlign: 'center',
    padding: '6px',
    fontSize: '13px',
    fontWeight: 'bold'
  },


  riderPanel: {
    backgroundColor: '#0f0f1a',
    padding: '6px 12px',
    borderBottom: '1px solid #2a2a4a'
  },
  riderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0'
  },
  riderName: {
    color: '#aaa',
    fontSize: '12px'
  },
  riderDist: {
    fontSize: '12px',
    fontWeight: 'bold'
  },
  destBar: {
    backgroundColor: '#16213e',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #2a2a4a'
  },
  destIcon: {
    fontSize: '12px'
  },
  destText: {
    color: '#aaa',
    fontSize: '12px',
    flex: 1
  },
  destDistance: {
    color: '#e63946',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: '#2d1b1b',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  mapWrapper: {
    height: 'calc(100vh - 250px)',
    width: '100%',
    overflow: 'hidden'
  },
  googleMapsBtn: {
    backgroundColor: '#1a1a2e',
    padding: '10px 14px',
    borderTop: '1px solid #2a2a4a'
  },
 gmapBtn: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(66, 133, 244, 0.4)'
  },
  reactions: {
    backgroundColor: '#1a1a2e',
    padding: '5px 12px',
    borderTop: '1px solid #2a2a4a'
  },
  reactionTitle: {
    color: '#555',
    fontSize: '9px',
    marginBottom: '5px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  reactionButtons: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'nowrap'
  },
  reactionBtn: {
    backgroundColor: '#0f0f1a',
    color: 'white',
    border: '1px solid #2a2a4a',
    borderRadius: '20px',
    padding: '5px 6px',
    fontSize: '10px',
    cursor: 'pointer',
    fontWeight: '500',
    flex: '1',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }
}
export default RideMap