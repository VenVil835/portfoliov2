import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {
                    const parsed = await loginSchema.safeParseAsync(credentials);
                    if (!parsed.success) {
                        return null;
                    }
                    const { username, password } = parsed.data;

                    // Read credentials from API route (Edge Runtime compatible)
                    let adminUser: string;
                    let adminPasswordHash: string;

                    try {
                        // Construct the full URL for the API route
                        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                        const response = await fetch(`${baseUrl}/api/admin/get-credentials`, {
                            cache: 'no-store', // Never cache credentials
                        });

                        if (!response.ok) {
                            throw new Error('Failed to fetch credentials');
                        }

                        const credentials = await response.json();
                        adminUser = credentials.username;
                        adminPasswordHash = credentials.passwordHash;

                        console.log('========== LOGIN ATTEMPT (HOT-RELOAD) ==========');
                        console.log('✅ Credentials loaded fresh from API');
                    } catch (_error) {
                        console.error('❌ Failed to load admin credentials from API, falling back to env vars');
                        // Fallback to environment variables if API call fails
                        adminUser = process.env.ADMIN_USER || '';
                        adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
                    }

                    console.log('Input username:', username);
                    console.log('Expected username:', adminUser);
                    console.log('Password hash (first 20 chars):', adminPasswordHash.substring(0, 20));

                    if (!adminUser || !adminPasswordHash) {
                        console.error('❌ Admin credentials not configured');
                        console.log('===================================');
                        return null;
                    }

                    if (username === adminUser) {
                        console.log('✅ Username matches');
                        const isValid = await bcrypt.compare(password, adminPasswordHash);
                        console.log('Password valid:', isValid);
                        console.log('===================================');

                        if (isValid) {
                            return { id: '1', name: 'Admin', email: 'admin@example.com' };
                        }
                    } else {
                        console.log('❌ Username does not match');
                        console.log('===================================');
                    }

                    return null;
                } catch (error) {
                    // Catch any unexpected errors and log them
                    console.error('❌ Unexpected error in authorize callback:', error);
                    console.log('===================================');
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdminPath = nextUrl.pathname.startsWith('/admin') && !nextUrl.pathname.startsWith('/admin/login');

            if (isAdminPath) {
                if (isLoggedIn) return true;
                return Response.redirect(new URL('/admin/login', nextUrl));
            }
            return true;
        },
    },
});
