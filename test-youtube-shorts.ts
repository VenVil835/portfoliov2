// Test YouTube Shorts URL parsing
import { isYouTubeUrl, getYouTubeVideoId, getYouTubeEmbedUrl } from './src/lib/youtube';

const testUrls = [
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://youtube.com/shorts/abc123defgh',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/abc123defgh'
];

console.log('Testing YouTube URL parsing with Shorts support:\n');

testUrls.forEach(url => {
    console.log(`URL: ${url}`);
    console.log(`  Is YouTube: ${isYouTubeUrl(url)}`);
    console.log(`  Video ID: ${getYouTubeVideoId(url)}`);
    console.log(`  Embed URL: ${getYouTubeEmbedUrl(url)}`);
    console.log('');
});
