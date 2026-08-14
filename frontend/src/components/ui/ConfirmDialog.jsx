import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';

/**
 * In-app replacement for window.confirm — keeps destructive actions
 * inside the app's own design language and supports async work.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep it',
  onConfirm,
  onClose,
}) {
  const [isWorking, setIsWorking] = useState(false);

  const handleConfirm = async () => {
    setIsWorking(true);
    try {
      await onConfirm();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} size="sm">
      <div className="p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <p className="pt-1.5 text-sm leading-relaxed text-ink-600">{message}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={isWorking} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button type="button" onClick={handleConfirm} disabled={isWorking} className="btn-danger flex-1">
            {isWorking && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isWorking ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
