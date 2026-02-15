import { prisma } from '@/lib/db';
import { Mail, Clock } from 'lucide-react';

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Date;
    ipHash: string | null;
}

export default async function MessagesPage() {
    const messages = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Messages</h1>
                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm">
                    {messages.length} Total
                </span>
            </div>

            <div className="space-y-4">
                {messages.map((msg: ContactSubmission) => (
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
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Clock size={14} />
                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
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

                {messages.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 animate-pulse">
                        <Mail className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                        <p className="text-slate-500">No messages received yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
