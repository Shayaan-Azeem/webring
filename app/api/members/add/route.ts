import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, website, year } = body;

    // Validation
    if (!name || !website || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: name, website, and year are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(website);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    // Validate year
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2040) {
      return NextResponse.json(
        { error: 'Invalid graduation year' },
        { status: 400 }
      );
    }

    // Check if website already exists
    const existing = await sql`
      SELECT id FROM webring_members WHERE website = ${website}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This website is already in the webring' },
        { status: 409 }
      );
    }

    // Insert new member
    const result = await sql`
      INSERT INTO webring_members (name, website, year)
      VALUES (${name}, ${website}, ${yearNum})
      RETURNING id, name, website, year, created_at
    `;

    const newMember = result.rows[0];

    return NextResponse.json(
      { 
        message: 'Successfully added to webring',
        member: newMember 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding member:', error);
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'This website is already in the webring' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add member to webring' },
      { status: 500 }
    );
  }
}

