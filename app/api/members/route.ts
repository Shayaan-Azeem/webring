import { NextResponse } from 'next/server';
import { getAllMembers } from '@/lib/db';

export async function GET() {
  try {
    const members = await getAllMembers();
    return NextResponse.json({ members });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

