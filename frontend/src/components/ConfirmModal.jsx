import { useEffect } from 'react'

export default function ConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDangerous = false }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onConfirm()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, onConfirm])

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title" className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            className="button button-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`button ${isDangerous ? 'button-danger' : 'button-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
