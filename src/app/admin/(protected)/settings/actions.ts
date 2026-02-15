'use server';

import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

interface UpdateCredentialsResult {
    success: boolean;
    message: string;
}

export async function updateCredentials(formData: FormData): Promise<UpdateCredentialsResult> {
    // Verify user is authenticated
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: 'Unauthorized' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newUsername = formData.get('newUsername') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (!currentPassword) {
        return { success: false, message: 'Current password is required' };
    }

    if (!newUsername || newUsername.trim().length === 0) {
        return { success: false, message: 'New username is required' };
    }

    if (newPassword && newPassword !== confirmPassword) {
        return { success: false, message: 'New passwords do not match' };
    }

    // Read credentials from .env.local file (takes precedence over .env)
    // We read from file instead of process.env because server actions may not have
    // access to all environment variables
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');

    let currentUser: string | undefined;
    let currentHash: string | undefined;

    try {
        // Try reading from .env.local first (higher priority)
        try {
            const envLocalContent = await fs.readFile(envLocalPath, 'utf-8');
            const userMatch = envLocalContent.match(/^ADMIN_USER=(.*)$/m);
            const hashMatch = envLocalContent.match(/^ADMIN_PASSWORD_HASH=(.*)$/m);

            if (userMatch) currentUser = userMatch[1].trim().replace(/^["']|["']$/g, '');
            if (hashMatch) currentHash = hashMatch[1].trim().replace(/^["']|["']$/g, '');
        } catch (_error) {
            // .env.local doesn't exist, will try .env next
            console.log('.env.local not found, trying .env');
        }

        // Fallback to .env if not found in .env.local
        if (!currentUser || !currentHash) {
            const envContent = await fs.readFile(envPath, 'utf-8');
            const userMatch = envContent.match(/^ADMIN_USER=(.*)$/m);
            const hashMatch = envContent.match(/^ADMIN_PASSWORD_HASH=(.*)$/m);

            if (userMatch && !currentUser) currentUser = userMatch[1].trim().replace(/^["']|["']$/g, '');
            if (hashMatch && !currentHash) currentHash = hashMatch[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (error) {
        console.error('Error reading environment files:', error);
        return { success: false, message: 'Failed to read credentials configuration' };
    }

    // Debug logging
    console.log('=== SETTINGS ACTION DEBUG ===');
    console.log('ADMIN_USER:', currentUser);
    console.log('ADMIN_PASSWORD_HASH:', currentHash ? `${currentHash.substring(0, 20)}...` : 'undefined');
    console.log('===========================');

    if (!currentUser || !currentHash) {
        console.error('Environment variables not found. Current user:', currentUser, 'Has hash:', !!currentHash);
        return { success: false, message: 'Admin credentials not configured' };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, currentHash);
    if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' };
    }

    try {
        // Prepare new values
        const updatedUsername = newUsername.trim();
        const updatedHash = newPassword
            ? await bcrypt.hash(newPassword, 10)
            : currentHash;

        // Update both .env and .env.local files
        // .env.local takes precedence in Next.js, so we need to update it
        const envPath = path.join(process.cwd(), '.env');
        const envLocalPath = path.join(process.cwd(), '.env.local');
        const envBackupPath = path.join(process.cwd(), '.env.backup');

        // Function to update environment file
        async function updateEnvFile(filePath: string) {
            try {
                const envContent = await fs.readFile(filePath, 'utf-8');
                let updatedContent = envContent;

                // Update ADMIN_USER (handle both quoted and unquoted values)
                const userRegex = /^ADMIN_USER=.*$/m;
                if (userRegex.test(updatedContent)) {
                    updatedContent = updatedContent.replace(
                        userRegex,
                        `ADMIN_USER=${updatedUsername}`
                    );
                } else {
                    updatedContent += `\nADMIN_USER=${updatedUsername}`;
                }

                // Update ADMIN_PASSWORD_HASH (handle both quoted and unquoted values)
                const hashRegex = /^ADMIN_PASSWORD_HASH=.*$/m;
                if (hashRegex.test(updatedContent)) {
                    updatedContent = updatedContent.replace(
                        hashRegex,
                        `ADMIN_PASSWORD_HASH=${updatedHash}`
                    );
                } else {
                    updatedContent += `\nADMIN_PASSWORD_HASH=${updatedHash}`;
                }

                await fs.writeFile(filePath, updatedContent, 'utf-8');
                return true;
            } catch (error) {
                // File might not exist, which is okay
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                    // Create the file with credentials
                    const newContent = `ADMIN_USER=${updatedUsername}\nADMIN_PASSWORD_HASH=${updatedHash}\n`;
                    await fs.writeFile(filePath, newContent, 'utf-8');
                    return true;
                }
                throw error;
            }
        }

        // Read and backup .env file
        try {
            const envContent = await fs.readFile(envPath, 'utf-8');
            await fs.writeFile(envBackupPath, envContent, 'utf-8');
        } catch (error) {
            console.error('Warning: Could not create backup:', error);
        }

        // Update .env.local first (takes precedence)
        await updateEnvFile(envLocalPath);

        // Also update .env for consistency
        await updateEnvFile(envPath);

        // IMPORTANT: Update admin-credentials.json file (this is what auth.ts actually reads!)
        const credentialsJsonPath = path.join(process.cwd(), 'src', 'admin-credentials.json');
        const credentialsData = {
            username: updatedUsername,
            passwordHash: updatedHash
        };
        await fs.writeFile(credentialsJsonPath, JSON.stringify(credentialsData, null, 2), 'utf-8');

        return {
            success: true,
            message: 'Credentials updated successfully! You can now log in with your new credentials.'
        };
    } catch (error) {
        console.error('Error updating credentials:', error);
        return {
            success: false,
            message: 'Failed to update credentials. Check server logs for details.'
        };
    }
}
