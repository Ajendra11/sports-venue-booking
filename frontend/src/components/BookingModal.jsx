import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { getVenueAvailability } from '../api/venueApi.js';
import { todayLocal, addDays, withLocalPastFlags } from '../utils/date.js';

const today = todayLocal;

export default function BookingModal({ venue, onClose, onBookSuccess, isAuthenticated }) {
  const navigate = useNavigate();
  const venueId = venue._id || venue.id;

  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);

  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Reload the slot grid whenever the chosen date changes
  const loadAvailability = useCallback(async () => {
    setIsLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await getVenueAvailability(venueId, date);
      // Recompute "past" against the viewer's clock, not the server's
      setSlots(withLocalPastFlags(data.slots, date));
    } catch (err) {
      setSlotsError(err.message);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [venueId, date]);

  useEffect(() => {
    loadAvailability();
    setStartTime('');
  }, [loadAvailability]);

  /**
   * A selected start time is only valid if every hour it would occupy is
   * still free — this mirrors the server's overlap rule so the UI can't
   * offer a combination the API will reject.
   */
  const slotsNeeded = useMemo(() => {
    if (!startTime) return [];
    const startHour = parseInt(startTime, 10);
    return Array.from({ length: duration }, (_, i) => `${String(startHour + i).padStart(2, '0')}:00`);
  }, [startTime, duration]);

  const availableTimes = useMemo(
    () => new Set(slots.filter((s) => s.available).map((s) => s.time)),
    [slots]
  );

  const durationFits = slotsNeeded.length > 0 && slotsNeeded.every((s) => availableTimes.has(s));

  // Longest run of free hours from the chosen start, capped at 5
  const maxDuration = useMemo(() => {
    if (!startTime) return 5;
    const startHour = parseInt(startTime, 10);
    let count = 0;
    for (let i = 0; i < 5; i += 1) {
      const slot = `${String(startHour + i).padStart(2, '0')}:00`;
      if (!availableTimes.has(slot)) break;
      count += 1;
    }
    return Math.max(count, 1);
  }, [startTime, availableTimes]);

  useEffect(() => {
    if (duration > maxDuration) setDuration(maxDuration);
  }, [maxDuration, duration]);

  const totalCost = venue.pricePerHour * duration;
  const availableCount = slots.filter((s) => s.available).length;

  // Nothing free because the day is over reads very differently from
  // nothing free because every slot is taken.
  const allSlotsPassed = slots.length > 0 && slots.every((s) => s.past);

  const jumpToNextDay = () => setDate(addDays(date, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: '/' } });
      return;
    }

    if (!startTime) {
      setFormError('Please choose an available time slot.');
      return;
    }

    if (!durationFits) {
      setFormError(`A ${duration}-hour booking from ${startTime} overlaps a slot that is already taken.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onBookSuccess({ venueId, date, startTime, duration });
      // Parent closes the modal on success
    } catch (err) {
      setFormError(err.message);
      // Someone else may have taken the slot — refresh the grid
      loadAvailability();
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotClasses = (slot) => {
    const isSelected = startTime === slot.time;
    const isCovered = slotsNeeded.includes(slot.time) && durationFits;

    if (isSelected) return 'border-brand-600 bg-brand-600 text-white shadow-sm';
    if (isCovered) return 'border-brand-300 bg-brand-100 text-brand-800';
    if (!slot.available) {
      return 'cursor-not-allowed border-ink-200 bg-ink-100 text-ink-400 line-through';
    }
    return 'border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700';
  };

  return (
    <Modal
      title={`Book ${venue.name}`}
      subtitle={`Rs. ${venue.pricePerHour.toLocaleString()} / hour · ${venue.location}`}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-5">
        {/* Date */}
        <div>
          <label htmlFor="booking-date" className="form-label">Select date</label>
          <input
            id="booking-date"
            type="date"
            value={date}
            min={today()}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Slot grid */}
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="form-label mb-0">Time slot</span>
            {!isLoadingSlots && !slotsError && (
              <span className="text-xs font-medium text-ink-400">
                {availableCount} of {slots.length} available
              </span>
            )}
          </div>

          {isLoadingSlots ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true">
              {Array.from({ length: 16 }, (_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : slotsError ? (
            <div className="form-error flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} aria-hidden="true" />
                {slotsError}
              </span>
              <button type="button" onClick={loadAvailability} className="btn-secondary btn-sm">Retry</button>
            </div>
          ) : availableCount === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-amber-800">
                {allSlotsPassed ? "Today's slots have all passed" : 'Fully booked on this date'}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {allSlotsPassed
                  ? 'Bookings run 06:00–22:00. Try tomorrow instead.'
                  : 'Every slot is taken. Try another date to find an opening.'}
              </p>
              <button type="button" onClick={jumpToNextDay} className="btn-secondary btn-sm mt-3">
                Check {allSlotsPassed ? 'tomorrow' : 'the next day'}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Available time slots">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    aria-pressed={startTime === slot.time}
                    title={slot.booked ? 'Already booked' : slot.past ? 'Time has passed' : `Book at ${slot.time}`}
                    onClick={() => { setStartTime(slot.time); setFormError(null); }}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all duration-150 ${slotClasses(slot)}`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-ink-200 bg-white" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-ink-200 bg-ink-100" /> Booked / passed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-brand-600" /> Selected
                </span>
              </div>
            </>
          )}
        </div>

        {/* Duration */}
        <div className="mt-5">
          <label htmlFor="booking-duration" className="form-label">Duration</label>
          <select
            id="booking-duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={!startTime}
            className="form-input disabled:cursor-not-allowed disabled:opacity-60"
          >
            {Array.from({ length: maxDuration }, (_, i) => i + 1).map((hr) => (
              <option key={hr} value={hr}>{hr} {hr === 1 ? 'hour' : 'hours'}</option>
            ))}
          </select>
          {startTime && maxDuration < 5 && (
            <p className="mt-1.5 text-xs text-ink-400">
              Limited to {maxDuration} {maxDuration === 1 ? 'hour' : 'hours'} — the next slot is already booked.
            </p>
          )}
        </div>

        {/* Cost */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-brand-900">Total cost</p>
            {startTime && (
              <p className="mt-0.5 text-xs text-brand-700">
                {startTime}–{String(parseInt(startTime, 10) + duration).padStart(2, '0')}:00 · {duration} {duration === 1 ? 'hour' : 'hours'}
              </p>
            )}
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-brand-700">
            Rs. {totalCost.toLocaleString()}
          </span>
        </div>

        {formError && <div className="form-error mt-4">{formError}</div>}

        {!isAuthenticated && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You'll need to sign in to confirm this booking.
          </p>
        )}

        <div className="mt-5 flex gap-3 border-t border-ink-100 pt-5">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting || (isAuthenticated && !startTime)} className="btn-primary flex-1">
            {isSubmitting
              ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Booking…</>
              : isAuthenticated
                ? <><Check size={16} aria-hidden="true" /> Confirm booking</>
                : 'Sign in to book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
