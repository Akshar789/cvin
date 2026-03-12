import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const PHOTO_DIR = path.join(process.cwd(), 'public', 'userdata', 'profilephotos');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

function ensurePhotoDir() {
  if (!fs.existsSync(PHOTO_DIR)) {
    fs.mkdirSync(PHOTO_DIR, { recursive: true });
  }
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo file provided' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG or PNG images only.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    ensurePhotoDir();

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `${user.userId}.${extension}`;
    const filepath = path.join(PHOTO_DIR, filename);

    const oldFiles = fs.readdirSync(PHOTO_DIR).filter(f => f.startsWith(`${user.userId}.`));
    oldFiles.forEach(f => {
      try {
        fs.unlinkSync(path.join(PHOTO_DIR, f));
      } catch (e) {
      }
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);

    const photoURL = `/userdata/profilephotos/${filename}?t=${Date.now()}`;

    await db
      .update(users)
      .set({
        profilePicture: photoURL,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.userId));

    return NextResponse.json({
      success: true,
      photoURL,
      message: 'Photo uploaded successfully',
    });

  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    ensurePhotoDir();

    const oldFiles = fs.readdirSync(PHOTO_DIR).filter(f => f.startsWith(`${user.userId}.`));
    oldFiles.forEach(f => {
      try {
        fs.unlinkSync(path.join(PHOTO_DIR, f));
      } catch (e) {
      }
    });

    await db
      .update(users)
      .set({
        profilePicture: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.userId));

    return NextResponse.json({
      success: true,
      message: 'Photo removed successfully',
    });

  } catch (error: any) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove photo' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const [userData] = await db
      .select({ profilePicture: users.profilePicture })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    return NextResponse.json({
      photoURL: userData?.profilePicture || null,
    });

  } catch (error: any) {
    console.error('Get photo error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get photo' },
      { status: 500 }
    );
  }
});
