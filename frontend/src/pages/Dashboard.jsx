import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups')
      setGroups(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    setCreating(true)
    try {
      await api.post('/groups', { name: newGroupName })
      setNewGroupName('')
      fetchGroups()
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>💰 Splitwise</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Create Group */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create a New Group</h2>
          <form onSubmit={createGroup} style={styles.form}>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Trip to Langkawi"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              required
            />
            <button style={styles.button} disabled={creating}>
              {creating ? 'Creating...' : '+ Create Group'}
            </button>
          </form>
        </div>

        {/* Groups List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Your Groups</h2>
          {loading ? (
            <p style={styles.muted}>Loading...</p>
          ) : groups.length === 0 ? (
            <p style={styles.muted}>No groups yet. Create one above!</p>
          ) : (
            groups.map(group => (
              <div
                key={group.id}
                style={styles.groupCard}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div style={styles.groupIcon}>👥</div>
                <div>
                  <div style={styles.groupName}>{group.name}</div>
                  <div style={styles.groupMeta}>
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={styles.arrow}>→</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  navbar: {
    background: 'white',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  logo: { color: '#1cc29f', fontSize: '22px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#666', fontSize: '14px' },
  logoutBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666'
  },
  content: { maxWidth: '600px', margin: '32px auto', padding: '0 16px' },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  cardTitle: { fontSize: '18px', marginBottom: '16px', color: '#333' },
  form: { display: 'flex', gap: '10px' },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px'
  },
  button: {
    padding: '10px 18px',
    background: '#1cc29f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  groupCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #eee',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  groupIcon: { fontSize: '24px' },
  groupName: { fontWeight: '600', fontSize: '15px' },
  groupMeta: { fontSize: '13px', color: '#888', marginTop: '2px' },
  arrow: { marginLeft: 'auto', color: '#bbb', fontSize: '18px' },
  muted: { color: '#888', fontSize: '14px' }
}