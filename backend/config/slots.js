// Canonical hourly slot definition shared by the availability endpoint,
// booking validation and the seed script.
export const OPENING_HOUR = 6;   // 06:00
export const CLOSING_HOUR = 22;  // 22:00 (last slot starts at 21:00)

/** "06:00", "07:00", ... "21:00" — every bookable start time. */
export const ALL_SLOTS = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, i) => `${String(OPENING_HOUR + i).padStart(2, '0')}:00`
);

/** "10:00" -> 10 */
export const slotToHour = (slot) => parseInt(String(slot).split(':')[0], 10);

/** 10 -> "10:00" */
export const hourToSlot = (hour) => `${String(hour).padStart(2, '0')}:00`;

/**
 * Every hourly slot a booking occupies.
 * ("10:00", 2) -> ["10:00", "11:00"]
 * Returns null when the request falls outside opening hours.
 */
export const expandSlots = (startTime, duration) => {
  const start = slotToHour(startTime);
  const hours = Number(duration);

  if (!ALL_SLOTS.includes(startTime)) return null;
  if (!Number.isInteger(hours) || hours < 1) return null;
  if (start + hours > CLOSING_HOUR) return null;

  return Array.from({ length: hours }, (_, i) => hourToSlot(start + i));
};

/** Human-readable range for display: ("10:00", 2) -> "10:00 - 12:00" */
export const formatSlotRange = (startTime, duration) =>
  `${startTime} - ${hourToSlot(slotToHour(startTime) + Number(duration))}`;
