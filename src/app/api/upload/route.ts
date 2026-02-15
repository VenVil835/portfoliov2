import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(request: NextRequest) {
    try {
        // Check if Blob token is configured
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('BLOB_READ_WRITE_TOKEN is not set in environment variables');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Server configuration error: BLOB_READ_WRITE_TOKEN not set. Please add it to your .env.local file.'
                },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'image' or 'video'

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (type === 'image') {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid image type. Allowed: JPG, PNG, GIF, WebP' },
                    { status: 400 }
                );
            }
            if (file.size > MAX_IMAGE_SIZE) {
                return NextResponse.json(
                    { success: false, error: `Image too large. Max size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
                    { status: 400 }
                );
            }
        } else if (type === 'video') {
            if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid video type. Allowed: MP4, WebM, MOV' },
                    { status: 400 }
                );
            }
            if (file.size > MAX_VIDEO_SIZE) {
                return NextResponse.json(
                    { success: false, error: `Video too large. Max size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB` },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid type. Must be "image" or "video"' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        const ext = file.name.split('.').pop();
        const filename = `${type}s/${timestamp}-${random}.${ext}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false, // We already added our own suffix
        });

        // Return blob URL
        return NextResponse.json({
            success: true,
            path: blob.url,
            filename: filename,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
