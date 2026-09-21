import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'

function Mechanic() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mechanics, setMechanics] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceUnit: 'per visit',
    contact: '',
    location: { address: '' }
  })

  useEffect(() => {
    fetchMechanics()
  }, [])

  const fetchMechanics = async () => {
    try {
      const res = await API.get('/assist/mechanics')
      setMechanics(res.data)
    } catch (err) {
      console.log('Error:', err)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.contact) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    try {
      await API.post('/assist/create', {
        ...form,
        type: 'mechanic',
        userName: user?.name,
        price: parseFloat(form.price) || 0
      })
      setShowForm(false)
      fetchMechanics()
    } catch (err) {
      alert('Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/assist')}>← Back</button>
        <h2 style={styles.title}>🔧 Find a Mechanic</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ Register'}
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Register as Mechanic</h3>
          <input style={styles.input} placeholder="Your name / Shop name *"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea style={{...styles.input, height: '80px', resize: 'none'}}
            placeholder="Services offered, specialization..."
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input style={styles.input} placeholder="Charge per visit (₹)"
            type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input style={styles.input} placeholder="Your area / address"
            value={form.location.address}
            onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} />
          <input style={styles.input} placeholder="Contact number *"
            value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Registering...' : '✅ Register as Mechanic'}
          </button>
        </div>
      )}

      <div style={styles.info}>
        <p style={styles.infoText}>🔧 {mechanics.length} mechanics available</p>
      </div>

      <div style={styles.listings}>
        {mechanics.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No mechanics registered yet</p>
            <p style={styles.emptySub}>Are you a mechanic? Register above!</p>
          </div>
        ) : (
          mechanics.map(m => (
            <div key={m._id} style={styles.card}>
              <div style={styles.cardIcon}>🔧</div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{m.title}</h3>
                <p style={styles.cardDesc}>{m.description}</p>
                {m.location?.address && (
                  <p style={styles.address}>📍 {m.location.address}</p>
                )}
                <div style={styles.cardFooter}>
                  {m.price > 0 && (
                    <span style={styles.price}>₹{m.price} per visit</span>
                  )}
                  <a href={`tel:${m.contact}`} style={styles.callBtn}>📞 Call Now</a>
                </div>
                <p style={styles.seller}>Registered by {m.userName}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f0f1a', color: '#fff' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px', backgroundColor: '#1a1a2e', borderBottom: '1px solid #2a2a4a'
  },
  backBtn: {
    backgroundColor: 'transparent', border: '1px solid #2a2a4a',
    color: '#aaa', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
  },
  title: { color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 },
  addBtn: {
    backgroundColor: '#e63946', color: 'white', border: 'none',
    borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
  },
  form: {
    backgroundColor: '#1a1a2e', margin: '16px', borderRadius: '12px',
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #2a2a4a'
  },
  formTitle: { color: 'white', fontSize: '16px', margin: 0 },
  input: {
    padding: '12px', backgroundColor: '#0f0f1a', border: '1px solid #2a2a4a',
    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none'
  },
  submitBtn: {
    backgroundColor: '#e63946', color: 'white', border: 'none',
    borderRadius: '8px', padding: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold'
  },
  info: { padding: '12px 16px', borderBottom: '1px solid #2a2a4a' },
  infoText: { color: '#666', fontSize: '13px', margin: 0 },
  listings: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' },
  empty: { textAlign: 'center', padding: '40px' },
  emptyText: { color: '#aaa', fontSize: '16px', margin: '0 0 8px 0' },
  emptySub: { color: '#555', fontSize: '13px', margin: 0 },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px solid #2a2a4a',
    padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start'
  },
  cardIcon: { fontSize: '32px' },
  cardBody: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  cardTitle: { color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0 },
  cardDesc: { color: '#666', fontSize: '13px', margin: 0 },
  address: { color: '#4285F4', fontSize: '12px', margin: 0 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#4caf50', fontSize: '14px', fontWeight: 'bold' },
  callBtn: {
    backgroundColor: '#4caf50', color: 'white', padding: '6px 14px',
    borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold'
  },
  seller: { color: '#555', fontSize: '11px', margin: 0 }
}

export default Mechanic