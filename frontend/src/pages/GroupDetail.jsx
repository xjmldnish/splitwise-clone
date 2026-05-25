import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const expenseCategories = ['Food', 'Travel', 'Home', 'Shopping', 'Bills', 'General']

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(Number(value) || 0)
}

const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '?'
}

const getBalanceTone = (balance) => {
  if (balance > 0) return 'positive'
  if (balance < 0) return 'negative'
  return 'neutral'
}

const getBalanceCopy = (member, balance, currentUserId) => {
  const name = member.id === currentUserId ? 'You' : member.name
  const amount = formatCurrency(Math.abs(balance))

  if (balance > 0) return `${name} should receive ${amount}`
  if (balance < 0) return `${name} owes ${amount}`
  return `${name} is settled up`
}

const simplifyDebts = (members, balances) => {
  const creditors = members
    .map(member => ({ member, amount: Number(balances[member.id] || 0) }))
    .filter(item => item.amount > 0.009)
    .sort((a, b) => b.amount - a.amount)

  const debtors = members
    .map(member => ({ member, amount: Math.abs(Number(balances[member.id] || 0)) }))
    .filter(item => item.amount > 0.009)
    .sort((a, b) => b.amount - a.amount)

  const suggestions = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0.009) {
      suggestions.push({
        id: `${debtor.member.id}-${creditor.member.id}-${amount.toFixed(2)}`,
        from: debtor.member,
        to: creditor.member,
        amount: Number(amount.toFixed(2))
      })
    }

    debtor.amount = Number((debtor.amount - amount).toFixed(2))
    creditor.amount = Number((creditor.amount - amount).toFixed(2))

    if (debtor.amount <= 0.009) debtorIndex += 1
    if (creditor.amount <= 0.009) creditorIndex += 1
  }

  return suggestions
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
  const [paidById, setPaidById] = useState('')
  const [category, setCategory] = useState(expenseCategories[0])
  const [splitWith, setSplitWith] = useState([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [deleteGroupText, setDeleteGroupText] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formTouched, setFormTouched] = useState(false)

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

      const nextMembers = found.members.map(member => member.user)
      setGroup(found)
      setMembers(nextMembers)
      setExpenses(expenseRes.data)
      setBalances(balanceRes.data)
      setPaidById(current => current || String(user?.id || nextMembers[0]?.id || ''))
      setSplitWith(current => current.length ? current : nextMembers.map(member => String(member.id)))
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load this group')
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll()
  }, [fetchAll])

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  }, [expenses])

  const selectedSplitMembers = useMemo(() => {
    const selected = new Set(splitWith)
    return members.filter(member => selected.has(String(member.id)))
  }, [members, splitWith])

  const splitPreview = useMemo(() => {
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || selectedSplitMembers.length === 0) return null
    return numericAmount / selectedSplitMembers.length
  }, [amount, selectedSplitMembers.length])

  const settlementSuggestions = useMemo(() => {
    return simplifyDebts(members, balances)
  }, [members, balances])

  const categoryTotals = useMemo(() => {
    const totals = expenseCategories.map(item => ({
      name: item,
      amount: expenses
        .filter(expense => (expense.category || 'General') === item)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    }))

    return totals.filter(item => item.amount > 0)
  }, [expenses])

  const formErrors = {
    description: formTouched && !description.trim() ? 'Add a short description people will recognize.' : '',
    amount: formTouched && (!Number.isFinite(Number(amount)) || Number(amount) <= 0) ? 'Enter an amount greater than RM0.' : '',
    split: formTouched && splitWith.length === 0 ? 'Choose at least one person to split with.' : ''
  }

  const addExpense = async (e) => {
    e.preventDefault()
    setFormTouched(true)
    const cleanDescription = description.trim()
    const numericAmount = Number(amount)

    if (!cleanDescription || !Number.isFinite(numericAmount) || numericAmount <= 0 || splitWith.length === 0) {
      setError('Check the highlighted fields before adding this expense.')
      return
    }

    setAdding(true)
    setError('')
    setNotice('')

    try {
      await api.post(`/expenses/${id}`, {
        description: cleanDescription,
        amount: numericAmount,
        category,
        paidById: Number(paidById),
        splitWith: splitWith.map(memberId => Number(memberId))
      })
      setDescription('')
      setAmount('')
      setFormTouched(false)
      setNotice('Expense added. Balances and settlement suggestions are updated.')
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
      setNotice('Member added. They are now available for future splits.')
      await fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const toggleSplitMember = (memberId) => {
    setSplitWith(current => {
      if (current.includes(memberId)) return current.filter(idValue => idValue !== memberId)
      return [...current, memberId]
    })
  }

  const deleteGroup = async (e) => {
    e.preventDefault()

    if (deleteGroupText !== group?.name) {
      setError(`Type ${group?.name} to confirm group deletion.`)
      return
    }

    setDeletingGroup(true)
    setError('')
    setNotice('')

    try {
      await api.delete(`/groups/${id}`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete this group')
    } finally {
      setDeletingGroup(false)
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <div className="loading-panel" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Loading group...
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header group-header">
        <div className="header-left">
          <button className="button button-icon" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
            ←
          </button>
          <div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <button onClick={() => navigate('/dashboard')}>Groups</button>
              <span aria-hidden="true">/</span>
              <span>{group?.name || 'Group'}</span>
            </nav>
            <h1>{group?.name || 'Group'}</h1>
          </div>
        </div>
        <div className="stat-pill">
          <span>Total spent</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
      </header>

      <section className="workspace group-workspace">
        <aside className="sidebar group-context" aria-label="Group navigation">
          <a className="nav-item active" href="#balances"><span aria-hidden="true">◎</span> Balances</a>
          <a className="nav-item" href="#expense-form"><span aria-hidden="true">＋</span> Expense</a>
          <a className="nav-item" href="#timeline"><span aria-hidden="true">≡</span> Timeline</a>
          <div className="context-card">
            <span>{members.length} members</span>
            <strong>{expenses.length} expenses</strong>
          </div>
        </aside>

        <div className="workspace-main">
          {(error || notice) && (
            <div className={`toast ${error ? 'toast-error' : 'toast-success'}`} role={error ? 'alert' : 'status'}>
              {error || notice}
            </div>
          )}

          <section className="content-grid group-grid">
            <div className="panel balance-panel" id="balances" aria-labelledby="balances-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Money map</p>
                  <h2 id="balances-title">Balances</h2>
                </div>
                <span className="panel-icon" aria-hidden="true">◎</span>
              </div>

              {members.length === 0 ? (
                <div className="empty-state empty-state-rich">
                  <h3>No members found.</h3>
                  <p>Add people to this group before recording expenses.</p>
                </div>
              ) : (
                <div className="balance-list">
                  {members.map(member => {
                    const balance = Number(balances[member.id] || 0)
                    const balanceClass = getBalanceTone(balance)

                    return (
                      <div key={member.id} className={`balance-row ${balanceClass}`}>
                        <span className="avatar" aria-hidden="true">{getInitials(member.name)}</span>
                        <span className="row-body">
                          <span className="row-title">
                            {member.name}{member.id === user.id ? ' (you)' : ''}
                          </span>
                          <span className="row-meta">{getBalanceCopy(member, balance, user.id)}</span>
                        </span>
                        <strong className={`money ${balanceClass}`}>{formatCurrency(Math.abs(balance))}</strong>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="panel settlement-panel" aria-labelledby="settlement-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Smart simplify</p>
                  <h2 id="settlement-title">Settlement suggestions</h2>
                </div>
              </div>

              {settlementSuggestions.length === 0 ? (
                <div className="empty-state">
                  Everyone is settled up. New expenses will appear here as clear payment suggestions.
                </div>
              ) : (
                <div className="settlement-list">
                  {settlementSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="settlement-row">
                      <span>
                        <strong>{suggestion.from.name}</strong> should pay <strong>{suggestion.to.name}</strong>
                      </span>
                      <strong>{formatCurrency(suggestion.amount)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel form-panel" id="expense-form" aria-labelledby="expense-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Guided input</p>
                  <h2 id="expense-title">Add expense</h2>
                </div>
                <span className="panel-icon" aria-hidden="true">＋</span>
              </div>

              <form onSubmit={addExpense} className="stack" noValidate>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="expense-description">What was it for?</label>
                    <input
                      id="expense-description"
                      type="text"
                      placeholder="Dinner at KLCC"
                      value={description}
                      onBlur={() => setFormTouched(true)}
                      onChange={e => setDescription(e.target.value)}
                      aria-invalid={Boolean(formErrors.description)}
                      aria-describedby={formErrors.description ? 'description-error' : undefined}
                      required
                    />
                    {formErrors.description && <span id="description-error" className="field-error">{formErrors.description}</span>}
                  </div>

                  <div className="field">
                    <label htmlFor="expense-amount">Amount</label>
                    <input
                      id="expense-amount"
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onBlur={() => setFormTouched(true)}
                      onChange={e => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      aria-invalid={Boolean(formErrors.amount)}
                      aria-describedby={formErrors.amount ? 'amount-error' : 'split-preview'}
                      required
                    />
                    {formErrors.amount ? (
                      <span id="amount-error" className="field-error">{formErrors.amount}</span>
                    ) : (
                      <span id="split-preview" className="field-hint">
                        {splitPreview ? `${formatCurrency(splitPreview)} each across ${selectedSplitMembers.length} people.` : 'Enter the total bill amount.'}
                      </span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="paid-by">Paid by</label>
                    <select id="paid-by" value={paidById} onChange={e => setPaidById(e.target.value)}>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name}{member.id === user.id ? ' (you)' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="expense-category">Category</label>
                    <select id="expense-category" value={category} onChange={e => setCategory(e.target.value)}>
                      {expenseCategories.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                </div>

                <fieldset className="split-field" aria-describedby={formErrors.split ? 'split-error' : 'split-help'}>
                  <legend>Split with</legend>
                  <p id="split-help" className="field-hint">Equal split is selected by default. Uncheck anyone who should not share this expense.</p>
                  <div className="check-grid">
                    {members.map(member => (
                      <label key={member.id} className="check-card">
                        <input
                          type="checkbox"
                          checked={splitWith.includes(String(member.id))}
                          onChange={() => toggleSplitMember(String(member.id))}
                        />
                        <span className="avatar avatar-small" aria-hidden="true">{getInitials(member.name)}</span>
                        <span>{member.name}{member.id === user.id ? ' (you)' : ''}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.split && <span id="split-error" className="field-error">{formErrors.split}</span>}
                </fieldset>

                <button className="button button-primary button-full" disabled={adding || members.length === 0}>
                  {adding ? 'Adding expense...' : 'Add expense and update balances'}
                </button>
              </form>
            </div>

            <div className="panel members-panel" aria-labelledby="members-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">People</p>
                  <h2 id="members-title">Members</h2>
                </div>
              </div>

              <div className="member-grid" aria-label="Group members">
                {members.map(member => (
                  <span key={member.id} className="member-chip">
                    <span className="avatar avatar-small" aria-hidden="true">{getInitials(member.name)}</span>
                    {member.name}{member.id === user.id ? ' (you)' : ''}
                  </span>
                ))}
              </div>

              <form onSubmit={addMember} className="stack member-form">
                <div className="field">
                  <label htmlFor="member-email">Invite by email</label>
                  <input
                    id="member-email"
                    type="email"
                    placeholder="friend@example.com"
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    required
                  />
                </div>
                <button className="button button-secondary button-full" disabled={addingMember || !newMemberEmail.trim()}>
                  {addingMember ? 'Adding member...' : 'Add member'}
                </button>
              </form>
            </div>

            <div className="panel analytics-panel" aria-labelledby="analytics-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Analytics</p>
                  <h2 id="analytics-title">Spending categories</h2>
                </div>
              </div>

              {categoryTotals.length === 0 ? (
                <div className="empty-state">Categories appear after the first expense.</div>
              ) : (
                <div className="category-bars">
                  {categoryTotals.map(item => {
                    const width = totalSpent ? Math.max((item.amount / totalSpent) * 100, 8) : 0
                    return (
                      <div key={item.name} className="category-row">
                        <span>{item.name}</span>
                        <div className="bar-track" aria-hidden="true">
                          <span style={{ width: `${width}%` }} />
                        </div>
                        <strong>{formatCurrency(item.amount)}</strong>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="panel danger-zone panel-wide" id="group-danger" aria-labelledby="group-danger-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Group controls</p>
                  <h2 id="group-danger-title">Delete group</h2>
                </div>
              </div>
              <p className="muted">
                This permanently deletes {group?.name || 'this group'}, including all members, expenses, balances,
                category history, and settlement suggestions.
              </p>

              <form onSubmit={deleteGroup} className="danger-form">
                <div className="field">
                  <label htmlFor="delete-group-confirm">Type {group?.name || 'the group name'} to confirm</label>
                  <input
                    id="delete-group-confirm"
                    type="text"
                    value={deleteGroupText}
                    onChange={e => setDeleteGroupText(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="button button-danger"
                  disabled={deletingGroup || deleteGroupText !== group?.name}
                >
                  {deletingGroup ? 'Deleting group...' : 'Delete group permanently'}
                </button>
              </form>
            </div>

            <div className="panel panel-wide" id="timeline" aria-labelledby="expenses-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Activity timeline</p>
                  <h2 id="expenses-title">Expense history</h2>
                  <p className="muted">{expenses.length} recorded expense{expenses.length === 1 ? '' : 's'}</p>
                </div>
              </div>

              {expenses.length === 0 ? (
                <div className="empty-state empty-state-rich">
                  <h3>No expenses yet. Add your first expense.</h3>
                  <p>Start with the latest receipt. The app will calculate balances and payment suggestions automatically.</p>
                </div>
              ) : (
                <div className="timeline-list">
                  {expenses.map(expense => (
                    <article key={expense.id} className="timeline-item">
                      <span className="avatar avatar-muted" aria-hidden="true">{(expense.category || 'General').slice(0, 2).toUpperCase()}</span>
                      <div>
                        <div className="timeline-title">
                          <h3>{expense.description}</h3>
                          <strong>{formatCurrency(expense.amount)}</strong>
                        </div>
                        <p>
                          Paid by {expense.paidBy.name} · {expense.category || 'General'} · {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
