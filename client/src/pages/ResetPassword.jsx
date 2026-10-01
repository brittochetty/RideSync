import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../utils/api'

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) {
      setError('Passwords do not match!')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!')
      return
    }

    setLoading(true)

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>🏍️</div>
          <h1 style={styles.logoText}>RideSync</h1>
          <p style={styles.tagline}>Set new password</p>
        </div>

        {message && (
          <div style={styles.successBox}>
            ✅ {message}
            <p style={styles.redirectText}>Redirecting to login...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button
              style={{...styles.button, opacity: loading ? 0.7 : 1}}
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    padding: '16px'
  },
  card: {
    backgroundColor: '#1a1a2e',
    padding: '40px 36px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #2a2a4a',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logoIcon: { fontSize: '48px', marginBottom: '8px' },
  logoText: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  tagline: { color: '#888', fontSize: '14px', margin: 0 },
  successBox: {
    backgroundColor: '#1b2e1b',
    border: '1px solid #4caf50',
    color: '#4caf50',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  redirectText: {
    color: '#4caf50',
    fontSize: '12px',
    margin: '8px 0 0 0'
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#aaa',
    fontSize: '13px',
    fontWeight: '500'
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
  button: {
    padding: '14px',
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default ResetPassword