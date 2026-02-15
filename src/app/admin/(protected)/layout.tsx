import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, LayoutDashboard, MessageSquare, Briefcase, Award, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/admin/login');
    }

    return (
        <div className="min-h-screen bg-slate-950 flex text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed h-full flex flex-col z-10 hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Portfolio CMS</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-4">Content Manager</div>

                    <NavLink href="/admin" icon={<Home size={20} />} label="Overview" />
                    <NavLink href="/admin/hero" icon={<LayoutDashboard size={20} />} label="Hero Section" />
                    <NavLink href="/admin/projects" icon={<Briefcase size={20} />} label="Projects" />
                    <NavLink href="/admin/skills" icon={<Award size={20} />} label="Skills" />
                    <NavLink href="/admin/messages" icon={<MessageSquare size={20} />} label="Messages" />

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-6">System</div>
                    <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {session.user.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                        </div>
                    </div>

                    <form
                        action={async () => {
                            'use server';
                            await signOut();
                        }}
                    >
                        <button className="flex items-center gap-3 w-full px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
        >
            <span className="text-slate-400 group-hover:text-indigo-400 transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
