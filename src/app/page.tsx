import { prisma } from '@/lib/db';
import PortfolioClient from './components/portfolio-client';

// Default Fallback Data (Seed content if DB is empty)
const DEFAULT_HERO = {
  greeting: "Hi,",
  heading: "I'm Rovenado Villotes",
  description: "I'm a web developer with a passion for creating engaging and interactive user experiences. With a strong foundation in web development and a keen eye for detail, I'm dedicated to delivering high-quality results that meet the needs of my clients."
};

const DEFAULT_PROJECTS = [
  {
    title: "N/A",
    category: "N/A",
    description: "N/A",
    tech: JSON.stringify(["N/A"]),
    image: "N/A.gif",
    sortOrder: 1
  }
];

const DEFAULT_SKILLS = [
  { name: "N/A", level: 0, category: "N/A", sortOrder: 1 },
];

// Revalidate every hour
export const revalidate = 3600;

export default async function Page() {
  // Fetch data with error handling
  let hero, projects, skills;

  try {
    // Debug DB connection
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 20));

    [hero, projects, skills] = await Promise.all([
      prisma.heroSection.findFirst(),
      prisma.project.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      }),
      prisma.skill.findMany({ orderBy: { sortOrder: 'asc' } })
    ]);
  } catch (e) {
    console.error("Database connection failed, using fallback data", e);
  }

  // Use fallback data if DB is empty or connection failed
  const heroData = hero || DEFAULT_HERO;

  const rawProjects = (projects && projects.length > 0) ? projects : DEFAULT_PROJECTS.map((p, i) => ({ ...p, id: i.toString() }));

  // Transform projects (parse JSON tech)
  const transformedProjects = rawProjects.map(p => ({
    ...p,
    tech: (typeof p.tech === 'string' ? JSON.parse(p.tech) : p.tech) as string[],
    id: p.id
  }));

  // Organize skills by category
  const rawSkills = (skills && skills.length > 0) ? skills : DEFAULT_SKILLS.map((s, i) => ({ ...s, id: i.toString() }));

  const categorizedSkills = {
    video: rawSkills.filter(s => s.category === 'video'),
    photo: rawSkills.filter(s => s.category === 'photo'),
    web: rawSkills.filter(s => s.category === 'web'),
  };

  return (
    <PortfolioClient
      hero={heroData}
      projects={transformedProjects}
      skills={categorizedSkills}
    />
  );
}
