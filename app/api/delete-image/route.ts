import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    // Delete the image from Cloudinary using the admin/uploader API
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
