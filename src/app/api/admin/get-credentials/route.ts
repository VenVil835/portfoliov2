import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const credentialsPath = join(process.cwd(), 'src', 'admin-credentials.json');
        const credentialsFile = await readFile(credentialsPath, 'utf-8');
        const credentials = JSON.parse(credentialsFile);

        return NextResponse.json({
            username: credentials.username,
            passwordHash: credentials.passwordHash,
        });
    } catch (error) {
        console.error('Failed to load admin credentials from file:', error);
        // Fallback to environment variables
        return NextResponse.json({
            username: process.env.ADMIN_USER || '',
            passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
        });
    }
}
