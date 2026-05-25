import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(Number(value) || 0)
}

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
  const [notice, setNotice] = useState('')

  const fetchAll = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true)

    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        api.get('/groups'),
        api.get(`/expenses/${id}`),
        api.get(`/expenses/${id}/balances`)
      ])
      const found = groupRes.data.find(g => g.id === Number(id))

      if (!found) {
        setError('Group not found or you no longer have access')
        setGroup(null)
        setMembers([])
        return
      }

      setGroup(found)
      setMembers(found.members.map(member => member.user))
      setExpenses(expenseRes.data)
      setBalances(balanceRes.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load this group')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll()
  }, [fetchAll])

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  }, [expenses])

  const addExpense = async (e) => {
    e.preventDefault()
    const cleanDescription = description.trim()
    const numericAmount = Number(amount)

    if (!cleanDescription || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter an expense description and an amount greater than 0')
      return
    }

    setAdding(true)
    setError('')
    setNotice('')

    try {
      await api.post(`/expenses/${id}`, {
        description: cleanDescription,
        amount: numericAmount,
        splitWith: members.map(member => member.id)
      })
      setDescription('')
      setAmount('')
      setNotice('Expense added')
      await fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense')
    } finally {
      setAdding(false)
    }
  }

  const addMember = async (e) => {
    e.preventDefault()
    const email = newMemberEmail.trim()
    if (!email) return

    setAddingMember(true)
    setError('')
    setNotice('')

    try {
      await api.post(`/groups/${id}/members`, { email })
      setNewMemberEmail('')
      setNotice('Member added')
      await fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <p className="empty-state" aria-live="polite">Loading group...</p>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="button button-secondary" onClick={() => navigate('/dashboard')}>
          Back
        </button>
        <div className="topbar-title">
          <p className="brand-mark">Splitwise</p>
          <h1>{group?.name || 'Group'}</h1>
        </div>
        <div className="stat-pill">
          <span>Total spent</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
      </header>

      <section className="content-grid group-grid">
        <div className="panel" aria-labelledby="balances-title">
          <h2 id="balances-title">Balances</h2>
          <p className="muted">Positive means the member should receive money. Negative means they owe.</p>

          {error && <p className="alert alert-error" role="alert">{error}</p>}
          {notice && <p className="alert alert-success" role="status">{notice}</p>}

          {members.length === 0 ? (
            <p className="empty-state">No members found.</p>
          ) : (
            <div className="list">
              {members.map(member => {
                const balance = Number(balances[member.id] || 0)
                const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'

                return (
                  <div key={member.id} className="list-row">
                    <span className="avatar" aria-hidden="true">{member.name.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <span className="row-title">
                        {member.name}{member.id === user.id ? ' (you)' : ''}
                      </span>
                      <span className="row-meta">{member.email}</span>
                    </span>
                    <strong className={`money ${balanceClass}`}>{formatCurrency(balance)}</strong>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="panel" aria-labelledby="expense-title">
          <h2 id="expense-title">Add Expense</h2>
          <p className="muted">Expenses are split equally across all current members.</p>

          <form onSubmit={addExpense} className="stack">
            <div className="field">
              <label htmlFor="expense-description">Description</label>
              <input
                id="expense-description"
                type="text"
                placeholder="Dinner"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="expense-amount">Amount</label>
              <input
                id="expense-amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <button className="button button-primary" disabled={adding || members.length === 0}>
              {adding ? 'Adding...' : 'Add expense'}
            </button>
          </form>
        </div>

        <div className="panel" aria-labelledby="members-title">
          <h2 id="members-title">Members</h2>

          <div className="chip-list" aria-label="Group members">
            {members.map(member => (
              <span key={member.id} className="chip">
                {member.name}{member.id === user.id ? ' (you)' : ''}
              </span>
            ))}
          </div>

          <form onSubmit={addMember} className="inline-form">
            <div className="field">
              <label htmlFor="member-email">Add member by email</label>
              <input
                id="member-email"
                type="email"
                placeholder="friend@example.com"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                required
              />
            </div>
            <button className="button button-primary" disabled={addingMember || !newMemberEmail.trim()}>
              {addingMember ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        <div className="panel panel-wide" aria-labelledby="expenses-title">
          <div className="section-heading">
            <div>
              <h2 id="expenses-title">Expenses</h2>
              <p className="muted">{expenses.length} recorded expense{expenses.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <p className="empty-state">No expenses yet. Add the first shared cost above.</p>
          ) : (
            <div className="list">
              {expenses.map(expense => (
                <div key={expense.id} className="list-row expense-row">
                  <span className="avatar avatar-muted" aria-hidden="true">RM</span>
                  <span>
                    <span className="row-title">{expense.description}</span>
                    <span className="row-meta">
                      Paid by {expense.paidBy.name} on {new Date(expense.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <strong className="money neutral">{formatCurrency(expense.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
