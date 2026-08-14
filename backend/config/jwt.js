import { requireEnv, optionalEnv } from './env.js';

/**
 * The signing secret is required. Falling back to a hardcoded default meant
 * anyone who read the source could mint valid tokens, so refuse to boot
 * without a real secret rather than silently running insecurely.
 */
export const JWT_SECRET = requireEnv('JWT_SECRET');

export const JWT_EXPIRES_IN = optionalEnv('JWT_EXPIRES_IN', '30d');
