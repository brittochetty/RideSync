import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await API.post('/auth/register', { name, email, password })
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
          <p style={styles.tagline}>Create your account</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1
            }}
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Already have an account?</span>
        </div>

        <Link to="/login" style={styles.loginLink}>
          Login Instead
        </Link>

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
  logoIcon: {
    fontSize: '48px',
    marginBottom: '8px'
  },
  logoText: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  tagline: {
    color: '#888',
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
    fontWeight: '500',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #2a2a4a',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#0f0f1a',
    color: '#ffffff',
    transition: 'border 0.2s'
  },
  button: {
    padding: '14px',
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '8px',
    letterSpacing: '0.5px'
  },
  divider: {
    textAlign: 'center',
    margin: '24px 0 16px'
  },
  dividerText: {
    color: '#555',
    fontSize: '13px'
  },
  loginLink: {
    display: 'block',
    textAlign: 'center',
    padding: '12px',
    border: '1px solid #2a2a4a',
    borderRadius: '10px',
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '14px'
  }
}

export default Register