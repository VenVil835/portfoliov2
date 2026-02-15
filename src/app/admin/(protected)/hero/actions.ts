'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateHeroSection(formData: FormData) {
    const greeting = formData.get('greeting') as string;
    const heading = formData.get('heading') as string;
    const description = formData.get('description') as string;
    const heroImage = formData.get('heroImage') as string;

    const hero = await prisma.heroSection.findFirst();

    if (hero) {
        await prisma.heroSection.update({
            where: { id: hero.id },
            data: {
                greeting,
                heading,
                description,
                heroImage: heroImage || null
            },
        });
    } else {
        await prisma.heroSection.create({
            data: {
                greeting,
                heading,
                description,
                heroImage: heroImage || null
            },
        });
    }

    revalidatePath('/');
    revalidatePath('/admin/hero');
    redirect('/admin/hero');
}
