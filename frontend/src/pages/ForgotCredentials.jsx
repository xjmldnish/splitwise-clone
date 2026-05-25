import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ForgotCredentials() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.')
      return
    }

    if (password !== confirmPassword) {
      setError('The two password fields do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/recover', { email, password })
      setNotice(res.data.message)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update your credentials right now')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="recover-title">
        <span className="brand-icon" aria-hidden="true">S</span>
        <p className="brand-mark">Account recovery</p>
        <h1 id="recover-title">Forgot username or password?</h1>
        <p className="auth-copy">Your login username is your email address. Enter it below to set a new password.</p>

        {error && <p className="alert alert-error" role="alert">{error}</p>}
        {notice && <p className="alert alert-success" role="status">{notice}</p>}

        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="recover-email">Email address</label>
            <input
              id="recover-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <span className="field-hint">Use the email you registered with.</span>
          </div>

          <div className="field">
            <label htmlFor="recover-password">New password</label>
            <input
              id="recover-password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength="8"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="recover-confirm-password">Confirm new password</label>
            <input
              id="recover-confirm-password"
              type="password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              minLength="8"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="button button-primary" disabled={loading || !email.trim() || !password || !confirmPassword}>
            {loading ? 'Updating password...' : 'Update password'}
          </button>
        </form>

        <p className="auth-switch">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  )
}
