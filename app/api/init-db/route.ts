import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS webring_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        website VARCHAR(500) NOT NULL UNIQUE,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if table is empty
    const count = await sql`SELECT COUNT(*) FROM webring_members`;
    const isEmpty = parseInt(count.rows[0].count) === 0;

    // Add sample data if empty
    if (isEmpty) {
      await sql`
        INSERT INTO webring_members (name, website, year) VALUES
        ('Sample Member 1', 'https://example1.com', 2025),
        ('Sample Member 2', 'https://example2.com', 2026),
        ('Sample Member 3', 'https://example3.com', 2024)
        ON CONFLICT (website) DO NOTHING
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      sampleDataAdded: isEmpty,
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

