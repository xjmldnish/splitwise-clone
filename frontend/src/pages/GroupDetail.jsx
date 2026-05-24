import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState({})
  const [members, setMembers] = useState([])

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        api.get('/groups'),
        api.get(`/expenses/${id}`),
        api.get(`/expenses/${id}/balances`)
      ])
      const found = groupRes.data.find(g => g.id === parseInt(id))
      setGroup(found)
      setMembers(found?.members.map(m => m.user) || [])
      setExpenses(expenseRes.data)
      setBalances(balanceRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (e) => {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      const splitWith = members.map(m => m.id)
      await api.post(`/expenses/${id}`, {
        description,
        amount: parseFloat(amount),
        splitWith
      })
      setDescription('')
      setAmount('')
      fetchAll()
    } catch (err) {
      setError('Failed to add expense')
    } finally {
      setAdding(false)
    }
  }

  const addMember = async (e) => {
    e.preventDefault()
    setAddingMember(true)
    try {
      await api.post(`/groups/${id}/members`, { email: newMemberEmail })
      setNewMemberEmail('')
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1 style={styles.logo}>💰 {group?.name}</h1>
        <div style={{ width: 80 }} />
      </div>

      <div style={styles.content}>
        {error && <p style={styles.error}>{error}</p>}

        {/* Balances */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💳 Balances</h2>
          {Object.keys(balances).length === 0 ? (
            <p style={styles.muted}>No expenses yet</p>
          ) : (
            members.map(member => {
              const balance = balances[member.id] || 0
              const isPositive = balance > 0
              const isZero = balance === 0
              return (
                <div key={member.id} style={styles.balanceRow}>
                  <span style={styles.memberName}>
                    {member.name} {member.id === user.id ? '(you)' : ''}
                  </span>
                  <span style={{
                    ...styles.balanceAmount,
                    color: isZero ? '#888' : isPositive ? '#1cc29f' : '#e74c3c'
                  }}>
                    {isPositive ? '+' : ''}RM{balance.toFixed(2)}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Add Expense */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>➕ Add Expense</h2>
          <p style={styles.muted} >Split equally among all {members.length} members</p>
          <form onSubmit={addExpense} style={styles.expenseForm}>
            <input
              style={styles.input}
              type="text"
              placeholder="Description (e.g. Dinner)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Amount (RM)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
            <button style={styles.button} disabled={adding}>
              {adding ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>

        {/* Add Member */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👥 Members</h2>
          <div style={styles.membersList}>
            {members.map(member => (
              <div key={member.id} style={styles.memberChip}>
                {member.name} {member.id === user.id ? '(you)' : ''}
              </div>
            ))}
          </div>
          <form onSubmit={addMember} style={styles.form}>
            <input
              style={styles.input}
              type="email"
              placeholder="Add member by email"
              value={newMemberEmail}
              onChange={e => setNewMemberEmail(e.target.value)}
              required
            />
            <button style={styles.button} disabled={addingMember}>
              {addingMember ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🧾 Expenses</h2>
          {expenses.length === 0 ? (
            <p style={styles.muted}>No expenses yet</p>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} style={styles.expenseCard}>
                <div style={styles.expenseIcon}>🍽️</div>
                <div style={styles.expenseInfo}>
                  <div style={styles.expenseDesc}>{expense.description}</div>
                  <div style={styles.expenseMeta}>
                    Paid by {expense.paidBy.name} •{' '}
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.expenseAmount}>
                  RM{expense.amount.toFixed(2)}
                </div>
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
  loading: { padding: '40px', textAlign: 'center', color: '#888' },
  navbar: {
    background: 'white',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  logo: { color: '#1cc29f', fontSize: '20px' },
  backBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    color: '#666',
    width: 80
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
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  memberName: { fontSize: '15px', color: '#333' },
  balanceAmount: { fontWeight: '700', fontSize: '16px' },
  expenseForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  form: { display: 'flex', gap: '10px', marginTop: '12px' },
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
  membersList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  memberChip: {
    padding: '6px 12px',
    background: '#f0fdf9',
    border: '1px solid #1cc29f',
    borderRadius: '100px',
    fontSize: '13px',
    color: '#1cc29f'
  },
  expenseCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  expenseIcon: { fontSize: '24px' },
  expenseInfo: { flex: 1 },
  expenseDesc: { fontWeight: '600', fontSize: '15px' },
  expenseMeta: { fontSize: '12px', color: '#888', marginTop: '2px' },
  expenseAmount: { fontWeight: '700', fontSize: '16px', color: '#333' },
  error: {
    color: '#e74c3c',
    background: '#fdf0ed',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '14px'
  },
  muted: { color: '#888', fontSize: '14px', marginBottom: '12px' }
}