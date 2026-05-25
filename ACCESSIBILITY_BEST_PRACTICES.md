# ♿ ACCESSIBILITY & UX BEST PRACTICES

## WCAG 2.1 AA Compliance Checklist

### Color Contrast
```
Minimum 4.5:1 for normal text
Minimum 3:1 for large text (18px+)

✓ GOOD: Black (#0f172a) on white (#ffffff) = 17:1
✗ BAD: Gray (#94a3b8) on white = 3.8:1

Tool: WebAIM Contrast Checker
```

**Compliance Check:**
```css
/* ✓ All primary text uses var(--text-primary) on var(--bg-primary) */
body {
  color: var(--text-primary);      /* #0f172a */
  background: var(--bg-primary);   /* #ffffff */
  /* Contrast: 17:1 ✓ */
}

/* ✗ DO NOT USE */
color: var(--color-neutral-400);   /* Gray on white = 3.8:1 ✗ */
```

### Focus Management

**Requirements:**
- Every interactive element must be keyboard accessible
- Focus indicator must be visible (not outline: none)
- Focus order must match visual order

```jsx
// ✓ Good: Focus ring included
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// ✗ Bad: Focus hidden
button:focus {
  outline: none;  /* DON'T DO THIS */
}
```

**Testing:**
```
1. Open app in browser
2. Press Tab repeatedly
3. Visible indicator should follow focus
4. Order should be logical (left-to-right, top-to-bottom)
5. Escape should close modals
6. Enter should submit forms
```

### Semantic HTML

**Form Example:**
```jsx
// ✓ Good: Semantic, accessible
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-help"
  />
  <span id="email-help">We'll never share your email</span>
</form>

// ✗ Bad: Not semantic
<div className="form">
  <div className="input-label">Email Address</div>
  <div className="input"></div>
</div>
```

**Navigation Example:**
```jsx
// ✓ Good: Semantic nav
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/groups">Groups</a></li>
  </ul>
</nav>

// ✗ Bad: Not semantic
<div className="navigation">
  <div class="nav-item">Dashboard</div>
  <div class="nav-item">Groups</div>
</div>
```

### ARIA Labels

**When to use:**
```jsx
// Icon-only button - needs aria-label
<button aria-label="Open user menu">
  <MenuIcon />
</button>

// Status updates - needs aria-live
<div role="status" aria-live="polite">
  {isLoading && 'Loading...'}
</div>

// Error states - needs aria-invalid
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-msg' : undefined}
/>
<span id="error-msg" className="field-error">{error}</span>

// Form fields - needs proper labels
<label htmlFor="amount">Amount (RM)</label>
<input id="amount" type="number" />
```

**DO NOT USE:**
```jsx
// ✗ aria-label where visible text exists
<button aria-label="Submit">
  Add Expense  {/* Visual text is better */}
</button>

// ✗ aria-label on elements that don't need them
<h2 aria-label="Recent Groups">
  Recent Groups  {/* Text already visible */}
</h2>
```

### Touch Targets

**Minimum size: 44×44 pixels**

```css
/* ✓ Good: Meets minimum */
button {
  min-height: 44px;
  padding: 12px 16px;
}

/* ✗ Bad: Too small */
button {
  height: 30px;  /* Difficult to tap */
  padding: 8px;
}
```

**Spacing between targets:**
```css
/* ✓ Good: 8px minimum spacing */
button + button {
  margin-left: var(--space-2);  /* 8px */
}

/* ✗ Bad: No spacing */
button + button {
  margin-left: 0;  /* Too close */
}
```

### Screen Reader Testing

**With NVDA (free, Windows):**
```
1. Download NVDA from nvaccess.org
2. Start NVDA
3. Reload your app
4. Listen for announcements
5. All content should be readable
6. Form labels should be announced
7. Errors should be announced
```

**With VoiceOver (Mac):**
```
1. Cmd + F5 to enable VoiceOver
2. Reload your app
3. Listen for announcements
4. Use VO + arrow keys to navigate
5. All content should be accessible
```

**What screen readers should announce:**
```
Form inputs:
"Email address input text required"

Buttons:
"Submit button"

Links:
"View group details link"

Alerts:
"Error, amount must be greater than zero"

Tables:
"Group name column header | Members column header"
"Bali Trip row one | 5 members"
```

---

## HCI Best Practices

### 1. Mental Models

**Problem:** Users have existing mental models of money apps

**Solution:** Match expectations
```jsx
// Users expect to see their balance prominently
// ✓ Show your balance first
<PersonalBalance userId={currentUser.id} />

// ✓ Show money direction clearly
"You owe RM 120"  /* Not just "Balance: -120" */

// ✓ Show who you owe
"To: Ali RM 60, Zara RM 60"  /* Not just raw numbers */
```

### 2. Progressive Disclosure

**Rule: Show important → Hide details behind clicks**

```jsx
// Dashboard: Show groups only
<Groups />

// Group page: Show balances & expenses
<Balances />
<Expenses />

// On demand: Show analytics
<AnalyticsButton onClick={() => setShowAnalytics(true)} />

// Details on click: Show expense breakdown
<ExpenseDetail onClick={() => setExpanded(true)} />
```

