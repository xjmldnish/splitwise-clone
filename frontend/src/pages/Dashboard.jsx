import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'

const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '?'
}

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [accountConfirmText, setAccountConfirmText] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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
    setNotice('')

    try {
      const res = await api.post('/groups', { name })
      setGroups(current => [res.data, ...current])
      setNewGroupName('')
      setNotice('Group created. Add members and expenses when you are ready.')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create this group')
    } finally {
      setCreating(false)
    }
  }

  const deleteAccount = async () => {
    if (accountConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Type DELETE MY ACCOUNT to confirm account deletion.')
      return
    }

    setDeletingAccount(true)
    setError('')
    setNotice('')

    try {
      await api.delete('/auth/me', { data: { password: accountPassword } })
      logout()
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete your account')
    } finally {
      setShowDeleteModal(false)
      setDeletingAccount(false)
    }
  }

  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0)

  return (
    <>
      {error && <Toast message={error} type="error" onDismiss={() => setError('')} />}
      {notice && <Toast message={notice} type="success" onDismiss={() => setNotice('')} />}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete your account?"
          message="This action cannot be undone. All your data will be permanently deleted."
          confirmText="Delete my account"
          cancelText="Cancel"
          isDangerous
          onConfirm={deleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    <main className="app-shell dashboard-shell">
      <header className="app-header">
        <div className="app-brand" aria-label="Splitwise dashboard">
          <span className="brand-icon" aria-hidden="true">S</span>
          <div>
            <p className="brand-mark">Splitwise</p>
            <h1>Shared money, made calm.</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="user-badge" aria-label={`Signed in as ${user?.name}`}>
            <span className="avatar avatar-small" aria-hidden="true">{getInitials(user?.name)}</span>
            <span>{user?.name}</span>
          </span>
          <button className="button button-secondary" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar" aria-label="Primary navigation">
          <a className="nav-item active" href="#groups">
            <span aria-hidden="true">#</span>
            Groups
          </a>
          <a className="nav-item" href="#new-group">
            <span aria-hidden="true">+</span>
            New group
          </a>
          <a className="nav-item" href="#account">
            <span aria-hidden="true">!</span>
            Account
          </a>
        </aside>

        <div className="workspace-main">
          <section className="hero-panel" aria-labelledby="dashboard-title">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h2 id="dashboard-title">Hi {user?.name?.split(' ')[0] || 'there'}, where are we splitting today?</h2>
              <p className="hero-copy">Create a group, add people, and let the app turn messy receipts into clear next steps.</p>
            </div>
            <div className="metric-strip" aria-label="Dashboard summary">
              <div className="metric-card">
                <span>Active groups</span>
                <strong>{groups.length}</strong>
              </div>
              <div className="metric-card">
                <span>People tracked</span>
                <strong>{totalMembers}</strong>
              </div>
            </div>
          </section>

          <section className="content-grid dashboard-grid">
            <div className="panel action-panel" id="new-group" aria-labelledby="create-group-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Quick start</p>
                  <h2 id="create-group-title">Create a group</h2>
                </div>
                <span className="panel-icon" aria-hidden="true">+</span>
              </div>
              <p className="muted">Use a name people instantly recognize, like "Melaka weekend" or "Housemates May".</p>

              <form onSubmit={createGroup} className="stack">
                <div className="field">
                  <label htmlFor="group-name">Group name</label>
                  <input
                    id="group-name"
                    type="text"
                    placeholder="Trip to Langkawi"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    aria-describedby="group-name-hint"
                    required
                  />
                  <span id="group-name-hint" className="field-hint">You can add members after creating the group.</span>
                </div>
                <button className="button button-primary button-full" disabled={creating || !newGroupName.trim()}>
                  {creating ? 'Creating group...' : 'Create group'}
                </button>
              </form>
            </div>

            <div className="panel" id="groups" aria-labelledby="groups-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Open groups</p>
                  <h2 id="groups-title">Your groups</h2>
                  <p className="muted">{groups.length} active group{groups.length === 1 ? '' : 's'}</p>
                </div>
              </div>

              {loading ? (
                <div className="skeleton-list" aria-live="polite" aria-label="Loading groups">
                  <span />
                  <span />
                  <span />
                </div>
              ) : groups.length === 0 ? (
                <div className="empty-state empty-state-rich">
                  <span className="empty-icon" aria-hidden="true">+</span>
                  <h3>Create your first group to start tracking shared expenses.</h3>
                  <p>Groups keep members, expenses, and balances together so everyone knows what happens next.</p>
                </div>
              ) : (
                <div className="list" aria-label="Groups">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      className="list-row group-row"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      <span className="avatar" aria-hidden="true">{getInitials(group.name)}</span>
                      <span className="row-body">
                        <span className="row-title">{group.name}</span>
                        <span className="row-meta">
                          {group.members.length} member{group.members.length === 1 ? '' : 's'} ready to split expenses
                        </span>
                      </span>
                      <span className="row-action" aria-hidden="true">Open</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="panel danger-zone panel-wide" id="account" aria-labelledby="account-danger-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Account controls</p>
                  <h2 id="account-danger-title">Delete account</h2>
                </div>
              </div>
              <p className="muted">
                This permanently deletes your account and removes the groups you belong to, including their members,
                expenses, balances, and settlement suggestions.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault()
                if (!accountPassword) {
                  setError('Please enter your password to confirm.')
                  return
                }
                setShowDeleteModal(true)
              }} className="danger-form">
                <div className="field">
                  <label htmlFor="delete-account-password">Confirm password</label>
                  <input
                    id="delete-account-password"
                    type="password"
                    autoComplete="current-password"
                    value={accountPassword}
                    onChange={e => setAccountPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="button button-danger"
                  disabled={deletingAccount || !accountPassword}
                >
                  {deletingAccount ? 'Deleting account...' : 'Delete account permanently'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
    </>
  )
}
