# 🚀 QUICK REFERENCE CARD

Print this and keep it nearby while developing!

---

## CSS Quick Lookup

### Colors
```
Primary (Teal):       var(--color-primary)       #0f766e
Success (Green):      var(--color-success)       #10b981
Danger (Red):         var(--color-danger)        #ef4444
Warning (Orange):     var(--color-warning)       #f59e0b
Neutral (Gray):       var(--text-secondary)      #64748b
```

### Spacing (8px grid)
```
--space-1   4px
--space-2   8px
--space-3   12px
--space-4   16px
--space-6   24px
--space-8   32px
--space-12  48px
--space-16  64px
```

### Border Radius
```
--radius-sm   4px
--radius-md   8px
--radius-lg   12px
--radius-xl   16px
--radius-full 9999px
```

### Shadows
```
--shadow-sm    Subtle (cards)
--shadow-md    Medium (hover)
--shadow-lg    Large (modals)
--shadow-xl    Very large (popovers)
```

### Typography
```
--text-xs    12px
--text-sm    14px
--text-base  16px
--text-lg    18px
--text-xl    20px
--text-2xl   24px
--text-3xl   30px
--text-4xl   36px
```

---

## Component Lookup

### Buttons
```jsx
<button className="button button-primary">Submit</button>
<button className="button button-secondary">Cancel</button>
<button className="button button-danger">Delete</button>
<button className="button button-tertiary">Link</button>

/* Sizes */
<button className="button button-sm">Small</button>
<button className="button button-lg">Large</button>

/* States */
<button disabled>Disabled</button>
<button className="button button-full">Full Width</button>
```

### Cards
```jsx
<div className="card">Basic card</div>
<div className="card card-elevated">Elevated shadow</div>
<div className="card card-interactive">Hover effect</div>
<div className="card-header">Header</div>
<div className="card-footer">Footer</div>
```

### Forms
```jsx
<label htmlFor="id">Label</label>
<input id="id" type="text" placeholder="..." />
<select>
  <option>Option 1</option>
</select>
<textarea></textarea>
<div className="field-error">Error message</div>
<div className="field-hint">Helper text</div>
```

### Layout
```jsx
<div className="container">Content</div>           /* Max 1280px */
<div className="grid grid-cols-2">...</div>       /* 2 columns */
<div className="grid grid-cols-3">...</div>       /* 3 columns */
<div className="flex flex-between">...</div>      /* Space between */
<div className="stack">...</div>                  /* Vertical stack */
```

### Typography
```jsx
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Paragraph</p>
<p className="text-muted">Muted text</p>
<p className="text-sm">Small text</p>
<strong>Bold</strong>
```

### Alerts
```jsx
<div className="alert alert-info">Info message</div>
<div className="alert alert-success">Success</div>
<div className="alert alert-warning">Warning</div>
<div className="alert alert-error">Error</div>
```

### Avatars
```jsx
<div className="avatar avatar-sm">AL</div>
<div className="avatar avatar-md">AL</div>
<div className="avatar avatar-lg">AL</div>
```

### Utilities
```
.hidden-mobile      Hide on small screens
.hidden-desktop     Hide on large screens
.truncate           Text truncation
.sr-only            Screen reader only
.text-center        Text alignment
.text-muted         Gray text
```

---

## React Hooks for Splitwise

### State Management
```jsx
const [value, setValue] = useState(initialValue);
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

### Effects
```jsx
// Form validation
useEffect(() => {
  setError(validate(formData));
}, [formData]);

// Auto-dismiss toast
useEffect(() => {
  const timer = setTimeout(() => onDismiss(), 5000);
  return () => clearTimeout(timer);
}, []);

// API call
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get('/endpoint');
      setData(res.data);
    } catch (err) {
      setError(err.message);
    }
  };
  fetchData();
}, []);
```

### Common Patterns
```jsx
// Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await api.post('/endpoint', formData);
    onSuccess(); // Show toast, navigate, etc.
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// Delete with confirmation
const [showDeleteModal, setShowDeleteModal] = useState(false);
<ConfirmModal
  title="Delete this group?"
  onConfirm={async () => {
    await api.delete(`/groups/${groupId}`);
    navigate('/');
  }}
  onCancel={() => setShowDeleteModal(false)}
  isDangerous
/>

