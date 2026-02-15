'use client';

import { useState } from 'react';
import { updateCredentials } from './actions';
import { AlertCircle, CheckCircle2, Key, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateCredentials(formData);

        setLoading(false);
        setMessage({
            type: result.success ? 'success' : 'error',
            text: result.message
        });

        if (result.success) {
            // Clear form
            e.currentTarget.reset();
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin"
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your admin credentials</p>
                </div>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <div className="flex items-start gap-3">
                        {message.type === 'success' ? (
                            <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm">{message.text}</p>
                    </div>
                </div>
            )}

            {/* Important Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-400">
                        <p className="font-semibold mb-1">Important:</p>
                        <p>After updating your credentials, you must restart your development server for the changes to take effect. Make sure to remember your new password!</p>
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
                            Current Password *
                        </label>
                        <div className="relative">
                            <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter current password to confirm changes"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Required for security verification</p>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Update Credentials</h3>

                        {/* New Username */}
                        <div className="mb-4">
                            <label htmlFor="newUsername" className="block text-sm font-medium text-slate-300 mb-2">
                                New Username *
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    id="newUsername"
                                    name="newUsername"
                                    required
                                    defaultValue="admin"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter new username"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    minLength={8}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Minimum 8 characters (optional - leave blank to keep current)</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    minLength={8}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-800">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Credentials'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
