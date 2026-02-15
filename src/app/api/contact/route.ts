import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/schemas';
import { validateCsrfToken } from '@/lib/csrf';
import { checkRateLimit, getClientIp, hashIp } from '@/lib/rate-limit';
import prisma from '@/lib/db';

/**
 * POST /api/contact
 * 
 * Secured contact form submission endpoint.
 * 
 * Security measures:
 * 1. CSRF token validation
 * 2. Rate limiting (5 requests per IP per hour)
 * 3. Zod schema validation (prevents XSS via strict patterns)
 * 4. Parameterized queries via Prisma (prevents SQL injection)
 * 5. Proper error handling (no internal details leaked)
 */
export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIp = getClientIp(request.headers);
        const ipHash = hashIp(clientIp);

        // Rate limiting check
        const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10);
        const rateLimit = checkRateLimit(ipHash, maxRequests);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        // Parse and validate request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate with Zod schema
        const validationResult = contactSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.flatten();
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: errors.fieldErrors,
                },
                { status: 400 }
            );
        }

        const { name, email, message, csrfToken } = validationResult.data;

        // Validate CSRF token
        if (!validateCsrfToken(csrfToken)) {
            return NextResponse.json(
                { error: 'Invalid or expired security token. Please refresh and try again.' },
                { status: 403 }
            );
        }

        // Store submission in database (Prisma uses parameterized queries)
        await prisma.contactSubmission.create({
            data: {
                name,
                email,
                message,
                ipHash, // Store hashed IP for rate limit tracking
            },
        });

        // Success response
        return NextResponse.json(
            {
                message: 'Thank you for your message! I will get back to you soon.',
                success: true,
            },
            {
                status: 201,
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                },
            }
        );

    } catch (error) {
        // Log error for debugging (server-side only)
        console.error('Contact form error:', error);

        // Return generic error to client (no internal details)
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}

/**
 * Handle unsupported methods
 */
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
