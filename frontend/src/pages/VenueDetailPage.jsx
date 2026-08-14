import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Check, CalendarPlus, Clock } from 'lucide-react';
import { getVenueById, getVenueAvailability } from '../api/venueApi.js';
import { ErrorState } from '../components/ui/States.jsx';
import { todayLocal, withLocalPastFlags } from '../utils/date.js';
import { FALLBACK_VENUE_IMAGE } from '../utils/images.js';

const today = todayLocal;

/** Detail view backed by GET /api/venues/:id, which nothing previously consumed. */
export default function VenueDetailPage({ onBookClick }) {
  const { id } = useParams();

  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const loadVenue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setVenue(await getVenueById(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadVenue(); }, [loadVenue]);

  useEffect(() => {
    if (!venue) return;
    let cancelled = false;

    (async () => {
      setIsLoadingSlots(true);
      try {
        const data = await getVenueAvailability(id, date);
        if (!cancelled) setSlots(withLocalPastFlags(data.slots, date));
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, date, venue]);

  if (isLoading) {
    return (
      <main className="page">
        <div className="skeleton mb-6 h-72 w-full rounded-2xl" />
        <div className="skeleton mb-3 h-8 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <ErrorState title="Couldn't load this venue" message={error} onRetry={loadVenue} />
        <div className="mt-6 text-center">
          <Link to="/" className="btn-secondary">Back to venues</Link>
        </div>
      </main>
    );
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <main className="page">
      <Link to="/" className="btn-ghost btn-sm mb-4 -ml-2">
        <ArrowLeft size={15} aria-hidden="true" />
        All venues
      </Link>

      {/* Hero image */}
      <div className="relative mb-6 h-64 overflow-hidden rounded-2xl bg-ink-100 shadow-card sm:h-80">
        <img
          src={venue.imageUrl || FALLBACK_VENUE_IMAGE}
          alt={venue.name}
          onError={(e) => { e.currentTarget.src = FALLBACK_VENUE_IMAGE; }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <span className="badge-brand mb-2">{venue.sportType}</span>
          <h1 className="text-title text-white sm:text-display">{venue.name}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/85">
            <MapPin size={15} aria-hidden="true" />
            {venue.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          {venue.facilities?.length > 0 && (
            <section className="card p-5">
              <h2 className="text-heading text-ink-900">Facilities</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {venue.facilities.map((facility) => (
                  <li key={facility} className="flex items-center gap-2 text-sm text-ink-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check size={12} aria-hidden="true" />
                    </span>
                    {facility}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Availability preview */}
          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-heading text-ink-900">
                <Clock size={17} className="text-ink-400" aria-hidden="true" />
                Availability
              </h2>
              <input
                type="date"
                value={date}
                min={today()}
                onChange={(e) => setDate(e.target.value)}
                className="form-input w-auto py-1.5 text-xs"
                aria-label="Check availability for date"
              />
            </div>

            {isLoadingSlots ? (
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6" aria-busy="true">
                {Array.from({ length: 16 }, (_, i) => <div key={i} className="skeleton h-9 rounded-lg" />)}
              </div>
            ) : slots.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">Availability is unavailable for this date.</p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {slots.map((slot) => (
                    <span
                      key={slot.time}
                      title={slot.booked ? 'Booked' : slot.past ? 'Passed' : 'Available'}
                      className={`rounded-lg border px-1 py-2 text-center text-xs font-semibold ${
                        slot.available
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-ink-200 bg-ink-100 text-ink-400 line-through'
                      }`}
                    >
                      {slot.time}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-500">
                  {availableCount} of {slots.length} slots open on {date}
                </p>
              </>
            )}
          </section>
        </div>

        {/* Booking sidebar */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <p className="text-label uppercase text-ink-400">Hourly rate</p>
            <p className="mt-1">
              <span className="text-display text-brand-700">Rs. {venue.pricePerHour.toLocaleString()}</span>
              <span className="text-sm font-medium text-ink-400"> / hr</span>
            </p>

            <button onClick={() => onBookClick(venue)} className="btn-primary mt-5 w-full">
              <CalendarPlus size={16} aria-hidden="true" />
              Book this venue
            </button>

            <p className="mt-3 text-center text-xs text-ink-400">
              Open daily 06:00 – 22:00
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
