import crypto from 'crypto';

/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API routes.
 * Uses IP hashing for privacy and memory efficiency.
 * 
 * Note: For production with multiple serverless instances,
 * consider using Redis or a similar distributed store.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (resets on cold start in serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Hash an IP address for privacy
 * @param ip The IP address to hash
 * @returns A SHA-256 hash of the IP (first 16 chars)
 */
export function hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (e.g., hashed IP)
 * @param maxRequests Maximum requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 3600000 // 1 hour
): { allowed: boolean; remaining: number; resetTime: number } {
    cleanupExpiredEntries();

    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        // First request or window expired
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Get client IP from request headers
 * Handles Vercel's x-forwarded-for and other proxied scenarios
 */
export function getClientIp(headers: Headers): string {
    // Vercel sets x-forwarded-for
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    // Fallback headers
    return (
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') || // Cloudflare
        'unknown'
    );
}
