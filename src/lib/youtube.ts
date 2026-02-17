/**
 * Detects if a URL is a YouTube video URL (including Shorts)
 */
export function isYouTubeUrl(url: string): boolean {
    if (!url) return false;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    return youtubeRegex.test(url);
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID (YouTube Shorts)
 */
export function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    const regexPatterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtu\.be\/)([^?\s]+)/,
        /(?:youtube\.com\/embed\/)([^?\s]+)/,
        /(?:youtube\.com\/v\/)([^?\s]+)/,
        /(?:youtube\.com\/shorts\/)([^?\s]+)/, // YouTube Shorts support
    ];

    for (const pattern of regexPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Converts a YouTube URL to an embed URL
 * Uses youtube-nocookie.com for privacy-enhanced mode and better embedding support
 */
export function getYouTubeEmbedUrl(url: string): string | null {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    // Use nocookie domain for privacy-enhanced mode and better embedding compatibility
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
