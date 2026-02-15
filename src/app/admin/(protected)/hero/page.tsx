import { prisma } from '@/lib/db';
import HeroEditorClient from './hero-editor-client';

export default async function HeroEditorPage() {
    const hero = await prisma.heroSection.findFirst();

    return <HeroEditorClient initialHero={hero} />;
}
