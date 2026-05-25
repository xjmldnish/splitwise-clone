/**
 * COMPONENT LIBRARY EXAMPLES
 * 
 * Production-ready React components that implement HCI best practices
 * and the modern design system.
 */

/* ========== 1. BALANCE BADGE COMPONENT ========== */

/**
 * Shows balance status clearly and contextually
 * 
 * @example
 * <BalanceBadge 
 *   type="you-receive" 
 *   amount={120.50}
 *   label="Ali owes you"
 *   size="lg"
 * />
 */
export function BalanceBadge({ type, amount, label, size = 'md' }) {
  const colors = {
    'you-receive': { bg: '#ecfdf5', text: '#065f46', icon: '✓' },
    'you-owe': { bg: '#fef2f2', text: '#7f1d1d', icon: '!' },
    'settled': { bg: '#f3f4f6', text: '#374151', icon: '✓' }
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const config = colors[type];

  return (
    <div
      className={`balance-badge ${sizeClasses[size]}`}
      style={{
        background: config.bg,
        color: config.text,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontWeight: 'var(--font-weight-semibold)'
      }}
    >
      <span>{config.icon}</span>
      <span>{label}</span>
      <strong>RM {amount.toFixed(2)}</strong>
    </div>
  );
}

/* ========== 2. PERSONAL BALANCE COMPONENT ========== */

/**
 * Shows your balance in a group with breakdown
 * Reduces cognitive load by using human-readable text
 * 
 * @example
 * <PersonalBalance
 *   userId={currentUser.id}
 *   members={[{ id: 1, name: 'Ali' }, ...]}
 *   balances={{ 1: 60, 2: -80 }}
 * />
 */
export function PersonalBalance({ userId, members, balances }) {
  const userBalance = balances[userId] || 0;

  if (Math.abs(userBalance) < 0.01) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Your Balance</h3>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-title">You're all settled up!</div>
          <p>No outstanding balances. New expenses will appear here.</p>
        </div>
      </div>
    );
  }

  const membersInBalance = members
    .map(m => ({
      ...m,
      balance: balances[m.id] || 0
    }))
    .filter(m => Math.abs(m.balance) > 0.01);

  const isPositive = userBalance > 0;
  const actionText = isPositive 
    ? `You should receive RM ${Math.abs(userBalance).toFixed(2)}`
    : `You owe RM ${Math.abs(userBalance).toFixed(2)}`;

  return (
    <div className="card card-elevated">
      <div className="card-header">
        <h3>Your Balance in This Group</h3>
      </div>

      <BalanceBadge
        type={isPositive ? 'you-receive' : 'you-owe'}
        amount={Math.abs(userBalance)}
        label={isPositive ? 'You should receive' : 'You owe'}
        size="lg"
      />

      <div style={{ marginTop: 'var(--space-6)' }}>
        <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
          Breakdown:
        </h4>
        <div className="stack">
          {membersInBalance.map(member => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: `4px solid ${member.balance > 0 ? 'var(--color-success)' : 'var(--color-danger)'}`
              }}
            >
              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {member.name}
              </span>
              <strong style={{
                color: member.balance > 0 ? 'var(--color-success)' : 'var(--color-danger)'
              }}>
                {member.balance > 0 ? '+' : '-'} RM {Math.abs(member.balance).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer" style={{ marginTop: 'var(--space-6)' }}>
        <button className="button button-primary">
          {isPositive ? 'Request Payment' : 'Send Payment'}
        </button>
        <button className="button button-secondary">
          Share Info
        </button>
      </div>
    </div>
  );
}

/* ========== 3. SETTLEMENT SUGGESTION COMPONENT ========== */

/**
 * Shows smart debt simplification
 * Clear, actionable, easy to understand
 */
