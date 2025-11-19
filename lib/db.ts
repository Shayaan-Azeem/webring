import { sql } from '@vercel/postgres';

export interface WebringMember {
  id: number;
  name: string;
  website: string;
  year: number;
  created_at: Date;
}

export async function getAllMembers(): Promise<WebringMember[]> {
  try {
    const { rows } = await sql`
      SELECT id, name, website, year, created_at 
      FROM webring_members 
      ORDER BY created_at ASC
    `;
    return rows as WebringMember[];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

export async function getMemberByWebsite(website: string): Promise<WebringMember | null> {
  try {
    const { rows } = await sql`
      SELECT id, name, website, year, created_at 
      FROM webring_members 
      WHERE website ILIKE ${'%' + website + '%'}
      LIMIT 1
    `;
    return rows[0] as WebringMember || null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function getNextMember(currentWebsite: string): Promise<WebringMember | null> {
  try {
    const members = await getAllMembers();
    const currentIndex = members.findIndex(m => 
      m.website.toLowerCase().includes(currentWebsite.toLowerCase()) ||
      currentWebsite.toLowerCase().includes(m.website.toLowerCase())
    );
    
    if (currentIndex === -1) return null;
    
    const nextIndex = (currentIndex + 1) % members.length;
    return members[nextIndex];
  } catch (error) {
    console.error('Error getting next member:', error);
    return null;
  }
}

export async function getPrevMember(currentWebsite: string): Promise<WebringMember | null> {
  try {
    const members = await getAllMembers();
    const currentIndex = members.findIndex(m => 
      m.website.toLowerCase().includes(currentWebsite.toLowerCase()) ||
      currentWebsite.toLowerCase().includes(m.website.toLowerCase())
    );
    
    if (currentIndex === -1) return null;
    
    const prevIndex = currentIndex === 0 ? members.length - 1 : currentIndex - 1;
    return members[prevIndex];
  } catch (error) {
    console.error('Error getting prev member:', error);
    return null;
  }
}

// Initialize database table
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS webring_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        website VARCHAR(500) NOT NULL UNIQUE,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

