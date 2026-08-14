import crypto from 'crypto';
import './env.js';

/**
 * Optional admin signup code.
 *
 * When ADMIN_SIGNUP_CODE is set, registration accepts an `adminCode` field and
 * creates the account as an admin if it matches. When it is unset the feature
 * is off entirely and no value will ever be accepted — so a misconfigured
 * deployment fails closed rather than open.
 */
const RAW_CODE = process.env.ADMIN_SIGNUP_CODE || '';

const MIN_LENGTH = 12;

if (RAW_CODE && RAW_CODE.length < MIN_LENGTH) {
  console.error(
    `✗ Error: ADMIN_SIGNUP_CODE must be at least ${MIN_LENGTH} characters — a short code is guessable.`
  );
  process.exit(1);
}

export const isAdminCodeEnabled = () => RAW_CODE.length > 0;

/** Constant-time comparison, so response timing can't leak the code. */
const matches = (candidate) => {
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(RAW_CODE);
  // timingSafeEqual throws on length mismatch, so equalise first
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b); // keep the work constant
    return false;
  }
  return crypto.timingSafeEqual(a, b);
};

// --- Brute-force throttle -------------------------------------------------
// A secret that can be guessed an unlimited number of times isn't a secret.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map(); // ip -> { count, firstAt }

const prune = (now) => {
  for (const [ip, rec] of attempts) {
    if (now - rec.firstAt > WINDOW_MS) attempts.delete(ip);
  }
};

export const isThrottled = (ip) => {
  const now = Date.now();
  prune(now);
  const rec = attempts.get(ip);
  return Boolean(rec && rec.count >= MAX_ATTEMPTS);
};

const recordFailure = (ip) => {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
  } else {
    rec.count += 1;
  }
};

/**
 * @returns {'disabled'|'valid'|'invalid'|'throttled'}
 */
export const checkAdminCode = (candidate, ip) => {
  if (!isAdminCodeEnabled()) return 'disabled';
  if (isThrottled(ip)) return 'throttled';

  if (matches(candidate)) {
    attempts.delete(ip); // reset on success
    return 'valid';
  }

  recordFailure(ip);
  return 'invalid';
};