### 3. Consistent Patterns

**Example: Balance display pattern**
```
[Name] [Action] [Amount]

"Ali owes you RM 60"
"You owe Zara RM 80"
"Settled up"
```

**Example: Form pattern**
```
Description → Amount → Category → Split → Submit
```

**Example: Navigation pattern**
```
[Logo] [Primary Actions] [User Menu]
```

### 4. Error Prevention

**Best practices:**
```jsx
// ✓ Validate as you type
<input
  onChange={(e) => {
    setValue(e.target.value);
    setError(validate(e.target.value));
  }}
/>

// ✓ Disable submit if invalid
<button disabled={!isFormValid}>
  Submit
</button>

// ✓ Confirm destructive actions
<ConfirmModal
  isDangerous
  title="Delete this group?"
  onConfirm={deleteGroup}
/>

// ✓ Clear error messages
// ✗ "Error" ← Unhelpful
// ✓ "Amount must be greater than RM 0.01" ← Clear action

// ✓ Default safe values
// Don't default to "Delete" in confirm dialogs
// Default to "Cancel" button focused
```

### 5. Feedback

**Every action needs feedback:**
```jsx
// Pending action
<button disabled={isLoading}>
  {isLoading ? 'Adding...' : 'Add Expense'}
</button>

// Success feedback
<Toast message="Expense added successfully" type="success" />

// Error feedback
<Toast message="Failed to add expense" type="error" />

// Loading state
<LoadingState message="Loading your groups..." />

// Confirmation
// Show the result of the action visually
```

### 6. Scannability

**Users scan, they don't read. Make important info scannable:**

```jsx
// ✓ Good: Clear hierarchy
<h1>Balance</h1>           {/* Large, bold */}
<p>You owe RM 120</p>     {/* Clear action */}

// ✗ Bad: Wall of text
<p>Your balance in this group is RM 120 which means you owe...</p>

// ✓ Good: Visual distinction
<BalanceBadge type="you-owe" amount={120} />  {/* Red, prominent */}

// ✗ Bad: Same styling as everything else
<p>Balance: -120</p>
```

### 7. Cognitive Load

**Ask: Can a new user do this without help?**

```
Task: Add an expense

❌ Hard path (lots of decisions):
- Choose "Add" from menu
- Fill amount, description, category
- Choose who paid
- Choose who it's split between
- Choose split amounts (equal/custom)
- Review totals
- Submit

✅ Easy path (smart defaults):
- Click "Add Expense"
- Type description (required)
- Type amount (required)
- Everyone pays equally (default)
- Submit

Difference: Smart defaults reduce choices from 6 to 2
```

---

## Mobile-First Design Checklist

### Viewport Setup
```html
<!-- In index.html -->
<meta name="viewport" 
      content="width=device-width, initial-scale=1, 
               viewport-fit=cover" />
```

### Touch-Friendly Design
```css
/* Minimum tap target: 44×44px */
button, a, input {
  min-height: 44px;
  min-width: 44px;
}

/* No tiny fonts (auto-zoom on iOS) */
input {
  font-size: 16px;  /* Not 14px or smaller */
}

/* Sufficient spacing */
button + button {
  margin: var(--space-3);  /* Not touching */
}
```

### Responsive Text
```css
/* Use clamp() for fluid sizing */
h1 {
  font-size: clamp(24px, 5vw, 36px);
  /* Small screen: 24px */
  /* Medium screen: scales */
  /* Large screen: 36px max */
}
```

### Avoid Mobile Pitfalls
```jsx
// ✗ Don't: Hover-only interactions
<div onMouseEnter={() => showMenu()} />

// ✓ Do: Click/tap accessible
<button onClick={() => toggleMenu()} />

// ✗ Don't: Assume landscape view
<div style={{ width: '100vh' }} />  /* Wrong dimension */

// ✓ Do: Mobile-first layout
<div className="stack">  {/* Vertical by default */}
  {/* Changes to grid only on larger screens */}
</div>

// ✗ Don't: Fixed widths
<div style={{ width: '1200px' }} />

// ✓ Do: Fluid, max-width
<div className="container">  {/* max-width: 1280px */}
  {/* Full width on small, capped on large */}
</div>
```

### Mobile Testing Checklist
```
Device types:
□ iPhone SE (375px)
□ iPhone 14 (390px)
□ iPad Air (820px)
□ iPad Pro (1024px)

Portrait + Landscape:
□ Portrait at all sizes
□ Landscape at all sizes

Orientation changes:
□ Rotate device
□ Layout should adapt smoothly
□ No cut-off content

Touch interactions:
□ Can tap all buttons (44×44px min)
□ Spacing sufficient (8px min)
□ No accidental triggers

Forms on mobile:
□ Can see input without zooming
□ Keyboard doesn't cover submit button
□ Mobile keyboard appears correctly
□ Input feels natural on mobile

Performance:
□ Loads fast on 4G
□ Scrolling smooth
□ No layout shifts
□ Images optimized
```

---

## Error Message Best Practices

