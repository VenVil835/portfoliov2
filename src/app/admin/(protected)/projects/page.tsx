import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Plus, Trash2, Edit, RotateCcw, Trash } from 'lucide-react';
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
    deletedAt: Date | null;
}


export default async function ProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ showDeleted?: string }>;
}) {
    const params = await searchParams;
    const showDeleted = params.showDeleted === 'true';

    const projects = await prisma.project.findMany({
        where: showDeleted ? {} : { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
    });

    async function softDeleteProject(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        revalidatePath('/admin/projects');
        revalidatePath('/');
    }

    async function restoreProject(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.project.update({
            where: { id },
            data: { deletedAt: null }
        });
        revalidatePath('/admin/projects');
        revalidatePath('/');
    }

    async function permanentDeleteProject(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.project.delete({ where: { id } });
        revalidatePath('/admin/projects');
        revalidatePath('/');
    }

    const activeProjects = projects.filter(p => !p.deletedAt);
    const deletedProjects = projects.filter(p => p.deletedAt);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-slate-400 mt-1">Manage your portfolio showcase.</p>
                </div>
                <div className="flex gap-2 flex-col sm:flex-row">
                    <Link
                        href={showDeleted ? '/admin/projects' : '/admin/projects?showDeleted=true'}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        {showDeleted ? 'Show Active' : 'Show Deleted'}
                    </Link>
                    <Link
                        href="/admin/projects/new"
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors w-full sm:w-auto"
                    >
                        <Plus size={18} />
                        Add Project
                    </Link>
                </div>
            </div>

            {!showDeleted && (
                <div className="grid gap-4">
                    {activeProjects.map((project: Project) => (
                        <div key={project.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-indigo-500/30 transition-all">
                            <div className="h-20 w-full sm:h-16 sm:w-24 bg-slate-950 rounded-lg overflow-hidden relative shrink-0">
                                {project.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Image</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                                <p className="text-sm text-slate-400 capitalize">{project.category}</p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <Link
                                    href={`/admin/projects/${project.id}`}
                                    className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </Link>

                                <form action={softDeleteProject}>
                                    <input type="hidden" name="id" value={project.id} />
                                    <button
                                        type="submit"
                                        className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Move to trash"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}

                    {activeProjects.length === 0 && (
                        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                            <p className="text-slate-500">No projects added yet.</p>
                        </div>
                    )}
                </div>
            )}

            {showDeleted && (
                <div className="grid gap-4">
                    {deletedProjects.map((project: Project) => (
                        <div key={project.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 opacity-60">
                            <div className="h-20 w-full sm:h-16 sm:w-24 bg-slate-950 rounded-lg overflow-hidden relative shrink-0">
                                {project.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover grayscale" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Image</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <h3 className="font-semibold text-lg truncate line-through">{project.title}</h3>
                                <p className="text-sm text-slate-400 capitalize">Deleted {project.deletedAt && new Date(project.deletedAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <form action={restoreProject}>
                                    <input type="hidden" name="id" value={project.id} />
                                    <button
                                        type="submit"
                                        className="p-2.5 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                                        title="Restore project"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </form>

                                <form action={permanentDeleteProject}>
                                    <input type="hidden" name="id" value={project.id} />
                                    <button
                                        type="submit"
                                        className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Permanently delete"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}

                    {deletedProjects.length === 0 && (
                        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                            <p className="text-slate-500">No deleted projects.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
