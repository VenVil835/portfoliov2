'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
    Camera, Video, Code, Mail, Github, Linkedin, Menu, X,
    Play, Send, Loader2, CheckCircle, AlertCircle, Star,
    GitFork, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/youtube';
import { useScrollAnimation } from '../hooks/use-scroll-animation';
import ThemeToggle from './theme-toggle';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Types (mirrored from Prisma models for props)
interface HeroData {
    greeting: string;
    heading: string;
    description: string;
    heroImage?: string | null;
}

interface Project {
    id: string | number;
    title: string;
    category: string;
    description: string;
    tech: string[]; // parsed from JSON
    image?: string | null;
    videoUrl?: string | null;
    images?: { id: string; imageUrl: string; sortOrder: number }[];
}

interface Skill {
    id: string;
    name: string;
    category: string;
    level: number;
}

interface PortfolioClientProps {
    hero: HeroData;
    projects: Project[];
    skills: {
        video: Skill[];
        photo: Skill[];
        web: Skill[];
    };
}

interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
}

interface ContactFormState {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
}

// Helper component for Skills Grid to fix React Hooks issue
function SkillCategoryCard({ category, skillList, idx }: { category: string; skillList: Skill[]; idx: number }) {
    const skillAnimation = useScrollAnimation({ threshold: 0.2 });

    return (
        // eslint-disable-next-line react-hooks/rules-of-hooks
        <div key={category} ref={skillAnimation.ref} className={`bg-slate-800/50 dark:bg-slate-800/50 light:bg-white/80 backdrop-blur rounded-2xl p-8 border border-slate-700 dark:border-slate-700 light:border-gray-300 hover:border-slate-600 transition-colors scroll-animate ${skillAnimation.isVisible ? 'animate-scale-in' : ''
            }`} style={{ animationDelay: `${idx * 0.2}s` }}>
            <h3 className="text-2xl font-bold mb-6 capitalize flex items-center gap-3">
                <span className={`scroll-animate ${skillAnimation.isVisible ? 'animate-rotate-in' : ''
                    }`} style={{ animationDelay: `${idx * 0.2 + 0.1}s` }}>
                    {category === 'video' && <Video className="w-7 h-7 text-indigo-400" />}
                    {category === 'photo' && <Camera className="w-7 h-7 text-purple-400" />}
                    {category === 'web' && <Code className="w-7 h-7 text-pink-400" />}
                    {category === 'other' && <Star className="w-7 h-7 text-yellow-400" />}
                </span>
                {category}
            </h3>
            <div className="space-y-5">
                {skillList.map((skill, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <span className="text-sm text-white">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full skill-bar"
                                style={{ width: `${skill.level}%` }}
                            />
                        </div>
                    </div>
                ))}
                {skillList.length === 0 && (
                    <div className="text-sm text-slate-500 italic">No skills added yet.</div>
                )}
            </div>
        </div>
    );
}

function SkillsGrid({ skills }: { skills: { video: Skill[]; photo: Skill[]; web: Skill[] } }) {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(skills).map(([category, skillList], idx) => (
                <SkillCategoryCard key={category} category={category} skillList={skillList} idx={idx} />
            ))}
        </div>
    );
}