### Bad Error Messages
```
✗ "Error"
✗ "Invalid input"
✗ "Please check your fields"
✗ "Something went wrong"
✗ "Server error 400"
```

### Good Error Messages
```
✓ "Amount must be greater than RM 0.01"
✓ "Password must be at least 8 characters"
✓ "Email address already registered"
✓ "Group name is required"
✓ "At least one person must be selected"
```

### Error Message Formula
```
[What's wrong?] + [Why is it wrong?] + [How to fix it?]

Example:
"Email already registered" + 
"This email is already being used" +
"Try logging in instead" 

→ "Email already registered. 
   Try logging in instead."
```

---

## Performance Guidelines

### Web Vitals Targets
```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### Image Optimization
```jsx
// ✗ Bad
<img src="avatar.png" />  {/* Large file, wrong size */}

// ✓ Good
<img 
  src="avatar-48.webp" 
  width="48" 
  height="48"
  alt="User avatar"
/>
```

### Bundle Optimization
```
Check bundle size:
npm run build
Check bundle/dist folder

Target: < 200KB
Good: < 150KB
Excellent: < 100KB
```

---

## Copy & Microcopy Best Practices

### Tone
- **Professional, but friendly**
- **Clear, not clever**
- **Action-oriented**
- **Empathetic to frustration**

### Examples

**Empty state:**
```
❌ "No data"

✅ "Ready to split?
   Add an expense from your group to automatically 
   calculate who owes whom."
```

**Form help:**
```
❌ "Group name"

✅ "Group name
   Use something everyone will recognize
   (e.g., 'Bali Trip', 'House Rent')"
```

**Button labels:**
```
❌ "Submit", "OK", "Proceed"

✅ "Add Expense", "Create Group", "Request Payment"
```

**Success messages:**
```
❌ "Success"

✅ "Expense added! Balances updated."
```

**Error messages:**
```
❌ "Validation failed"

✅ "Email address already registered. 
   Try logging in instead."
```

---

## Design System Enforcement

### CSS Variables (Enforce in code review)
```css
/* ✓ Use CSS variables */
color: var(--text-primary);
background: var(--color-primary);
padding: var(--space-4);

/* ✗ Hardcoded values */
color: #0f172a;
background: #0f766e;
padding: 16px;
```

### Color Palette (Don't deviate)
```
Allowed colors: Use design-system.css
Don't invent new colors
If color needed: Add to design-system.css

Example issue:
❌ "I need a purple button"
→ Solution: Discuss why, add to design system
```

### Spacing (Use grid)
```
Allowed: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
Don't use: 5px, 10px, 13px, 18px, 22px
```

---

## Testing Checklist Before Launch

### Functionality
- [ ] All forms submit correctly
- [ ] All links navigate correctly
- [ ] All buttons trigger correct actions
- [ ] Validations work
- [ ] Error handling works

### Accessibility
- [ ] Color contrast 4.5:1+ (WebAIM checker)
- [ ] All form fields have labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus visible on all interactive elements
- [ ] Screen reader reads everything

### Mobile
- [ ] Works on 375px width (iPhone SE)
- [ ] Touch targets 44×44px+
- [ ] No horizontal scroll
- [ ] Forms don't require zoom
- [ ] Images load properly

### Performance
- [ ] Page loads in <2s
- [ ] Images optimized
- [ ] No console errors
- [ ] Smooth scrolling
- [ ] Buttons respond quickly

### Cross-browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (including iOS Safari)

---

## Resources

### Tools
- **WebAIM Contrast Checker**: webaim.org/resources/contrastchecker/
- **WAVE Accessibility Tool**: wave.webaim.org
- **Google Lighthouse**: Built into Chrome DevTools
- **NVDA Screen Reader**: nvaccess.org (Windows)
- **VoiceOver**: Built into macOS

### Learning
- **W3C WCAG 2.1**: w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility**: developer.mozilla.org/en-US/docs/Web/Accessibility
- **Inclusive Components**: inclusive-components.design
- **Smashing Magazine Articles**: smashingmagazine.com/tag/accessibility

### Design Inspiration
- **Stripe**: stripe.com (Design, copywriting)
- **Linear**: linear.app (Clean, modern UI)
- **Notion**: notion.so (Clarity, simplicity)
- **Figma**: figma.com (UX patterns)

---

## Questions to Ask During Design Review

1. **Can a new user complete this without asking for help?**
2. **Is the error message clear enough to understand AND fix?**
3. **Could this be misunderstood or misused?**
4. **Is important information easily scannable?**
5. **Does this work on mobile without zooming?**
6. **Can someone navigate this with keyboard only?**
7. **Would a screen reader user understand this?**
8. **Is the emotional tone appropriate?**
9. **Have we provided feedback for every action?**
10. **Does this match our design system?**

---

**Remember: Accessibility isn't an afterthought—it's a core feature.**

Your users include people with:
- Color blindness (8% of men, 0.5% of women)
- Visual impairments (requires zooming)
- Hearing impairments (need captions)
- Motor disabilities (require keyboard navigation)
- Cognitive differences (need clear language)

Building for accessibility makes your product better for everyone. ♿✨
