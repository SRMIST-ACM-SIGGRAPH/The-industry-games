import { NextRequest, NextResponse } from 'next/server';
import { generateUploadUrl, deleteObject } from '@/lib/r2';
import { createClient } from '@supabase/supabase-js';
import { isSubmissionClosed } from '@/lib/event';

export async function POST(req: NextRequest) {
  try {
    if (isSubmissionClosed()) {
      return NextResponse.json({ error: 'Submissions have closed for this event.' }, { status: 403 });
    }

    const { fileName, contentType, oldFileName } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Missing fileName or contentType' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Delete the old file from R2 if one exists
    if (oldFileName) {
      try {
        await deleteObject(oldFileName);
      } catch (err) {
        console.error('Failed to delete old object:', err);
      }
    }

    // Generate the presigned URL
    const uploadUrl = await generateUploadUrl(fileName, contentType);

    return NextResponse.json({ uploadUrl });
  } catch (error: any) {
    console.error('Upload URL Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
