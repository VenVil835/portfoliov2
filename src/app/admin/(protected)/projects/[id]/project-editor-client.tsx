'use client';

import { useState, ChangeEvent } from 'react';
import { Save, ArrowLeft, Upload, X, Loader2, Image as ImageIcon, Video as VideoIcon, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { saveProject } from './actions';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/youtube';

interface GalleryImage {
    id: string;
    imageUrl: string;
    sortOrder: number;
}

interface ProjectEditorPageProps {
    params: Promise<{ id: string }>;
    initialProject?: {
        id: string;
        title: string;
        category: string;
        description: string;
        image: string | null;
        videoUrl: string | null;
        tech: string;
        images?: GalleryImage[];
    } | null;
    isNew: boolean;
}

export default function ProjectEditorClient({ initialProject, isNew }: Omit<ProjectEditorPageProps, 'params'>) {
    const [imagePath, setImagePath] = useState(initialProject?.image || '');
    const [videoPath, setVideoPath] = useState(initialProject?.videoUrl || '');
    const [imagePreview, setImagePreview] = useState(initialProject?.image || '');
    const [videoPreview, setVideoPreview] = useState(initialProject?.videoUrl || '');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [imageError, setImageError] = useState('');
    const [videoError, setVideoError] = useState('');
    const [manualImageUrl, setManualImageUrl] = useState('');
    const [manualVideoUrl, setManualVideoUrl] = useState('');

    // Gallery images state
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialProject?.images || []);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [galleryError, setGalleryError] = useState('');

    // Parse existing tech JSON for defaultValue
    let defaultTech = '';
    if (initialProject?.tech) {
        try {
            defaultTech = JSON.parse(initialProject.tech).join(', ');
        } catch {
            defaultTech = initialProject.tech;
        }
    }

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

    const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoError('');
        setUploadingVideo(true);

        const objectUrl = URL.createObjectURL(file);
        setVideoPreview(objectUrl);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'video');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setVideoPath(data.path);
                setVideoPreview(data.path);
            } else {
                setVideoError(data.error || 'Upload failed');
                setVideoPreview('');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setVideoError('Failed to upload video');
            setVideoPreview('');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleManualImageUrl = () => {
        if (manualImageUrl.trim()) {
            setImagePath(manualImageUrl.trim());
            setImagePreview(manualImageUrl.trim());
            setManualImageUrl('');
        }
    };

    const handleManualVideoUrl = () => {
        if (manualVideoUrl.trim()) {
            setVideoPath(manualVideoUrl.trim());
            setVideoPreview(manualVideoUrl.trim());
            setManualVideoUrl('');
        }
    };

    const removeImage = () => {
        setImagePath('');
        setImagePreview('');
    };

    const removeVideo = () => {
        setVideoPath('');
        setVideoPreview('');
    };

    // Gallery image handlers
    const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setGalleryError('');
        setUploadingGallery(true);

        try {
            const uploadPromises = Array.from(files).map(async (file, index) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'image');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                if (data.success) {
                    return {
                        id: `temp-${Date.now()}-${index}`,
                        imageUrl: data.path,
                        sortOrder: galleryImages.length + index
                    };
                }
                return null;
            });

            const uploadedImages = (await Promise.all(uploadPromises)).filter((img): img is GalleryImage => img !== null);
            setGalleryImages(prev => [...prev, ...uploadedImages]);
        } catch (error) {
            console.error('Gallery upload error:', error);
            setGalleryError('Failed to upload some images');
        } finally {
            setUploadingGallery(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    const moveGalleryImage = (fromIndex: number, toIndex: number) => {
        setGalleryImages(prev => {
            const newImages = [...prev];
            const [moved] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, moved);
            // Update sort orders
            return newImages.map((img, idx) => ({ ...img, sortOrder: idx }));
        });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/admin/projects"
                    className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{isNew ? 'Create New Project' : 'Edit Project'}</h1>
                    <p className="text-slate-400 mt-1">{isNew ? 'Add a new item to your portfolio.' : `Editing "${initialProject?.title}"`}</p>
                </div>
            </div>

            <form action={async (formData: FormData) => {
                // Add gallery images as JSON
                formData.append('galleryImages', JSON.stringify(galleryImages));
                await saveProject(formData, isNew, initialProject?.id);
            }} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-slate-800">

                <input type="hidden" name="image" value={imagePath} />
                <input type="hidden" name="videoUrl" value={videoPath} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                        <input
                            name="title"
                            required
                            defaultValue={initialProject?.title || ''}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Cinematic Brand Video"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <select
                            name="category"
                            required
                            defaultValue={initialProject?.category || 'video'}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                        >
                            <option value="video">Video Editing</option>
                            <option value="photo">Photography</option>
                            <option value="web">Web Development</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Technologies (comma separated)</label>
                        <input
                            name="tech"
                            defaultValue={defaultTech}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Premiere Pro, After Effects, React"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            defaultValue={initialProject?.description || ''}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Describe the project..."
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className="md:col-span-2 bg-slate-950 border border-slate-700 rounded-lg p-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <ImageIcon size={18} className="text-indigo-400" />
                            Project Thumbnail (Image)
                        </label>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition-colors">
                                    <Upload size={18} />
                                    <span>{uploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-slate-500 mt-1">Max 5MB - JPG, PNG, GIF, WebP</p>
                            </div>

                            {uploadingImage && (
                                <div className="flex items-center gap-2 text-indigo-400">
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
                                    <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
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
                                        placeholder="https://example.com/image.jpg"
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

                    {/* Gallery Images Section */}
                    <div className="md:col-span-2 bg-slate-950 border border-slate-700 rounded-lg p-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <ImageIcon size={18} className="text-green-400" />
                            Gallery Images (Optional - for slideshow)
                        </label>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition-colors">
                                    <Upload size={18} />
                                    <span>{uploadingGallery ? 'Uploading...' : 'Add Gallery Images (Multiple)'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryUpload}
                                        disabled={uploadingGallery}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-slate-500 mt-1">Select multiple images for the project gallery</p>
                            </div>

                            {uploadingGallery && (
                                <div className="flex items-center gap-2 text-green-400">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Uploading gallery images...</span>
                                </div>
                            )}

                            {galleryError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {galleryError}
                                </div>
                            )}

                            {galleryImages.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-400">{galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''} in gallery</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {galleryImages.map((img, index) => (
                                            <div key={img.id} className="relative group">
                                                <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={img.imageUrl}
                                                        alt={`Gallery ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized={img.imageUrl.startsWith('blob:')}
                                                    />
                                                </div>

                                                {/* Controls */}
                                                <div className="absolute top-1 right-1 flex gap-1">
                                                    {/* Move up */}
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveGalleryImage(index, index - 1)}
                                                            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 rounded transition-colors"
                                                            title="Move left"
                                                        >
                                                            <ArrowUp size={14} className="rotate-[-90deg]" />
                                                        </button>
                                                    )}
                                                    {/* Move down */}
                                                    {index < galleryImages.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveGalleryImage(index, index + 1)}
                                                            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 rounded transition-colors"
                                                            title="Move right"
                                                        >
                                                            <ArrowDown size={14} className="rotate-[-90deg]" />
                                                        </button>
                                                    )}
                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="p-1.5 bg-red-600/90 hover:bg-red-700 rounded transition-colors"
                                                        title="Remove image"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                {/* Order indicator */}
                                                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-slate-900/90 rounded text-xs font-medium">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Upload Section */}
                    <div className="md:col-span-2 bg-slate-950 border border-slate-700 rounded-lg p-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <VideoIcon size={18} className="text-purple-400" />
                            Project Video (Optional)
                        </label>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition-colors">
                                    <Upload size={18} />
                                    <span>{uploadingVideo ? 'Uploading...' : 'Choose Video File'}</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        disabled={uploadingVideo}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-slate-500 mt-1">Max 100MB (1-2 min recommended) - MP4, WebM, MOV or YouTube URL</p>
                            </div>

                            {uploadingVideo && (
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Uploading video...</span>
                                </div>
                            )}

                            {videoError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {videoError}
                                </div>
                            )}

                            {videoPreview && (
                                <div className="relative">
                                    <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
                                        {isYouTubeUrl(videoPreview) ? (
                                            <iframe
                                                src={getYouTubeEmbedUrl(videoPreview) || ''}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title="Video preview"
                                            />
                                        ) : (
                                            <video
                                                src={videoPreview}
                                                controls
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeVideo}
                                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-800">
                                <label className="block text-xs text-slate-400 mb-2">Or enter video URL (YouTube or direct):</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualVideoUrl}
                                        onChange={(e) => setManualVideoUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleManualVideoUrl}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                                    >
                                        Set
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={uploadingImage || uploadingVideo}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <Save size={18} />
                        {isNew ? 'Create Project' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
