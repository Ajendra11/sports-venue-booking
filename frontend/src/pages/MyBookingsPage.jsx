import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Timer, Receipt, ArrowLeft, CalendarX } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getMyBookings, cancelBooking } from '../api/bookingApi.js';
import { BookingRowSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { todayLocal } from '../utils/date.js';

/** "2026-09-15" -> "Tue, 15 Sep 2026" */
const formatDate = (value) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
};

const isPast = (booking) => booking.date < todayLocal();

export default function MyBookingsPage({ onBookingsChanged }) {
  const { token, user } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      setBookings(await getMyBookings(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async () => {
    const booking = pendingCancel;
    try {
      await cancelBooking(token, booking._id);
      setBookings((current) => current.filter((b) => b._id !== booking._id));
      toast.success(`Booking at ${booking.venueName} cancelled — the slot is free again.`);
      onBookingsChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingCancel(null);
    }
  };

  const upcoming = bookings.filter((b) => !isPast(b));

  return (
    <main className="page max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-title text-ink-900">My bookings</h1>
          <p className="mt-1 text-sm text-ink-500">
            {user?.name ? `${user.name} · ` : ''}
            {isLoading
              ? 'Loading your reservations…'
              : `${upcoming.length} upcoming, ${bookings.length} total`}
          </p>
        </div>
        <Link to="/" className="btn-secondary">
          <ArrowLeft size={15} aria-hidden="true" />
          Browse venues
        </Link>
      </div>

      {isLoading ? (
        <BookingRowSkeleton />
      ) : error ? (
        <ErrorState title="Couldn't load your bookings" message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No bookings yet"
          description="Once you reserve a court it will show up here, along with the option to cancel."
          action={<Link to="/" className="btn-primary">Browse venues</Link>}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => {
            const past = isPast(booking);
            return (
              <article
                key={booking._id}
                className={`card p-5 transition-shadow hover:shadow-card-hover animate-fade-up ${past ? 'opacity-70' : ''}`}
                style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-heading text-ink-900">{booking.venueName}</h2>
                      {past
                        ? <span className="chip">Completed</span>
                        : <span className="badge-success">Confirmed</span>}
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div>
                        <dt className="flex items-center gap-1 text-label uppercase text-ink-400">
                          <CalendarDays size={11} aria-hidden="true" /> Date
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink-800">{formatDate(booking.date)}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-label uppercase text-ink-400">
                          <Clock size={11} aria-hidden="true" /> Slot
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink-800">
                          {booking.slot || booking.startTime}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-label uppercase text-ink-400">
                          <Timer size={11} aria-hidden="true" /> Duration
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink-800">
                          {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-label uppercase text-ink-400">
                          <Receipt size={11} aria-hidden="true" /> Total
                        </dt>
                        <dd className="mt-0.5 text-sm font-bold text-brand-700">
                          Rs. {booking.totalCost.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {!past && (
                    <button onClick={() => setPendingCancel(booking)} className="btn-danger shrink-0">
                      Cancel booking
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pendingCancel && (
        <ConfirmDialog
          title="Cancel this booking?"
          message={`Your ${pendingCancel.slot || pendingCancel.startTime} slot at ${pendingCancel.venueName} on ${formatDate(pendingCancel.date)} will be released for others to book.`}
          confirmLabel="Yes, cancel it"
          cancelLabel="Keep booking"
          onConfirm={handleCancel}
          onClose={() => setPendingCancel(null)}
        />
      )}
    </main>
  );
}