// Mini gallery component for project cards
function ProjectCardGallery({ project }: { project: Project }) {
    // Prepare gallery images - combine main image + gallery images
    const galleryImages: string[] = [];
    if (project.image) galleryImages.push(project.image);
    if (project.images) {
        project.images.forEach(img => galleryImages.push(img.imageUrl));
    }

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = galleryImages.length > 1;

    if (galleryImages.length === 0) {
        // No images - show category icon
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-50 group-hover:opacity-70 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center">
                    {project.category === 'video' && <Video className="w-16 h-16 text-white opacity-50" />}
                    {project.category === 'photo' && <Camera className="w-16 h-16 text-white opacity-50" />}
                    {project.category === 'web' && <Code className="w-16 h-16 text-white opacity-50" />}
                </div>
            </div>
        );
    }

    return (
        <>
            <Image
                src={galleryImages[currentImageIndex]}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized={galleryImages[currentImageIndex].endsWith('.gif')}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            {/* Mini Gallery Navigation (only if multiple images) */}
            {hasMultipleImages && (
                <>
                    {/* Left/Right arrows */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) =>
                                prev === 0 ? galleryImages.length - 1 : prev - 1
                            );
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) =>
                                prev === galleryImages.length - 1 ? 0 : prev + 1
                            );
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {galleryImages.slice(0, 5).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(idx);
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                        {galleryImages.length > 5 && (
                            <span className="text-white/75 text-xs ml-1">
                                +{galleryImages.length - 5}
                            </span>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

// Full slideshow component for project modal
function ProjectModalSlideshow({ project, onImageClick }: { project: Project; onImageClick: (imageUrl: string) => void }) {
    // Prepare gallery images
    const modalGalleryImages: string[] = [];
    if (project.image) modalGalleryImages.push(project.image);
    if (project.images) {
        project.images.forEach(img => modalGalleryImages.push(img.imageUrl));
    }

    const [modalImageIndex, setModalImageIndex] = useState(0);

    if (modalGalleryImages.length === 0) return null;

    return (
        <div className="relative aspect-video bg-slate-900 group">
            {/* Main image */}
            <Image
                src={modalGalleryImages[modalImageIndex]}
                alt={project.title}
                fill
                className="object-cover"
                unoptimized={modalGalleryImages[modalImageIndex].endsWith('.gif')}
            />

            {/* Navigation arrows */}
            {modalGalleryImages.length > 1 && (
                <>
                    <button
                        onClick={() => setModalImageIndex((prev) =>
                            prev === 0 ? modalGalleryImages.length - 1 : prev - 1
                        )}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-slate-900/90 hover:bg-slate-900 rounded-full transition-all hover:scale-110"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </button>
                    <button
                        onClick={() => setModalImageIndex((prev) =>
                            prev === modalGalleryImages.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-slate-900/90 hover:bg-slate-900 rounded-full transition-all hover:scale-110"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </button>

                    {/* Image counter */}
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 px-2 py-1 md:px-3 md:py-1.5 bg-slate-900/90 rounded-full text-xs md:text-sm font-medium">
                        {modalImageIndex + 1} / {modalGalleryImages.length}
                    </div>

                    {/* Thumbnail strip - hidden on mobile, shown on desktop */}
                    <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 gap-2 max-w-full px-4 overflow-x-auto scrollbar-hide">
                        {modalGalleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setModalImageIndex(idx)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === modalImageIndex
                                        ? 'border-indigo-500 scale-110'
                                        : 'border-transparent hover:border-white/50'
                                    }`}
                                aria-label={`Go to image ${idx + 1}`}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized={img.endsWith('.gif')}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* View Full Image Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onImageClick(modalGalleryImages[modalImageIndex]);
                }}
                className="absolute bottom-2 md:bottom-4 right-2 md:right-4 p-2 md:p-3 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-sm rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="View full image"
            >
                <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>
        </div>
    );
}


export default function PortfolioClient({ hero, projects, skills }: PortfolioClientProps) {
    const [activeSection, setActiveSection] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [csrfToken, setCsrfToken] = useState('');
    const [formState, setFormState] = useState<ContactFormState>({ status: 'idle', message: '' });
    const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAllProjects, setShowAllProjects] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Scroll animations
    const heroAnimation = useScrollAnimation({ threshold: 0.2 });
    const projectsHeaderAnimation = useScrollAnimation({ threshold: 0.3 });
    const skillsHeaderAnimation = useScrollAnimation({ threshold: 0.3 });
    const githubHeaderAnimation = useScrollAnimation({ threshold: 0.3 });
    const contactHeaderAnimation = useScrollAnimation({ threshold: 0.3 });

    // Track mouse for dynamic gradient
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Fetch CSRF token on mount
    useEffect(() => {
        async function fetchCsrfToken() {
            try {
                const res = await fetch('/api/csrf');
                const data = await res.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error('Failed to fetch CSRF token:', error);
            }
        }
        fetchCsrfToken();
    }, []);

    // Fetch GitHub repos
    useEffect(() => {
        async function fetchGitHubRepos() {
            try {
                const res = await fetch('/api/github');
                const data = await res.json();
                if (data.repos) {
                    setGithubRepos(data.repos);
                }
            } catch (error) {
                console.error('Failed to fetch GitHub repos:', error);
            }
        }
        fetchGitHubRepos();
    }, []);

    // Handle contact form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormState({ status: 'loading', message: '' });

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string,
            csrfToken,
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                setFormState({ status: 'success', message: result.message });
                // Refresh CSRF token after successful submission
                const tokenRes = await fetch('/api/csrf');
                const tokenData = await tokenRes.json();
                setCsrfToken(tokenData.csrfToken);
                // Reset form
                (e.target as HTMLFormElement).reset();
            } else {
                setFormState({
                    status: 'error',
                    message: result.error || 'Something went wrong. Please try again.'
                });
            }
        } catch {
            setFormState({
                status: 'error',
                message: 'Failed to send message. Please check your connection.'
            });
        }
    };

    const scrollToSection = (section: string) => {
        setActiveSection(section);
        setIsMenuOpen(false);
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const openProjectModal = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const closeProjectModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    // Handle body overflow for modal
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    // Close modal on ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeProjectModal();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    return (
        <div className="min-h-screen">
            {/* Animated background gradient */}
            <div
                className="fixed inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 50%)`
                }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/80 backdrop-blur-lg border-b border-slate-800 dark:border-slate-800 light:border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Ven.dev
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-8 items-center">
                        {['home', 'projects', 'skills', 'github', 'contact'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                className={`cursor-pointer capitalize transition-all duration-200 hover:scale-105 ${activeSection === section
                                    ? 'text-indigo-400 font-semibold'
                                    : 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900'
                                    }`}
                            >
                                {section}
                            </button>
                        ))}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            className="p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
                        {['home', 'projects', 'skills', 'github', 'contact'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                className="block w-full text-left px-6 py-3 capitalize hover:bg-slate-800 transition-colors"
                            >
                                {section}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div ref={heroAnimation.ref}>
                            <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight scroll-animate ${heroAnimation.isVisible ? 'animate-slide-in-left' : ''
                                }`}>
                                <span className={`block scroll-animate ${heroAnimation.isVisible ? 'animate-fade-in-scale' : ''
                                    }`} style={{ animationDelay: '0.2s' }}>
                                    {hero.greeting}
                                </span>
                                <span className={`block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] scroll-animate ${heroAnimation.isVisible ? 'animate-slide-in-right' : ''
                                    }`} style={{ animationDelay: '0.4s' }}>
                                    {hero.heading}
                                </span>
                            </h1>
                            <p className={`text-xl mb-8 leading-relaxed whitespace-pre-wrap scroll-animate ${heroAnimation.isVisible ? 'animate-fade-in-scale' : ''
                                }`} style={{ animationDelay: '0.6s' }}>
                                {hero.description}
                            </p>
                            <div className={`flex flex-col sm:flex-row gap-4 scroll-animate ${heroAnimation.isVisible ? 'animate-slide-up-bounce' : ''
                                }`} style={{ animationDelay: '0.8s' }}>
                                <button
                                    onClick={() => scrollToSection('projects')}
                                    className="cursor-pointer px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25 text-white dark:text-white light:text-white"
                                >
                                    View Projects
                                </button>
                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="cursor-pointer px-8 py-3 border border-indigo-400 hover:bg-indigo-400/10 rounded-lg font-semibold transition-all hover:border-indigo-300"
                                >
                                    Get in Touch
                                </button>
                            </div>
                        </div>
                        {/* Hero Image with Animated Gradient Background */}
                        {hero.heroImage ? (
                            <div className="relative w-full max-w-md mx-auto">
                                {/* Animated gradient background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-blue-400 to-black-100 animate-gradient bg-[length:200%_200%] rounded-[100px] blur-3xl opacity-40" />

                                {/* Hexagonal container with gradient */}
                                <div className="relative aspect-square">
                                    {/* Animated gradient border */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-black-400 via-indigo-400 to-black-400 animate-gradient bg-[length:200%_200%]"
                                        style={{
                                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                                        }}
                                    />

                                    {/* Hero Image */}
                                    <div className="absolute inset-0 flex items-center justify-center p-2">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={hero.heroImage}
                                                alt={hero.heading}
                                                fill
                                                className="object-contain drop-shadow-2xl"
                                                style={{
                                                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                                                }}
                                                unoptimized={hero.heroImage.endsWith('.gif')}
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Fallback: Original 4-card grid if no hero image
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {[
                                    { icon: Video, title: "Video Editing", desc: "Cinematic storytelling", gradient: "from-indigo-600 to-purple-600", delay: "0" },
                                    { icon: Camera, title: "Photography", desc: "Visual excellence", gradient: "from-purple-600 to-pink-600", delay: "100" },
                                    { icon: Code, title: "Web Dev", desc: "Modern solutions", gradient: "from-pink-600 to-red-600", delay: "200" },
                                    { icon: Play, title: "Animation", desc: "Motion graphics", gradient: "from-red-600 to-orange-600", delay: "300" },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`
                                            relative overflow-hidden aspect-square 
                                            bg-gradient-to-br ${item.gradient} 
                                            p-6 md:p-8 rounded-3xl 
                                            flex flex-col justify-between 
                                            transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/20
                                            animate-fade-in-up
                                        `}
                                        style={{ animationDelay: `${item.delay}ms` }}
                                    >
                                        <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-sm">
                                            <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold mb-1 text-white tracking-tight">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-white/80 font-medium leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div ref={projectsHeaderAnimation.ref}>
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 text-center scroll-animate ${projectsHeaderAnimation.isVisible ? 'animate-fade-in-scale' : ''
                            }`}>Featured Projects</h2>
                        <p className={` text-center mb-12 scroll-animate ${projectsHeaderAnimation.isVisible ? 'animate-slide-in-left' : ''
                            }`} style={{ animationDelay: '0.2s' }}>A selection of my recent work</p>
                    </div>

                    {/* Swiper Carousel */}
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        coverflowEffect={{
                            rotate: 50,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: true,
                        }}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: false,
                        }}
                        navigation={true}
                        loop={projects.length > 1}
                        modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
                        className="projectsSwiper"
                    >
                        {projects.map((project) => (
                            <SwiperSlide key={project.id}>
                                <article
                                    onClick={() => openProjectModal(project)}
                                    className="relative group cursor-pointer transform transition-all duration-500"
                                >
                                    {/* Background gradient glow */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                                    {/* Card content */}
                                    <div className="text-white relative bg-slate-900 dark:bg-slate-900 light:bg-white rounded-2xl overflow-hidden border border-slate-800 dark:border-slate-800 light:border-gray-200 shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-500">
                                        {/* Image Container */}
                                        <div className="aspect-video relative overflow-hidden bg-slate-700">
                                            <ProjectCardGallery project={project} />
                                        </div>

                                        <div className="p-6">
                                            <span className="inline-block px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs uppercase tracking-wider font-semibold mb-3">
                                                {project.category}
                                            </span>
                                            <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.tech.map((tech, i) => (
                                                    <span key={i} className="px-3 py-1 bg-indigo-600/10 border border-indigo-600/20 rounded-full text-xs font-medium text-indigo-300">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* View All Projects Button */}
                    {projects.length > 4 && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={() => setShowAllProjects(true)}
                                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    View All Projects
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        </div>
                    )}

                    {projects.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No projects to display yet.
                        </div>
                    )}
                </div>
            </section>

            {/* Project Detail Modal */}
            {isModalOpen && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={closeProjectModal}
                    />

                    {/* Modal content */}
                    <div className="relative bg-slate-800 dark:bg-slate-800 light:bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 dark:border-slate-700 light:border-gray-300 shadow-2xl animate-scale-in">
                        {/* Close button */}
                        <button
                            onClick={closeProjectModal}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-gray-200/90 hover:bg-slate-900 dark:hover:bg-slate-900 light:hover:bg-gray-300 rounded-full transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Video player (if exists) */}
                        {selectedProject.videoUrl && (
                            <div className="relative aspect-video bg-black">
                                {isYouTubeUrl(selectedProject.videoUrl) ? (
                                    <iframe
                                        src={getYouTubeEmbedUrl(selectedProject.videoUrl) || ''}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={selectedProject.title}
                                    />
                                ) : (
                                    <video
                                        src={selectedProject.videoUrl}
                                        controls
                                        className="w-full h-full"
                                        autoPlay
                                        muted
                                    />
                                )}
                            </div>
                        )}

                        {/* Project image slideshow (if no video) */}
                        {!selectedProject.videoUrl && (
                            <ProjectModalSlideshow
                                project={selectedProject}
                                onImageClick={(imageUrl) => {
                                    setSelectedImage(imageUrl);
                                    setShowImageViewer(true);
                                }}
                            />
                        )}

                        {/* Project details */}
                        <div className="p-8">
                            <span className="text-sm text-indigo-400 uppercase tracking-wider font-semibold">
                                {selectedProject.category}
                            </span>
                            <h2 className="text-3xl font-bold mt-2 mb-4 dark:text-white light:text-gray-900">{selectedProject.title}</h2>
                            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                                {selectedProject.description}
                            </p>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Technologies Used
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.tech.map((tech, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-700/50 dark:bg-slate-700/50 light:bg-gray-100 rounded-lg text-sm font-medium border border-slate-600 dark:border-slate-600 light:border-gray-300 dark:text-white light:text-gray-900">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Projects Modal */}
            {showAllProjects && (() => {
                const itemsPerPage = 4;
                const totalPages = Math.ceil(projects.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentProjects = projects.slice(startIndex, endIndex);

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => {
                                setShowAllProjects(false);
                                setCurrentPage(1);
                            }}
                        />

                        {/* Modal content */}
                        <div className="relative bg-slate-900 dark:bg-slate-900 light:bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] flex flex-col border border-slate-700 dark:border-slate-700 light:border-gray-300 shadow-2xl animate-scale-in">
                            {/* Header */}
                            <div className="flex-shrink-0 bg-slate-900 dark:bg-slate-900 light:bg-white border-b border-slate-700 dark:border-slate-700 light:border-gray-300 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                        All Projects <span className="text-sm text-gray-400">({projects.length} total)</span>
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowAllProjects(false);
                                            setCurrentPage(1);
                                        }}
                                        className="p-2 bg-slate-800/90 dark:bg-slate-800/90 light:bg-gray-200/90 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-gray-300 rounded-full transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Projects Grid - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentProjects.map((project) => (
                                        <article
                                            key={project.id}
                                            onClick={() => {
                                                // Always open project modal to show details with expand icon
                                                setShowAllProjects(false);
                                                openProjectModal(project);
                                            }}
                                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                                        >
                                            <div className="relative bg-slate-800 dark:bg-slate-800 light:bg-white rounded-xl overflow-hidden border border-slate-700 dark:border-slate-700 light:border-gray-200 hover:border-indigo-500 transition-colors">
                                                {/* Image Container */}
                                                <div className="aspect-video relative overflow-hidden bg-slate-700">
                                                    <ProjectCardGallery project={project} />
                                                </div>

                                                {/* Info */}
                                                <div className="p-4">
                                                    <span className="inline-block px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded text-xs uppercase font-semibold mb-2">
                                                        {project.category}
                                                    </span>
                                                    <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                        {project.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 line-clamp-2 mb-3">
                                                        {project.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.tech.slice(0, 3).map((tech, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-indigo-600/10 border border-indigo-600/20 rounded text-xs text-indigo-300">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                        {project.tech.length > 3 && (
                                                            <span className="px-2 py-0.5 text-xs text-gray-500">
                                                                +{project.tech.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex-shrink-0 border-t border-slate-700 dark:border-slate-700 light:border-gray-300 px-3 sm:px-6 py-3 sm:py-4 bg-slate-900 dark:bg-slate-900 light:bg-white">
                                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-0">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span className="hidden sm:inline">Previous</span>
                                            <span className="sm:hidden">Prev</span>
                                        </button>

                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-800 dark:bg-slate-800 light:bg-gray-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                        >
                                            Next
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-center text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3">
                                        Showing {startIndex + 1}-{Math.min(endIndex, projects.length)} of {projects.length}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}


            {/* Image Viewer Modal */}
            {showImageViewer && selectedImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                        onClick={() => {
                            setShowImageViewer(false);
                            setSelectedImage(null);
                        }}
                    />

                    {/* Modal content */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setShowImageViewer(false);
                                setSelectedImage(null);
                            }}
                            className="absolute top-4 right-4 z-10 p-3 bg-slate-900/90 hover:bg-slate-900 rounded-full transition-colors group"
                            aria-label="Close image viewer"
                        >
                            <X className="w-7 h-7 group-hover:rotate-90 transition-transform" />
                        </button>

                        {/* Download button */}
                        <a
                            href={selectedImage}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-4 right-20 z-10 p-3 bg-slate-900/90 hover:bg-slate-900 rounded-full transition-colors group"
                            aria-label="Download image"
                        >
                            <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>

                        {/* Image */}
                        <div className="relative max-w-7xl max-h-[90vh] animate-scale-in">
                            <Image
                                src={selectedImage}
                                alt="Full size preview"
                                width={1920}
                                height={1080}
                                className="object-contain max-h-[90vh] rounded-lg shadow-2xl"
                                unoptimized={selectedImage.endsWith('.gif')}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/90 rounded-full text-sm text-gray-300">
                            Click outside to close
                        </div>
                    </div>
                </div>
            )}



            {/* Skills Section */}
            <section id="skills" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div ref={skillsHeaderAnimation.ref}>
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 text-center scroll-animate ${skillsHeaderAnimation.isVisible ? 'animate-fade-in-scale' : ''
                            }`}>Skills & Expertise</h2>
                        <p className={` text-center mb-12 scroll-animate ${skillsHeaderAnimation.isVisible ? 'animate-slide-in-right' : ''
                            }`} style={{ animationDelay: '0.2s' }}>Tools and technologies I work with</p>
                    </div>

                    <SkillsGrid skills={skills} />
                </div>
            </section>

            {/* GitHub Section */}
            <section id="github" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div ref={githubHeaderAnimation.ref}>
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 text-center scroll-animate ${githubHeaderAnimation.isVisible ? 'animate-fade-in-scale' : ''
                            }`}>Open Source</h2>
                        <p className={` text-center mb-8 scroll-animate ${githubHeaderAnimation.isVisible ? 'animate-slide-in-left' : ''
                            }`} style={{ animationDelay: '0.2s' }}>Check out my work on GitHub</p>
                    </div>

                    <div className="flex justify-center mb-12">
                        <a
                            href="https://github.com/VenVil835"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-gray-100 rounded-xl font-semibold transition-all transform hover:scale-105 border border-slate-700 dark:border-slate-700 light:border-gray-300 text-white dark:text-white light:text-gray-900"
                        >
                            <Github className="w-6 h-6 text-white dark:text-white light:text-gray-900" />
                            View GitHub Profile
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {githubRepos.length > 0 && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {githubRepos.map((repo) => (
                                <a
                                    key={repo.id}
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition-all hover:scale-[1.02]"
                                >
                                    <h3 className="font-bold text-lg mb-2 text-violet-400">{repo.name}</h3>
                                    <p className="text-sm mb-4 line-clamp-2">
                                        {repo.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-white">
                                        {repo.language && (
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                                {repo.language}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            {repo.stars}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GitFork className="w-4 h-4" />
                                            {repo.forks}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div ref={contactHeaderAnimation.ref}>
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 text-center scroll-animate ${contactHeaderAnimation.isVisible ? 'animate-fade-in-scale' : ''
                            }`}>Let&apos;s Work Together</h2>
                        <p className={` text-center text-xl mb-12 scroll-animate ${contactHeaderAnimation.isVisible ? 'animate-slide-in-right' : ''
                            }`} style={{ animationDelay: '0.2s' }}>
                            Have a project in mind? Let&apos;s create something amazing together.
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 mb-12">
                        <a
                            href="mailto:hello@example.com"
                            className="p-4 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-600 light:hover:bg-indigo-500 rounded-full transition-all transform hover:scale-110 border dark:border-transparent light:border-gray-300"
                            aria-label="Email"
                        >
                            <Mail className="w-6 h-6 text-white dark:text-white light:text-gray-900" />
                        </a>
                        <a
                            href="https://github.com/VenVil835"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-600 light:hover:bg-indigo-500 rounded-full transition-all transform hover:scale-110 border dark:border-transparent light:border-gray-300"
                            aria-label="GitHub"
                        >
                            <Github className="w-6 h-6 text-white dark:text-white light:text-gray-900" />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/rovenado-nesta-villotes-31b716342/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-600 light:hover:bg-indigo-500 rounded-full transition-all transform hover:scale-110 border dark:border-transparent light:border-gray-300"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-6 h-6 text-white dark:text-white light:text-gray-900" />
                        </a>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white/80 backdrop-blur rounded-2xl p-8 border border-slate-700 dark:border-slate-700 light:border-gray-300">
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    maxLength={255}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="message" className="block text-sm font-medium mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                minLength={10}
                                maxLength={5000}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-900/50 dark:bg-slate-900/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none dark:text-white light:text-gray-900"
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        {/* Form status messages */}
                        {formState.status === 'success' && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{formState.message}</p>
                            </div>
                        )}

                        {formState.status === 'error' && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{formState.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={formState.status === 'loading' || !csrfToken}
                            className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-semibold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                        >
                            {formState.status === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-800 dark:border-slate-800 light:border-gray-300">
                <div className="max-w-7xl mx-auto text-center text-gray-400 dark:text-gray-400 light:text-gray-600">
                    <p>© {new Date().getFullYear()} Ven.Dev. Built with Next.js & React.</p>
                </div>
            </footer>
        </div>
    );
}
