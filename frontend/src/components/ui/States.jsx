import { AlertTriangle, RefreshCw } from 'lucide-react';

/** Card-shaped placeholder matching VenueCard's dimensions. */
export function VenueCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-between border-t border-ink-100 pt-4">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function VenueGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading venues">
      {Array.from({ length: count }, (_, i) => <VenueCardSkeleton key={i} />)}
    </div>
  );
}

export function BookingRowSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading bookings">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-5">
          <div className="skeleton mb-4 h-5 w-1/3" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, j) => <div key={j} className="skeleton h-10" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Neutral "nothing here" state with an optional call to action. */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center animate-fade-up">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-heading text-ink-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Failure state with a retry affordance. */
export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center border-red-200 px-6 py-12 text-center animate-fade-up">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle size={26} aria-hidden="true" />
      </div>
      <h3 className="text-heading text-ink-900">{title}</h3>
      {message && <p className="mt-2 text-sm text-ink-500">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-6">
          <RefreshCw size={16} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
