import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Shared modal shell — one backdrop, header and escape/scroll behaviour
 * for every dialog in the app.
 */
export default function Modal({ title, subtitle, onClose, children, size = 'md' }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    // Prevent the page behind the modal from scrolling
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`modal-panel ${widths[size]}`}>
        <div className="modal-header">
          <div className="min-w-0">
            <h3 className="text-heading text-ink-900">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
