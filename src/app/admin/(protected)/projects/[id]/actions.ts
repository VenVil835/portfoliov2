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
    const galleryImagesJson = formData.get('galleryImages') as string;

    // Convert comma-separated tech string to JSON string
    const techList = techString.split(',').map(t => t.trim()).filter(Boolean);
    const tech = JSON.stringify(techList);

    // Parse gallery images
    let galleryImages: { id: string; imageUrl: string; sortOrder: number }[] = [];
    if (galleryImagesJson) {
        try {
            galleryImages = JSON.parse(galleryImagesJson);
        } catch (e) {
            console.error('Failed to parse gallery images:', e);
        }
    }

    const data = {
        title,
        category,
        description,
        image: image || null,
        videoUrl: videoUrl || null,
        tech,
    };

    if (isNew) {
        const project = await prisma.project.create({ data });

        // Create gallery images
        if (galleryImages.length > 0) {
            await prisma.projectImage.createMany({
                data: galleryImages.map((img, idx) => ({
                    projectId: project.id,
                    imageUrl: img.imageUrl,
                    sortOrder: idx
                }))
            });
        }
    } else if (projectId) {
        await prisma.project.update({
            where: { id: projectId },
            data,
        });

        // Delete all existing gallery images and recreate
        await prisma.projectImage.deleteMany({
            where: { projectId }
        });

        if (galleryImages.length > 0) {
            await prisma.projectImage.createMany({
                data: galleryImages.map((img, idx) => ({
                    projectId: projectId,
                    imageUrl: img.imageUrl,
                    sortOrder: idx
                }))
            });
        }
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    redirect('/admin/projects');
}
