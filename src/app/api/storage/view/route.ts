import { NextRequest, NextResponse } from 'next/server';
import { generateViewUrl } from '@/lib/r2';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get('key') ?? url.searchParams.get('fileName');
    const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null;
    const token = url.searchParams.get('token') ?? bearer;
    
    if (!fileName) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }
    
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

    // json=1 lets the admin viewer get the short-lived URL without putting the
    // user's access token into a URL that a third party (Google) would fetch.
    if (url.searchParams.get('json') === '1') {
      return NextResponse.json({ url: viewUrl });
    }

    return NextResponse.redirect(viewUrl);
  } catch (error: any) {
    console.error('View URL Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
