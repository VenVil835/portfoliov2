'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { authenticate } from '@/app/lib/actions';

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        CMS Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Secure Admin Access
                    </p>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-700 placeholder-gray-500 text-gray-200 bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-700 placeholder-gray-500 text-gray-200 bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <span className="text-gray-500">Only authorized access permitted</span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center animate-pulse">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        aria-disabled={isPending}
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
