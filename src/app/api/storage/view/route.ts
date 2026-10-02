import { NextRequest, NextResponse } from 'next/server';
import { generateViewUrl } from '@/lib/r2';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get('fileName');
    
    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 });
    }

    const cookieStore = await cookies();
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
            } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authorization Check:
    // 1. Is user an Admin?
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    let isAuthorized = !!profile?.is_admin;

    // 2. If not admin, is user in the team that owns the file?
    if (!isAuthorized) {
      const { data: teamMember } = await supabase
        .from('ig_team_members')
        .select('team_id, ig_teams(submission_url)')
        .eq('user_id', user.id)
        .single();
      
      // We check if the fileName belongs to this team's submission_url
      // @ts-ignore
      if (teamMember && teamMember.ig_teams?.submission_url === fileName) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You do not have access to this file.' }, { status: 403 });
    }

    // Generate the presigned View URL
    const viewUrl = await generateViewUrl(fileName);

    return NextResponse.redirect(viewUrl);
  } catch (error: any) {
    console.error('View URL Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
