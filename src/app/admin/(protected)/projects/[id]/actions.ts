'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveProject(formData: FormData, isNew: boolean, projectId?: string) {
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const techString = formData.get('tech') as string;

    // Convert comma-separated tech string to JSON string
    const techList = techString.split(',').map(t => t.trim()).filter(Boolean);
    const tech = JSON.stringify(techList);

    const data = {
        title,
        category,
        description,
        image: image || null,
        videoUrl: videoUrl || null,
        tech,
    };

    if (isNew) {
        await prisma.project.create({ data });
    } else if (projectId) {
        await prisma.project.update({
            where: { id: projectId },
            data,
        });
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    redirect('/admin/projects');
}
