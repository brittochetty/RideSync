import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'

function Marketplace() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    type: 'sell',
    title: '',
    description: '',
    price: '',
    priceUnit: 'total',
    contact: '',
    images: []
  })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const res = await API.get('/assist/marketplace')
      setListings(res.data)
    } catch (err) {
      console.log('Error fetching listings:', err)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.contact) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    try {
      await API.post('/assist/create', {
        ...form,
        userName: user?.name,
        price: parseFloat(form.price)
      })
      setShowForm(false)
      setForm({
        type: 'sell',
        title: '',
        description: '',
        price: '',
        priceUnit: 'total',
        contact: '',
        images: []
      })
      fetchListings()
    } catch (err) {
      alert('Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true
    return l.type === filter
  })

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/assist')}>← Back</button>
        <h2 style={styles.title}>🛒 Marketplace</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ List'}
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>List Your Vehicle</h3>

          <div style={styles.toggleRow}>
            <button
              style={{...styles.toggleBtn, backgroundColor: form.type === 'sell' ? '#e63946' : '#1a1a2e'}}
              onClick={() => setForm({...form, type: 'sell'})}
            >
              🛒 Sell
            </button>
            <button
              style={{...styles.toggleBtn, backgroundColor: form.type === 'lease' ? '#4285F4' : '#1a1a2e'}}
              onClick={() => setForm({...form, type: 'lease'})}
            >
              📅 Lease
            </button>
          </div>

          <input
            style={styles.input}
            placeholder="Vehicle title (e.g. Honda CB300R 2022) *"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
          <textarea
            style={{...styles.input, height: '80px', resize: 'none'}}
            placeholder="Description — condition, km driven, modifications..."
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
          <input
            style={styles.input}
            placeholder="Price (₹) *"
            type="number"
            value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
          />
          <input
            style={styles.input}
            placeholder="Contact number *"
            value={form.contact}
            onChange={e => setForm({...form, contact: e.target.value})}
          />

          <label style={styles.imageLabel}>
            📷 Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>

          {form.images.length > 0 && (
            <div style={styles.imagePreview}>
              {form.images.map((img, i) => (
                <img key={i} src={img} style={styles.previewImg} alt="preview" />
              ))}
            </div>
          )}

          <button
            style={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Listing...' : '✅ Post Listing'}
          </button>
        </div>
      )}

      <div style={styles.filterRow}>
        {['all', 'sell', 'lease'].map(f => (
          <button
            key={f}
            style={{...styles.filterBtn, backgroundColor: filter === f ? '#e63946' : '#1a1a2e'}}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'sell' ? '🛒 Sell' : '📅 Lease'}
          </button>
        ))}
      </div>

      <div style={styles.listings}>
        {filteredListings.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No listings yet</p>
            <p style={styles.emptySub}>Be the first to list a vehicle!</p>
          </div>
        ) : (
          filteredListings.map(listing => (
            <div key={listing._id} style={styles.card}>
              {listing.images?.length > 0 && (
                <img src={listing.images[0]} style={styles.cardImg} alt={listing.title} />
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: listing.type === 'sell' ? '#e63946' : '#4285F4'
                  }}>
                    {listing.type === 'sell' ? '🛒 For Sale' : '📅 For Lease'}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{listing.title}</h3>
                <p style={styles.cardDesc}>{listing.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.price}>₹{listing.price?.toLocaleString()}</span>
                  <a href={`tel:${listing.contact}`} style={styles.callBtn}>
                    📞 Call
                  </a>
                </div>
                <p style={styles.seller}>Listed by {listing.userName}</p>
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
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
    border: '1px solid #2a2a4a'
  },
  formTitle: { color: 'white', fontSize: '16px', margin: 0 },
  toggleRow: { display: 'flex', gap: '8px' },
  toggleBtn: {
    flex: 1, padding: '10px', border: '1px solid #2a2a4a',
    borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
  },
  input: {
    padding: '12px', backgroundColor: '#0f0f1a', border: '1px solid #2a2a4a',
    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none'
  },
  imageLabel: {
    backgroundColor: '#0f0f1a', border: '1px dashed #2a2a4a', borderRadius: '8px',
    padding: '12px', textAlign: 'center', cursor: 'pointer', color: '#aaa', fontSize: '14px'
  },
  imagePreview: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  previewImg: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' },
  submitBtn: {
    backgroundColor: '#e63946', color: 'white', border: 'none',
    borderRadius: '8px', padding: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold'
  },
  filterRow: { display: 'flex', gap: '8px', padding: '12px 16px' },
  filterBtn: {
    padding: '6px 14px', border: '1px solid #2a2a4a', borderRadius: '20px',
    color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
  },
  listings: { padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' },
  empty: { textAlign: 'center', padding: '40px' },
  emptyText: { color: '#aaa', fontSize: '16px', margin: '0 0 8px 0' },
  emptySub: { color: '#555', fontSize: '13px', margin: 0 },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: '12px',
    border: '1px solid #2a2a4a', overflow: 'hidden'
  },
  cardImg: { width: '100%', height: '200px', objectFit: 'cover' },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop: { display: 'flex', justifyContent: 'space-between' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: 'white' },
  cardTitle: { color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0 },
  cardDesc: { color: '#666', fontSize: '13px', margin: 0 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#4caf50', fontSize: '20px', fontWeight: 'bold' },
  callBtn: {
    backgroundColor: '#4caf50', color: 'white', padding: '8px 16px',
    borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold'
  },
  seller: { color: '#555', fontSize: '11px', margin: 0 }
}

export default Marketplace