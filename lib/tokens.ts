import crypto from 'crypto';

/**
 * Generate a random verification token
 * @returns A random string token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set an expiration date for a token
 * @param hours Number of hours until expiration
 * @returns Date object set to the expiration time
 */
export function setTokenExpiration(hours: number = 24): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
} 