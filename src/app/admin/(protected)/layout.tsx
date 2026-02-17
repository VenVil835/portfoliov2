import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './admin-layout-client';

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
        <AdminLayoutClient
            userName={session.user.name}
            userEmail={session.user.email}
        >
            {children}
        </AdminLayoutClient>
    );
}
