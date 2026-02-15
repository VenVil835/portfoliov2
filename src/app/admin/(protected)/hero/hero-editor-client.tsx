'use client';

import { useState, ChangeEvent } from 'react';
import { Save, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { updateHeroSection } from './actions';

interface HeroEditorClientProps {
    initialHero: {
        id: string;
        greeting: string;
        heading: string;
        description: string;
        heroImage: string | null;
    } | null;
}

export default function HeroEditorClient({ initialHero }: HeroEditorClientProps) {
    const [imagePath, setImagePath] = useState(initialHero?.heroImage || '');
    const [imagePreview, setImagePreview] = useState(initialHero?.heroImage || '');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const [manualImageUrl, setManualImageUrl] = useState('');

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError('');
        setUploadingImage(true);

        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setImagePath(data.path);
                setImagePreview(data.path);
            } else {
                setImageError(data.error || 'Upload failed');
                setImagePreview('');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setImageError('Failed to upload image');
            setImagePreview('');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleManualImageUrl = () => {
        if (manualImageUrl.trim()) {
            setImagePath(manualImageUrl.trim());
            setImagePreview(manualImageUrl.trim());
            setManualImageUrl('');
        }
    };

    const removeImage = () => {
        setImagePath('');
        setImagePreview('');
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Hero Section Editor</h1>
                <p className="text-slate-400 mt-1">Customize the introduction of your portfolio.</p>
            </div>

            <form action={async (formData: FormData) => {
                await updateHeroSection(formData);
            }} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-slate-800">

                {/* Hidden input for image path */}
                <input type="hidden" name="heroImage" value={imagePath} />

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Greeting</label>
                    <input
                        name="greeting"
                        defaultValue={initialHero?.greeting || "Hi, nice to meet you,"}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Heading (Name)</label>
                    <input
                        name="heading"
                        defaultValue={initialHero?.heading || "I'm Rovenado Villotes"}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        defaultValue={initialHero?.description || "I'm a web developer with a passion..."}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                </div>

                {/* Hero Image Upload Section */}
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                        <ImageIcon size={18} className="text-purple-400" />
                        Hero Image (PNG with transparent background recommended)
                    </label>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition-colors">
                                <Upload size={18} />
                                <span>{uploadingImage ? 'Uploading...' : 'Choose Hero Image'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-slate-500 mt-1">Max 5MB - PNG (transparent), JPG, WebP</p>
                        </div>

                        {uploadingImage && (
                            <div className="flex items-center gap-2 text-purple-400">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Uploading image...</span>
                            </div>
                        )}

                        {imageError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {imageError}
                            </div>
                        )}

                        {imagePreview && (
                            <div className="relative">
                                <div className="relative aspect-square max-w-xs mx-auto bg-slate-800 rounded-lg overflow-hidden">
                                    <Image
                                        src={imagePreview}
                                        alt="Hero Preview"
                                        fill
                                        className="object-contain"
                                        unoptimized={imagePreview.startsWith('blob:')}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-800">
                            <label className="block text-xs text-slate-400 mb-2">Or enter image URL:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualImageUrl}
                                    onChange={(e) => setManualImageUrl(e.target.value)}
                                    placeholder="https://example.com/hero-image.png"
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleManualImageUrl}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                                >
                                    Set
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={uploadingImage}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
