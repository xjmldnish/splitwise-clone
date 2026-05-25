import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const fetchGroups = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true)

    try {
      const res = await api.get('/groups')
      setGroups(res.data)
      setError('')
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout()
        return
      }
      setError(err.response?.data?.error || 'Unable to load your groups')
    } finally {
      setLoading(false)
    }
  }, [handleLogout])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups()
  }, [fetchGroups])

  const createGroup = async (e) => {
    e.preventDefault()
    const name = newGroupName.trim()
    if (!name) return

    setCreating(true)
    setError('')

    try {
      const res = await api.post('/groups', { name })
      setGroups(current => [res.data, ...current])
      setNewGroupName('')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create this group')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand-mark">Splitwise</p>
          <h1>Groups</h1>
        </div>
        <div className="topbar-actions">
          <span className="welcome-text">Hi, {user?.name}</span>
          <button className="button button-secondary" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <section className="content-grid dashboard-grid">
        <div className="panel" aria-labelledby="create-group-title">
          <h2 id="create-group-title">Create a Group</h2>
          <p className="muted">Use a clear name so members recognize what the expenses are for.</p>

          {error && <p className="alert alert-error" role="alert">{error}</p>}

          <form onSubmit={createGroup} className="inline-form">
            <div className="field">
              <label htmlFor="group-name">Group name</label>
              <input
                id="group-name"
                type="text"
                placeholder="Trip to Langkawi"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                required
              />
            </div>
            <button className="button button-primary" disabled={creating || !newGroupName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        <div className="panel" aria-labelledby="groups-title">
          <div className="section-heading">
            <div>
              <h2 id="groups-title">Your Groups</h2>
              <p className="muted">{groups.length} active group{groups.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state" aria-live="polite">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="empty-state">No groups yet. Create one to start tracking shared expenses.</p>
          ) : (
            <div className="list" aria-label="Groups">
              {groups.map(group => (
                <button
                  key={group.id}
                  className="list-row group-row"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <span className="avatar" aria-hidden="true">{group.name.slice(0, 1).toUpperCase()}</span>
                  <span>
                    <span className="row-title">{group.name}</span>
                    <span className="row-meta">
                      {group.members.length} member{group.members.length === 1 ? '' : 's'}
                    </span>
                  </span>
                  <span className="row-action" aria-hidden="true">Open</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
