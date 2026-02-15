import { prisma } from '@/lib/db';
import { Briefcase, MessageSquare, Award } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const [projectCount, skillCount, messageCount] = await Promise.all([
        prisma.project.count(),
        prisma.skill.count(),
        prisma.contactSubmission.count(),
    ]);

    const recentMessages = await prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-slate-400 mt-2">Welcome back to your portfolio control center.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Projects"
                    value={projectCount}
                    icon={<Briefcase className="w-6 h-6 text-blue-400" />}
                    href="/admin/projects"
                />
                <StatCard
                    title="Skills Listed"
                    value={skillCount}
                    icon={<Award className="w-6 h-6 text-purple-400" />}
                    href="/admin/skills"
                />
                <StatCard
                    title="Messages"
                    value={messageCount}
                    icon={<MessageSquare className="w-6 h-6 text-green-400" />}
                    href="/admin/messages"
                />
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Recent Messages</h2>
                    <Link href="/admin/messages" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
                </div>
                <div className="divide-y divide-slate-800">
                    {recentMessages.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No messages yet.</div>
                    ) : (
                        recentMessages.map((msg) => (
                            <div key={msg.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium text-white">{msg.name}</h3>
                                    <span className="text-xs text-slate-500">
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-2">{msg.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, href }: { title: string; value: number; icon: React.ReactNode; href: string }) {
    return (
        <Link href={href} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all hover:-translate-y-1 block group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-800/80 transition-colors">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-sm">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            </div>
        </Link>
    );
}
