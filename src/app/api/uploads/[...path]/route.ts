import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMimeType } from '@/lib/storage-server';
import { getCurrentUser } from '@/lib/auth';

// GET /api/uploads/[...path] - Serve uploaded files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path: pathSegments } = await params;
    const filePath = pathSegments.join('/');
    const absolutePath = path.join(process.cwd(), 'uploads', filePath);
    
    // Security: Prevent directory traversal
    if (!absolutePath.startsWith(path.join(process.cwd(), 'uploads'))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(absolutePath);
    const mimeType = getMimeType(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