export function SettlementSuggestion({ from, to, amount, onMarkPaid, onCopy }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const text = `${from.name} should pay ${to.name} RM ${amount.toFixed(2)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card card-interactive">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div className="avatar avatar-md">{from.name[0]}</div>
        <span>should pay</span>
        <div className="avatar avatar-md">{to.name[0]}</div>
        <strong style={{ marginLeft: 'auto', fontSize: 'var(--text-lg)' }}>
          RM {amount.toFixed(2)}
        </strong>
      </div>

      <p style={{ margin: 'var(--space-3) 0' }}>
        {from.name} owes {to.name} <strong>RM {amount.toFixed(2)}</strong>
      </p>

      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        flexWrap: 'wrap'
      }}>
        <button className="button button-primary button-sm" onClick={onMarkPaid}>
          Mark Paid
        </button>
        <button 
          className={`button button-sm ${copied ? 'button-success' : 'button-secondary'}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button className="button button-secondary button-sm">
          Send Reminder
        </button>
      </div>
    </div>
  );
}

/* ========== 4. EXPENSE FORM COMPONENT ========== */

/**
 * Better form UX with:
 * - Clear field order
 * - Real-time validation
 * - Helper text
 * - Smart defaults
 * - Visual feedback
 */
export function AddExpenseForm({ members, onSubmit, isSubmitting }) {
  const [form, setForm] = React.useState({
    description: '',
    amount: '',
    paidBy: members[0]?.id || '',
    category: 'Food',
    splitWith: members.map(m => m.id)
  });

  const [touched, setTouched] = React.useState({});

  const errors = {
    description: touched.description && !form.description.trim() 
      ? 'Please describe the expense' 
      : '',
    amount: touched.amount && (
      !form.amount || parseFloat(form.amount) <= 0 
        ? 'Amount must be greater than 0' 
        : ''
    ),
    splitWith: touched.splitWith && form.splitWith.length === 0 
      ? 'Select at least one person' 
      : ''
  };

  const splitAmount = form.amount && form.splitWith.length 
    ? (parseFloat(form.amount) / form.splitWith.length).toFixed(2)
    : '0.00';

  const isValid = form.description.trim() && 
                 form.amount && 
                 parseFloat(form.amount) > 0 && 
                 form.splitWith.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <h3>Add Expense</h3>
        <p>Record what was spent and who paid.</p>
      </div>

      <div className="stack">
        {/* Description Field */}
        <div className="form-field">
          <label htmlFor="expense-desc">What was it for?</label>
          <input
            id="expense-desc"
            type="text"
            placeholder="Dinner at KLCC, groceries, etc."
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            onBlur={() => setTouched({...touched, description: true})}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'desc-error' : 'desc-hint'}
          />
          {errors.description && (
            <div className="field-error" id="desc-error">{errors.description}</div>
          )}
          {!errors.description && (
            <div className="field-hint" id="desc-hint">
              Be specific so everyone remembers what this was for
            </div>
          )}
        </div>

        {/* Amount Field */}
        <div className="form-field">
          <label htmlFor="expense-amount">Amount (RM)</label>
          <input
            id="expense-amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({...form, amount: e.target.value})}
            onBlur={() => setTouched({...touched, amount: true})}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
          />
          {errors.amount && (
            <div className="field-error" id="amount-error">{errors.amount}</div>
          )}
          {!errors.amount && form.splitWith.length > 0 && (
            <div className="field-hint" id="amount-hint">
              Split: <strong>RM {splitAmount}</strong> each across {form.splitWith.length} people
            </div>
          )}
        </div>

        {/* Paid By Field */}
        <div className="form-field">
          <label htmlFor="paid-by">Paid By</label>
          <select
            id="paid-by"
            value={form.paidBy}
            onChange={(e) => setForm({...form, paidBy: parseInt(e.target.value)})}
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} (you)
              </option>
            ))}
          </select>
        </div>

        {/* Category Field */}
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({...form, category: e.target.value})}
          >
            {['Food', 'Travel', 'Home', 'Shopping', 'Bills', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Split Selection */}
        <div className="form-field">
          <label>Split Equally Between</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-3)'
          }}>
            {members.map(member => (
              <label
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--color-neutral-300)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <input
                  type="checkbox"
                  checked={form.splitWith.includes(member.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({...form, splitWith: [...form.splitWith, member.id]});
                    } else {
                      setForm({...form, splitWith: form.splitWith.filter(id => id !== member.id)});
                    }
                  }}
                />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {member.name}
                </span>
              </label>
            ))}
          </div>
          {errors.splitWith && (
            <div className="field-error" style={{ marginTop: 'var(--space-2)' }}>
              {errors.splitWith}
            </div>
          )}
        </div>
      </div>

      <div className="card-footer" style={{ marginTop: 'var(--space-6)' }}>
        <button 
          type="submit" 
          className="button button-primary button-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Adding expense...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}

