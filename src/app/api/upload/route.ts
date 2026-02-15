import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(request: NextRequest) {
    try {
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
        const ext = path.extname(file.name);
        const filename = `${timestamp}-${random}${ext}`;

        // Determine directory
        const subDir = type === 'image' ? 'images' : 'videos';
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating directory:', error);
        }

        // Save file
        const filePath = path.join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Return public path
        const publicPath = `/uploads/${subDir}/${filename}`;

        return NextResponse.json({
            success: true,
            path: publicPath,
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
