import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf
 * 
 * Returns a new CSRF token for form submissions.
 * This token should be included in the contact form request.
 */
export async function GET() {
    const token = generateCsrfToken();

    return NextResponse.json(
        { csrfToken: token },
        {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        }
    );
}
