'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authenticate(prevState: string | undefined, formData: any) {
    try {
        await signIn('credentials', formData);
        // If signIn succeeds, redirect to admin page
        // We do this separately instead of using redirectTo option
        // because redirectTo causes "unexpected response" errors in server actions
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }

        // Handle other errors gracefully (e.g., network errors, API failures)
        // Don't re-throw - return a user-friendly message instead
        console.error('Authentication error:', error);
        return 'Unable to sign in. Please try again.';
    }

    // Redirect after successful authentication
    redirect('/admin');
}
