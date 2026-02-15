import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProjectEditorClient from './project-editor-client';

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isNew = id === 'new';

    const project = isNew ? null : await prisma.project.findUnique({
        where: { id },
    });

    if (!isNew && !project) {
        redirect('/admin/projects');
    }

    return <ProjectEditorClient initialProject={project} isNew={isNew} />;
}
