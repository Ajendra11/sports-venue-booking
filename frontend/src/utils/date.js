/**
 * Date helpers that work in the user's local timezone.
 *
 * `new Date().toISOString()` yields a UTC calendar date, which is a different
 * day from the user's for most of the world at some point in every 24 hours.
 * Booking dates are local calendar days, so they must be derived locally.
 */

/** "2026-08-14" for the given (or current) date, in local time. */
export const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Today's local calendar date as "YYYY-MM-DD". */
export const todayLocal = () => toLocalDateString();

/** Shift a "YYYY-MM-DD" string by whole days, staying in local time. */
export const addDays = (dateString, days) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
};

/** Current local hour, 0-23. */
export const currentHourLocal = () => new Date().getHours();

/**
 * Re-derive slot availability against the viewer's clock.
 *
 * The API flags `past` using the server's timezone (UTC on Render), which
 * would grey out the wrong slots for anyone not on UTC. `booked` is
 * authoritative and comes from the database; `past` is recomputed here.
 */
export const withLocalPastFlags = (slots, date) => {
  const isToday = date === todayLocal();
  const hour = currentHourLocal();

  return slots.map((slot) => {
    const past = isToday && parseInt(slot.time, 10) <= hour;
    return { ...slot, past, available: !slot.booked && !past };
  });
};
