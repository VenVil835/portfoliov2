# IMPORTANT: Setup Required for File Uploads

## The Problem

Your file uploads are failing because the **`BLOB_READ_WRITE_TOKEN`** environment variable is missing from your `.env.local` file.

Without this token, the Vercel Blob storage cannot function, and uploads will fail with "Failed to upload file" error.

---

## Quick Fix: Get Your Blob Token

### Option 1: Create a Vercel Blob Store (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (or any project if testing locally)
3. **Navigate to Storage tab**
4. **Create a Blob store**:
   - Click "Create Database" or "Create Store"
   - Select "Blob"
   - Give it a name (e.g., "portfolio-uploads")
   - Click "Create"
5. **Copy the token**:
   - After creation, you'll see environment variables
   - Copy the value of `BLOB_READ_WRITE_TOKEN`
   - It looks like: `vercel_blob_rw_XXXXXXXXXX_YYYYYYYYYY`

### Option 2: Use Vercel CLI (Faster)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Create a Blob store
vercel storage create blob portfolio-uploads

# The token will be automatically added to your project
```

---

## Add Token to .env.local

Open your `.env.local` file and add:

```env
# Add this line with your actual token
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXX_YYYYYYYYYY"
```

Your `.env.local` should now look like:

```env
ADMIN_USER=admin
ADMIN_PASSWORD_HASH=$2b$10$ptr/kXycIkJceEwzFLn6vu73kaSfJWkxoAY84EDjJaXDNs79X1bz2
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_YOUR_TOKEN_HERE"
```

---

## Restart Your Dev Server

After adding the token:

1. **Stop the dev server** (Ctrl+C in terminal)
2. **Restart it**: `npm run dev`
3. **Test the upload** by going to `/admin/projects/new` and uploading an image

---

## Verify It's Working

### You should see:
- ✅ File uploads successfully
- ✅ No "Failed to upload file" error
- ✅ Image preview appears immediately
- ✅ In Vercel Dashboard → Storage → Blob, you'll see the uploaded file

### If still failing:
- Check the terminal for error messages
- Check the browser console (F12) for errors
- Verify the token is correct (no extra quotes or spaces)
- Make sure you restarted the dev server after adding the token

---

## For Production (Vercel Deployment)

The same token needs to be added to your Vercel project:

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your token (same as local)
   - **Environment**: Production (and Preview if needed)
4. **Save** and **redeploy** your application

---

## Why This Is Required

- Vercel Blob is a cloud storage service
- It requires authentication via the token
- Without it, the `put()` function cannot upload files
- The token is specific to your Vercel account/project
- **FREE TIER**: 500MB storage, 1GB bandwidth/month
