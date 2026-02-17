import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Mail, Clock, RotateCcw, Trash, Trash2 } from 'lucide-react';

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Date;
    ipHash: string | null;
    deletedAt: Date | null;
}

export default async function MessagesPage({
    searchParams,
}: {
    searchParams: Promise<{ showDeleted?: string }>;
}) {
    const params = await searchParams;
    const showDeleted = params.showDeleted === 'true';

    const messages = await prisma.contactSubmission.findMany({
        where: showDeleted ? {} : { deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });

    async function softDeleteMessage(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.contactSubmission.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        revalidatePath('/admin/messages');
    }

    async function restoreMessage(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.contactSubmission.update({
            where: { id },
            data: { deletedAt: null }
        });
        revalidatePath('/admin/messages');
    }

    async function permanentDeleteMessage(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.contactSubmission.delete({ where: { id } });
        revalidatePath('/admin/messages');
    }

    const activeMessages = messages.filter(m => !m.deletedAt);
    const deletedMessages = messages.filter(m => m.deletedAt);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <span className="text-slate-400 text-sm mt-1 block">
                        {showDeleted ? deletedMessages.length : activeMessages.length} {showDeleted ? 'Deleted' : 'Total'}
                    </span>
                </div>
                <a
                    href={showDeleted ? '/admin/messages' : '/admin/messages?showDeleted=true'}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                >
                    {showDeleted ? 'Show Active' : 'Show Deleted'}
                </a>
            </div>

            {!showDeleted && (
                <div className="space-y-4">
                    {activeMessages.map((msg: ContactSubmission) => (
                        <div key={msg.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-indigo-500/30">
                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{msg.name}</h3>
                                        <a href={`mailto:${msg.email}`} className="text-indigo-400 hover:text-indigo-300 text-sm">
                                            {msg.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Clock size={14} />
                                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                    </div>
                                    <form action={softDeleteMessage}>
                                        <input type="hidden" name="id" value={msg.id} />
                                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Move to trash">
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 text-slate-300 whitespace-pre-wrap">
                                {msg.message}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <span className="text-xs text-slate-600 font-mono">
                                    IP: {msg.ipHash?.substring(0, 8)}...
                                </span>
                            </div>
                        </div>
                    ))}

                    {activeMessages.length === 0 && (
                        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 animate-pulse">
                            <Mail className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                            <p className="text-slate-500">No messages received yet.</p>
                        </div>
                    )}
                </div>
            )}

            {showDeleted && (
                <div className="space-y-4">
                    {deletedMessages.map((msg: ContactSubmission) => (
                        <div key={msg.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 opacity-60">
                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-500/10 rounded-lg text-slate-500">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg line-through">{msg.name}</h3>
                                        <p className="text-slate-500 text-sm">
                                            Deleted {msg.deletedAt && new Date(msg.deletedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <form action={restoreMessage}>
                                        <input type="hidden" name="id" value={msg.id} />
                                        <button className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors" title="Restore">
                                            <RotateCcw size={18} />
                                        </button>
                                    </form>
                                    <form action={permanentDeleteMessage}>
                                        <input type="hidden" name="id" value={msg.id} />
                                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Permanently delete">
                                            <Trash size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 text-slate-400 whitespace-pre-wrap opacity-50">
                                {msg.message}
                            </div>
                        </div>
                    ))}

                    {deletedMessages.length === 0 && (
                        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                            <Mail className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                            <p className="text-slate-500">No deleted messages.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
