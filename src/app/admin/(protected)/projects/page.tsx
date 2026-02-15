import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string | null;
    tech: string;
    videoUrl: string | null;
    sortOrder: number;
}


export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        orderBy: { sortOrder: 'asc' },
    });

    async function deleteProject(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.project.delete({ where: { id } });
        revalidatePath('/admin/projects');
        revalidatePath('/');
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-slate-400 mt-1">Manage your portfolio showcase.</p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    Add Project
                </Link>
            </div>

            <div className="grid gap-4">
                {projects.map((project: Project) => (
                    <div key={project.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 group hover:border-indigo-500/30 transition-all">
                        <div className="h-16 w-24 bg-slate-950 rounded-lg overflow-hidden relative">
                            {project.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Image</div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                            <p className="text-sm text-slate-400 capitalize">{project.category}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/projects/${project.id}`}
                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                            >
                                <Edit size={18} />
                            </Link>

                            <form action={deleteProject}>
                                <input type="hidden" name="id" value={project.id} />
                                <button
                                    type="submit"
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                        <p className="text-slate-500">No projects added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
