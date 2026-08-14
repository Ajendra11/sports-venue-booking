import { useCallback, useEffect, useState } from 'react';
import { Search, CalendarX, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import { getAllBookings, adminCancelBooking } from '../../api/adminApi.js';
import { getVenues } from '../../api/venueApi.js';
import { EmptyState, ErrorState } from '../../components/ui/States.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { todayLocal } from '../../utils/date.js';

const formatDate = (value) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState('');
  const [scope, setScope] = useState('all');

  useEffect(() => {
    getVenues().then(setVenues).catch(() => setVenues([]));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllBookings(token, {
        ...(search.trim() && { search: search.trim() }),
        ...(venueId && { venueId }),
        ...(date && { date }),
        ...(scope !== 'all' && { scope }),
      });
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, search, venueId, date, scope]);

  // Debounce so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCancel = async () => {
    const booking = toCancel;
    try {
      await adminCancelBooking(token, booking._id);
      setBookings((cur) => cur.filter((b) => b._id !== booking._id));
      toast.success(`Cancelled ${booking.venueName} on ${booking.date} for ${booking.user?.name || 'user'}.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToCancel(null);
    }
  };

  const clearFilters = () => {
    setSearch(''); setVenueId(''); setDate(''); setScope('all');
  };

  const hasFilters = search || venueId || date || scope !== 'all';
  const today = todayLocal();

  return (
    <div className="space-y-5">
      {/* Filters — one row above the data */}
      <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <label htmlFor="ab-search" className="form-label">Search</label>
          <Search size={15} className="pointer-events-none absolute left-3.5 top-[2.15rem] text-ink-400" aria-hidden="true" />
          <input
            id="ab-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Venue, name or email…"
            className="form-input pl-9"
          />
        </div>
        <div>
          <label htmlFor="ab-venue" className="form-label">Venue</label>
          <select id="ab-venue" value={venueId} onChange={(e) => setVenueId(e.target.value)} className="form-input">
            <option value="">All venues</option>
            {venues.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ab-date" className="form-label">Date</label>
          <input id="ab-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
        </div>
        <div>
          <label htmlFor="ab-scope" className="form-label">Period</label>
          <select id="ab-scope" value={scope} onChange={(e) => setScope(e.target.value)} className="form-input">
            <option value="all">All time</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {isLoading ? 'Loading…' : `${bookings.length} booking${bookings.length === 1 ? '' : 's'}`}
        </p>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost btn-sm">
            <RotateCcw size={13} aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card p-5" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton mb-3 h-14" />)}
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load bookings" message={error} onRetry={load} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={hasFilters ? 'No bookings match these filters' : 'No bookings yet'}
          description={hasFilters ? 'Try widening the date range or clearing the search.' : 'Bookings made by users will appear here.'}
          action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : null}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Venue</th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Booked by</th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Date</th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Slot</th>
                  <th scope="col" className="px-4 py-3 text-right text-label uppercase text-ink-400">Total</th>
                  <th scope="col" className="px-4 py-3 text-right text-label uppercase text-ink-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {bookings.map((b) => (
                  <tr key={b._id} className={`transition-colors hover:bg-ink-50/60 ${b.date < today ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-ink-900">{b.venueName}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink-800">{b.user?.name || '—'}</p>
                      <p className="text-xs text-ink-400">{b.user?.email || 'user removed'}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {formatDate(b.date)}
                      {b.date < today && <span className="ml-2 chip !py-0.5 !text-[10px]">Past</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-600">{b.slot || b.startTime}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-brand-700">
                      Rs. {b.totalCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setToCancel(b)}
                        className="btn-danger btn-sm"
                        aria-label={`Cancel booking at ${b.venueName} on ${b.date}`}
                      >
                        <X size={13} /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-ink-100 md:hidden">
            {bookings.map((b) => (
              <li key={b._id} className={`p-4 ${b.date < today ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{b.venueName}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {b.user?.name || '—'} · {b.user?.email || 'user removed'}
                    </p>
                    <p className="mt-1 text-xs text-ink-600">
                      {formatDate(b.date)} · {b.slot || b.startTime}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-brand-700">Rs. {b.totalCost.toLocaleString()}</span>
                </div>
                <button onClick={() => setToCancel(b)} className="btn-danger btn-sm mt-3 w-full">
                  <X size={13} /> Cancel booking
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {toCancel && (
        <ConfirmDialog
          title="Cancel this booking?"
          message={`${toCancel.user?.name || 'This user'}'s ${toCancel.slot || toCancel.startTime} slot at ${toCancel.venueName} on ${formatDate(toCancel.date)} will be released. They will not be notified automatically.`}
          confirmLabel="Cancel booking"
          cancelLabel="Keep it"
          onConfirm={handleCancel}
          onClose={() => setToCancel(null)}
        />
      )}
    </div>
  );
}
