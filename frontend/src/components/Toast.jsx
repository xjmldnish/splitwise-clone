import { useEffect, useRef } from 'react'

export default function Toast({ message, type = 'success', onDismiss, duration = 5000 }) {
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (duration) {
      timeoutRef.current = setTimeout(onDismiss, duration)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [duration, onDismiss])

  return (
    <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'} aria-live="polite">
      <div className="toast-content">
        <span className="toast-icon" aria-hidden="true">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <p>{message}</p>
      </div>
      <button
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