/* ========== 5. LOADING SKELETON COMPONENT ========== */

/**
 * Shimmer loading state for better perceived performance
 */
export function ExpenseSkeleton({ count = 3 }) {
  return (
    <div className="stack">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-neutral-200)'
          }}
        >
          <div 
            className="skeleton"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1 }}>
            <div 
              className="skeleton"
              style={{
                height: '16px',
                width: '60%',
                marginBottom: 'var(--space-2)',
                borderRadius: 'var(--radius-md)'
              }}
            />
            <div 
              className="skeleton"
              style={{
                height: '14px',
                width: '80%',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== 6. EMPTY STATE COMPONENT ========== */

/**
 * Meaningful empty states with guidance
 * Reduces user anxiety
 */
export function EmptyExpenses() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📝</div>
      <div className="empty-state-title">No expenses yet</div>
      <p className="empty-state-text">
        Add your first expense to get started tracking shared costs
        and calculating who owes whom.
      </p>
      <button className="button button-primary">
        Add Your First Expense
      </button>
    </div>
  );
}

export function EmptyGroups() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">👥</div>
      <div className="empty-state-title">Create your first group</div>
      <p className="empty-state-text">
        Groups keep members, expenses, and balances together.
        Create one to start splitting shared expenses.
      </p>
      <button className="button button-primary">
        Create a Group
      </button>
    </div>
  );
}

/* ========== 7. TOAST NOTIFICATION COMPONENT ========== */

/**
 * Accessible toast notifications with auto-dismiss
 */
export function Toast({ 
  message, 
  type = 'info', 
  onDismiss, 
  duration = 5000 
}) {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '!'
  };

  return (
    <div 
      className={`toast alert alert-${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-lg)' }}>{icons[type]}</span>
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="button button-icon button-tertiary button-sm"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

/* ========== 8. BETTER BALANCE CARD ========== */

/**
 * Quick view card for group balances
 * Shows clear money direction and amounts
 */
export function BalanceCard({ member, balance, currentUserId }) {
  const isCurrentUser = member.id === currentUserId;
  const isPositive = balance > 0;
  const icon = isPositive ? '✓' : isCurrentUser ? '→' : '←';
  
  const getLabel = () => {
    if (Math.abs(balance) < 0.01) return 'Settled up';
    if (isPositive) return `${member.name} owes you`;
    if (isCurrentUser) return `You owe`;
    return `You owe ${member.name}`;
  };

  return (
    <div className="card card-interactive">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="avatar avatar-md">{member.name[0]}</div>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              {isCurrentUser ? 'You' : member.name}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {getLabel()}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-bold)',
          color: Math.abs(balance) < 0.01 ? 'var(--text-secondary)' : isPositive ? 'var(--color-success)' : 'var(--color-danger)'
        }}>
          RM {Math.abs(balance).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

/* ========== EXPORT ALL COMPONENTS ========== */

export default {
  BalanceBadge,
  PersonalBalance,
  SettlementSuggestion,
  AddExpenseForm,
  ExpenseSkeleton,
  EmptyExpenses,
  EmptyGroups,
  Toast,
  BalanceCard
};
