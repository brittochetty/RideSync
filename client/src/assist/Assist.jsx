import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Assist() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const services = [
    {
      icon: '🔧',
      title: 'Find a Mechanic',
      desc: 'Breakdown during your ride? Find a nearby mechanic who comes to you.',
      route: '/assist/mechanic',
      color: '#e63946'
    },
    {
      icon: '🏍️',
      title: 'Bike Swap',
      desc: 'Need a temporary ride? Swap bikes with nearby riders or shops.',
      route: '/assist/swap',
      color: '#4285F4'
    },
    {
      icon: '🛒',
      title: 'Buy / Sell / Lease',
      desc: 'Browse vehicles for sale or lease. List your own vehicle in minutes.',
      route: '/assist/marketplace',
      color: '#4caf50'
    }
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div>
          <h1 style={styles.title}>🆘 RideAssist</h1>
          <p style={styles.subtitle}>Emergency help for riders</p>
        </div>
        <div style={styles.userBadge}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.banner}>
          <p style={styles.bannerText}>
            🏍️ Hey {user?.name?.split(' ')[0]}! Need help on the road?
          </p>
          <p style={styles.bannerSub}>
            Connect with nearby mechanics, swap bikes, or browse vehicles
          </p>
        </div>

        <div style={styles.grid}>
          {services.map((service) => (
            <div
              key={service.route}
              style={{...styles.card, borderTop: `4px solid ${service.color}`}}
              onClick={() => navigate(service.route)}
            >
              <div style={styles.cardIcon}>{service.icon}</div>
              <h2 style={styles.cardTitle}>{service.title}</h2>
              <p style={styles.cardDesc}>{service.desc}</p>
              <button style={{...styles.cardBtn, backgroundColor: service.color}}>
                Open →
              </button>
            </div>
          ))}
        </div>

        <div style={styles.emergencyBox}>
          <p style={styles.emergencyTitle}>🚨 In a serious emergency?</p>
          <p style={styles.emergencyText}>Call 112 for police or 108 for ambulance</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    color: '#fff'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#1a1a2e',
    borderBottom: '1px solid #2a2a4a'
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #2a2a4a',
    color: '#aaa',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  title: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 2px 0',
    textAlign: 'center'
  },
  subtitle: {
    color: '#666',
    fontSize: '12px',
    margin: 0,
    textAlign: 'center'
  },
  userBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#e63946',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px 16px'
  },
  banner: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  bannerText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 6px 0'
  },
  bannerSub: {
    color: '#666',
    fontSize: '13px',
    margin: 0
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cardIcon: {
    fontSize: '32px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  cardDesc: {
    color: '#666',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.5'
  },
  cardBtn: {
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: '4px'
  },
  emergencyBox: {
    backgroundColor: '#2d1b1b',
    border: '1px solid #e63946',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center'
  },
  emergencyTitle: {
    color: '#e63946',
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 4px 0'
  },
  emergencyText: {
    color: '#aaa',
    fontSize: '13px',
    margin: 0
  }
}

export default Assist