import { NextRequest, NextResponse } from 'next/server';
import { getNextMember, getPrevMember } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currentSite = searchParams.get('site');
  const direction = searchParams.get('dir');

  if (!currentSite || !direction) {
    return NextResponse.json(
      { error: 'Missing site or direction parameter' },
      { status: 400 }
    );
  }

  try {
    const member = direction === 'next' 
      ? await getNextMember(currentSite)
      : await getPrevMember(currentSite);

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to navigate' },
      { status: 500 }
    );
  }
}

