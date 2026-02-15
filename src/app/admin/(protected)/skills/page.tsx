import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Plus, Trash2 } from 'lucide-react';

interface Skill {
    id: string;
    name: string;
    level: number;
    category: string;
    sortOrder: number;
}


export default async function SkillsPage() {
    const skills = await prisma.skill.findMany({
        orderBy: { sortOrder: 'asc' },
    });

    async function addSkill(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        const level = parseInt(formData.get('level') as string);
        const category = formData.get('category') as string;

        await prisma.skill.create({
            data: { name, level, category },
        });
        revalidatePath('/admin/skills');
        revalidatePath('/');
    }

    async function deleteSkill(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await prisma.skill.delete({ where: { id } });
        revalidatePath('/admin/skills');
        revalidatePath('/');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Skills</h1>
                    <p className="text-slate-400 mt-1">Manage your expertise levels.</p>
                </div>

                <div className="grid gap-3">
                    {skills.map((skill: Skill) => (
                        <div key={skill.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-indigo-500/30">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                                    {skill.level}%
                                </div>
                                <div>
                                    <h3 className="font-semibold">{skill.name}</h3>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">{skill.category}</span>
                                </div>
                            </div>

                            <form action={deleteSkill}>
                                <input type="hidden" name="id" value={skill.id} />
                                <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={18} />
                                </button>
                            </form>
                        </div>
                    ))}

                    {skills.length === 0 && (
                        <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            No skills added yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Form */}
            <div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 sticky top-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-indigo-400" />
                        Add New Skill
                    </h2>

                    <form action={addSkill} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Skill Name</label>
                            <input
                                name="name"
                                required
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="e.g. React Native"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Level (0-100)</label>
                            <input
                                name="level"
                                type="number"
                                min="0"
                                max="100"
                                required
                                defaultValue="80"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                            <select
                                name="category"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none"
                            >
                                <option value="video">Video Editing</option>
                                <option value="photo">Photography</option>
                                <option value="web">Web Development</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2"
                        >
                            Add Skill
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
