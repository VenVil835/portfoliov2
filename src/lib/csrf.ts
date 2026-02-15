import crypto from 'crypto';

/**
 * CSRF Token Utilities
 * 
 * Implements signed CSRF tokens using HMAC-SHA256.
 * The token format is: {random_bytes}.{signature}
 * 
 * Security features:
 * - Cryptographically secure random token generation
 * - Timing-safe comparison to prevent timing attacks
 * - Token expiry support (optional)
 */

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Generate a signed CSRF token
 * @returns A signed token string in format: token.signature
 */
export function generateCsrfToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now().toString(36);
    const payload = `${token}.${timestamp}`;
    const signature = crypto
        .createHmac('sha256', CSRF_SECRET)
        .update(payload)
        .digest('hex');
    return `${payload}.${signature}`;
}

/**
 * Validate a CSRF token
 * @param token The token to validate (format: token.timestamp.signature)
 * @param maxAgeMs Maximum age of token in milliseconds (default: 1 hour)
 * @returns true if valid, false otherwise
 */
export function validateCsrfToken(token: string, maxAgeMs: number = 3600000): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const [tokenValue, timestamp, signature] = parts;
        if (!tokenValue || !timestamp || !signature) return false;

        // Check token age
        const tokenTime = parseInt(timestamp, 36);
        if (Date.now() - tokenTime > maxAgeMs) {
            return false;
        }

        // Verify signature
        const payload = `${tokenValue}.${timestamp}`;
        const expectedSignature = crypto
            .createHmac('sha256', CSRF_SECRET)
            .update(payload)
            .digest('hex');

        // Timing-safe comparison
        if (signature.length !== expectedSignature.length) return false;
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch {
        return false;
    }
}
