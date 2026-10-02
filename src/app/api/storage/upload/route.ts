import { NextRequest, NextResponse } from 'next/server';
import { generateUploadUrl, deleteObject } from '@/lib/r2';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType, oldFileName } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Missing fileName or contentType' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
