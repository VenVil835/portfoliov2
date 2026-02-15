const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create Prisma Client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // Seed Hero
    const hero = await prisma.heroSection.findFirst();
    if (!hero) {
        await prisma.heroSection.create({
            data: {
                greeting: "Hi, nice to meet you,",
                heading: "I'm Rovenado Villotes",
                description: "I'm a web developer with a passion for creating engaging and interactive user experiences. With a strong foundation in web development and a keen eye for detail, I'm dedicated to delivering high-quality results that meet the needs of my clients.",
            }
        });
        console.log('Hero section seeded.');
    }

    // Seed Skills
    const skillCount = await prisma.skill.count();
    if (skillCount === 0) {
        await prisma.skill.createMany({
            data: [
                { name: "Adobe Premiere Pro", level: 95, category: "video", sortOrder: 1 },
                { name: "After Effects", level: 90, category: "video", sortOrder: 2 },
                { name: "CapCut", level: 85, category: "video", sortOrder: 3 },
                { name: "Canva", level: 80, category: "video", sortOrder: 4 },
                { name: "Adobe Photoshop", level: 95, category: "photo", sortOrder: 5 },
                { name: "Lightroom", level: 90, category: "photo", sortOrder: 6 },
                { name: "Canva", level: 85, category: "photo", sortOrder: 7 },
                { name: "Next.js / React", level: 95, category: "web", sortOrder: 8 },
                { name: "TypeScript", level: 90, category: "web", sortOrder: 9 },
                { name: "Tailwind CSS", level: 95, category: "web", sortOrder: 10 },
                { name: "Node.js", level: 85, category: "web", sortOrder: 11 },
            ]
        });
        console.log('Skills seeded.');
    }

    // Seed Projects
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
        await prisma.project.createMany({
            data: [
                {
                    title: "Techno Infomercial Video",
                    category: "video",
                    description: "An Infomercial video production with color grading and motion graphics",
                    tech: JSON.stringify(["Premiere Pro", "After Effects", "CapCut"]),
                    image: "/images/TechnoInfomercial.gif",
                    sortOrder: 1
                },
                {
                    title: "VenVil Production: Personal Branding",
                    category: "photo",
                    description: "Personal branding photography with advanced retouching",
                    tech: JSON.stringify(["Photoshop", "Lightroom", "Canva"]),
                    image: "/images/3DMy_Logo.png",
                    sortOrder: 2
                },
                {
                    title: "PokeHUB: A Pokemon Library with Mini-game",
                    category: "web",
                    description: "Full-stack Pokemon Library with Mini-game",
                    tech: JSON.stringify(["Next.js", "React", "Stripe", "MongoDB"]),
                    image: "/images/poke1.png",
                    sortOrder: 3
                },
                {
                    title: "Return: Short Film",
                    category: "video",
                    description: "Story-driven film about a person's journey in past life and how it affected their current life",
                    tech: JSON.stringify(["Premiere Pro", "Color Grading"]),
                    image: "/images/Short-Film.gif",
                    sortOrder: 4
                },
                {
                    title: "Digital Arts",
                    category: "photo",
                    description: "Creative digital art with dramatic lighting",
                    tech: JSON.stringify(["Photoshop", "Lightroom", "Canva"]),
                    image: "/images/PalestinianGirl.png",
                    sortOrder: 5
                },
                {
                    title: "UAGC CareHub",
                    category: "web",
                    description: "I was the UI/UX Designer for the Appointment platform for UAGC USeP",
                    tech: JSON.stringify(["Laravel", "MySQL", "Tailwind CSS", "Stripe"]),
                    image: "/images/UAGCCareHUB.png",
                    sortOrder: 6
                },
            ]
        });
        console.log('Projects seeded.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
