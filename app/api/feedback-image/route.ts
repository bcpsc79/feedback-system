import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId query parameter' }, { status: 400 });
    }

    // Generate secure signature valid for 30 minutes (1800 seconds)
    const secureSignedUrl = cloudinary.url(publicId, {
      type: 'authenticated', 
      sign_url: true,        
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      secure: true,          
    });

    return NextResponse.json({ url: secureSignedUrl }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Token generation subsystem failure' }, { status: 500 });
  }
}