// Copy to clipboard
const handleCopy = async (text) => {
  await navigator.clipboard.writeText(text);
  showToast('Copied!');
};
```

---

## API Patterns

### GET request
```jsx
const { data: groups } = await api.get('/groups');
```

### POST request
```jsx
await api.post('/groups', { name: 'Bali Trip' });
```

### PATCH request
```jsx
await api.patch(`/expenses/${id}`, { amount: 100 });
```

### DELETE request
```jsx
await api.delete(`/groups/${id}`);
```

### Error handling
```jsx
try {
  const res = await api.post('/endpoint', data);
  return res.data;
} catch (error) {
  // error.response.data contains backend error
  const message = error.response?.data?.message || error.message;
  setError(message);
}
```

---

## Validation Patterns

### Amount
```jsx
const validateAmount = (amount) => {
  if (!amount || parseFloat(amount) <= 0) {
    return 'Amount must be greater than RM 0.01';
  }
  return '';
};
```

### Required field
```jsx
const validateRequired = (value) => {
  return !value?.trim() ? 'This field is required' : '';
};
```

### Email
```jsx
const validateEmail = (email) => {
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Please enter a valid email'
    : '';
};
```

### Password
```jsx
const validatePassword = (pwd) => {
  if (pwd.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain uppercase letter';
  if (!/[0-9]/.test(pwd)) return 'Password must contain number';
  return '';
};
```

---

## Accessibility Checklist

### Every Page
- [ ] Form fields have `<label>`
- [ ] Buttons have clear text (not just icons)
- [ ] Links have `aria-label` if unclear
- [ ] Color contrast 4.5:1+
- [ ] Mobile: 44×44px touch targets

### Forms
- [ ] Required fields marked
- [ ] Error messages visible
- [ ] Error messages in aria-describedby
- [ ] Success feedback shown
- [ ] Mobile: Font 16px to prevent zoom

### Dynamic content
- [ ] Use `role="status"` for updates
- [ ] Use `aria-live="polite"` for toasts
- [ ] Announce errors with `role="alert"`
- [ ] Loading states announced

### Navigation
- [ ] Tab order logical
- [ ] Escape closes modals
- [ ] Enter submits forms
- [ ] Focus visible on all interactive items

---

## Git Workflow

### Commit before starting
```bash
git add .
git commit -m "WIP: Starting dashboard redesign"
```

### Commit after feature
```bash
git add .
git commit -m "feat: Add balance badge component"
```

### Push to deploy
```bash
git push
# Then deploy from vercel/render dashboard
```

### Undo changes
```bash
git status                          # See what changed
git restore filename.jsx            # Undo single file
git restore .                       # Undo all changes
```

---

## Browser DevTools Tips

### Chrome/Edge
```
F12                     Open DevTools
Ctrl+Shift+I            Open DevTools
Ctrl+Shift+M            Toggle mobile view
Ctrl+Alt+J              Open Console
```

### Testing
```
Lighthouse → Run audit
Network → Check load time
Accessibility → Check violations
Console → Check for errors
```

### Debugging
```
console.log(data)       Log to console
debugger;               Add breakpoint
document.body.style     Change styles live
```

---

## Design System File Locations

```
frontend/
├── src/
│   ├── styles/
│   │   └── design-system.css         ← Import this everywhere
│   ├── components/
│   │   ├── ComponentLibrary.jsx      ← Copy from here
│   │   ├── Toast.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.jsx             ← Update these
│   │   ├── GroupDetail.jsx           ← Update these
│   │   └── ...
│   ├── index.css                     ← Import design-system.css
│   └── main.jsx                      ← Import styles
```

---

## Common Tasks

### Add a new page
```jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get(`/endpoint/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <main className="container">
      <h1>Page Title</h1>
      {/* Content here */}
    </main>
  );
}
```

### Add form field
```jsx
<div className="form-field">
  <label htmlFor="field-name">Field Label</label>
  <input
    id="field-name"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onBlur={() => setTouched(true)}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-field-name' : 'help-field-name'}
  />
  {error && <div className="field-error" id="error-field-name">{error}</div>}
  {!error && <div className="field-hint" id="help-field-name">Helper text</div>}
</div>
```

### Show toast notification
```jsx
const [toast, setToast] = useState(null);

// Show toast
setToast({ message: 'Expense added!', type: 'success' });

// In JSX
{toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
```

### Show confirm modal
```jsx
const [showModal, setShowModal] = useState(false);

{showModal && (
  <ConfirmModal
    title="Delete this group?"
    message="This cannot be undone."
    onConfirm={handleDelete}
    onCancel={() => setShowModal(false)}
    isDangerous
  />
)}
```

---

## Debugging Checklist

### Styles not showing?
- [ ] CSS imported?
- [ ] Class name correct?
- [ ] Browser cache cleared?
- [ ] Dev server restarted?

### API failing?
- [ ] Network tab shows request?
- [ ] Status code 200?
- [ ] Response has data?
- [ ] Console shows error?

### Form not submitting?
- [ ] Button type="submit"?
- [ ] Form has onSubmit handler?
- [ ] e.preventDefault() called?
- [ ] Validation passing?

### Mobile not working?
- [ ] Viewport meta tag present?
- [ ] Media queries correct?
- [ ] Testing actual device, not just DevTools?
- [ ] Touch targets 44×44px?

---

## When Stuck

1. **Check console** → Any errors?
2. **Check network tab** → Request success?
3. **Check browser cache** → Clear and reload?
4. **Check git status** → Uncommitted changes?
5. **Test in private window** → Extensions interfering?
6. **Read error message carefully** → What does it actually say?
7. **Ask for help** → GitHub issues, StackOverflow, colleagues?

---

## Resources Always Open

- [Design System Docs](./frontend/src/styles/design-system.css)
- [Component Examples](./frontend/src/components/ComponentLibrary.jsx)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Accessibility Guide](./ACCESSIBILITY_BEST_PRACTICES.md)
- [UX Redesign Guide](./UX_REDESIGN_GUIDE.md)
- [MDN Web Docs](https://developer.mozilla.org)
- [React Docs](https://react.dev)

---

**Happy coding! 🎉**

When you complete each phase, celebrate! You're building something real.
