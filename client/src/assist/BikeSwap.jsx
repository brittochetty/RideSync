import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'

function BikeSwap() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [swaps, setSwaps] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceUnit: 'per day',
    contact: '',
    location: { address: '' }
  })

  useEffect(() => {
    fetchSwaps()
  }, [])

  const fetchSwaps = async () => {
    try {
      const res = await API.get('/assist/swaps')
      setSwaps(res.data)
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
        type: 'swap',
        userName: user?.name,
        price: parseFloat(form.price) || 0
      })
      setShowForm(false)
      fetchSwaps()
    } catch (err) {
      alert('Failed to list bike')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/assist')}>← Back</button>
        <h2 style={styles.title}>🏍️ Bike Swap</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ List Bike'}
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>List Your Bike for Swap</h3>
          <input style={styles.input} placeholder="Bike name (e.g. Royal Enfield 350) *"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea style={{...styles.input, height: '80px', resize: 'none'}}
            placeholder="Condition, year, any notes..."
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input style={styles.input} placeholder="Charge per day (₹)"
            type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input style={styles.input} placeholder="Your current location / area"
            value={form.location.address}
            onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} />
          <input style={styles.input} placeholder="Contact number *"
            value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Listing...' : '✅ List for Swap'}
          </button>
        </div>
      )}

      <div style={styles.info}>
        <p style={styles.infoText}>🏍️ {swaps.length} bikes available for swap</p>
      </div>

      <div style={styles.listings}>
        {swaps.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No bikes listed yet</p>
            <p style={styles.emptySub}>Have a spare bike? List it above!</p>
          </div>
        ) : (
          swaps.map(swap => (
            <div key={swap._id} style={styles.card}>
              <div style={styles.cardIcon}>🏍️</div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{swap.title}</h3>
                <p style={styles.cardDesc}>{swap.description}</p>
                {swap.location?.address && (
                  <p style={styles.address}>📍 {swap.location.address}</p>
                )}
                <div style={styles.cardFooter}>
                  {swap.price > 0 && (
                    <span style={styles.price}>₹{swap.price}/day</span>
                  )}
                  <a href={`tel:${swap.contact}`} style={styles.callBtn}>📞 Contact</a>
                </div>
                <p style={styles.seller}>Listed by {swap.userName}</p>
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
    backgroundColor: '#4285F4', color: 'white', border: 'none',
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
    backgroundColor: '#4285F4', color: 'white', border: 'none',
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
    backgroundColor: '#4285F4', color: 'white', padding: '6px 14px',
    borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold'
  },
  seller: { color: '#555', fontSize: '11px', margin: 0 }
}

export default BikeSwap