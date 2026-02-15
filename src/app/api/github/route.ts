import { NextResponse } from 'next/server';

/**
 * GitHub API Integration
 * 
 * Fetches public repositories for display on the portfolio.
 * Implements caching to avoid GitHub API rate limits.
 */

interface GitHubApiRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[];
    pushed_at: string;
}

interface TransformedRepo {
    id: number;
    name: string;
    description: string | null;
    url: string;
    homepage: string | null;
    stars: number;
    forks: number;
    language: string | null;
    topics: string[];
    updatedAt: string;
}

interface CachedData {
    repos: TransformedRepo[];
    timestamp: number;
}

// Simple in-memory cache
let cache: CachedData | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/github
 * 
 * Returns the user's top GitHub repositories.
 * Results are cached for 10 minutes to prevent rate limiting.
 */
export async function GET() {
    const username = process.env.GITHUB_USERNAME;

    if (!username) {
        return NextResponse.json(
            { error: 'GitHub username not configured', repos: [] },
            { status: 200 } // Return 200 with empty repos so UI doesn't break
        );
    }

    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        return NextResponse.json(
            { repos: cache.repos, cached: true },
            {
                headers: {
                    'Cache-Control': 'public, max-age=600',
                },
            }
        );
    }

    try {
        // Build headers for GitHub API
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-App',
        };

        // Use token if available for higher rate limits
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`,
            {
                headers,
                next: { revalidate: 600 },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'GitHub user not found', repos: [] },
                    { status: 200 }
                );
            }
            if (response.status === 403) {
                return NextResponse.json(
                    { error: 'GitHub API rate limit exceeded', repos: cache?.repos || [] },
                    { status: 200 }
                );
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos: GitHubApiRepo[] = await response.json();

        // Transform repos to our format
        const transformedRepos: TransformedRepo[] = repos
            .filter((repo) => !repo.name.includes('.github'))
            .slice(0, 6)
            .map((repo) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                homepage: repo.homepage,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                topics: repo.topics,
                updatedAt: repo.pushed_at,
            }));

        // Update cache
        cache = {
            repos: transformedRepos,
            timestamp: Date.now(),
        };

        return NextResponse.json(
            { repos: transformedRepos, cached: false },
            {
                headers: {
                    'Cache-Control': 'public, max-age=600',
                },
            }
        );

    } catch (error) {
        console.error('GitHub API error:', error);

        // Return cached data if available, even if stale
        if (cache) {
            return NextResponse.json(
                { repos: cache.repos, cached: true, stale: true },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch GitHub repositories', repos: [] },
            { status: 200 }
        );
    }
}
