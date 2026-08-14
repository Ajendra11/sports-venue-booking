import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

/**
 * Loads backend/.env regardless of the working directory the process was
 * started from.
 *
 * `dotenv.config()` resolves `.env` against process.cwd(), so `node
 * backend/app.js` from the repo root (or an IDE/nodemon launch with a
 * different cwd) would silently load nothing and every config value would
 * come back undefined. Anchoring to this file's own location removes that
 * whole class of failure.
 *
 * Import this module before reading process.env anywhere else.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Hosted platforms inject config as real environment variables and have no
// .env file on disk, so the "go edit .env" advice would send you chasing a
// file that isn't there.
const isHosted = Boolean(
  process.env.RENDER || process.env.FLY_APP_NAME || process.env.DYNO || process.env.K_SERVICE
);

/** Read a required variable, failing fast with an actionable message. */
export const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(`✗ Error: ${key} is not defined.`);
    console.error(
      isHosted
        ? `  Add ${key} to your hosting provider's environment variables, then redeploy.\n` +
          '  On Render: Dashboard → your service → Environment → Add Environment Variable.'
        : `  Add ${key} to backend/.env (see backend/.env.example).`
    );
    process.exit(1);
  }
  return value;
};

export const optionalEnv = (key, fallback) => process.env[key] || fallback;
