'use client';

import { WebringMember } from '@/lib/db';

interface WebringListProps {
  members: WebringMember[];
}

export default function WebringList({ members }: WebringListProps) {
  // Add dummy data if no members exist
  const displayMembers = members.length > 0 ? members : [
    { id: 1, name: 'Justin Gu', website: 'https://justin.run', year: 2026, created_at: new Date() },
    { id: 2, name: 'Jaiden Ratti', website: 'https://jaidenratti.com', year: 2026, created_at: new Date() },
    { id: 3, name: 'George Shao', website: 'https://shao.zip', year: 2026, created_at: new Date() },
    { id: 4, name: 'Jaryd Diamond', website: 'https://jaryddiamond.com', year: 2026, created_at: new Date() },
    { id: 5, name: 'Ivy Fan-Chiang', website: 'https://ivyfanchiang.ca', year: 2027, created_at: new Date() },
    { id: 6, name: 'Wilbur Zhang', website: 'https://wilburzhang.com', year: 2026, created_at: new Date() },
    { id: 7, name: 'Ching Lam Lau', website: 'https://chinglamlau.ca', year: 2029, created_at: new Date() },
    { id: 8, name: 'Martin Sit', website: 'https://martinsit.ca', year: 2029, created_at: new Date() },
    { id: 9, name: 'Kevin Huang', website: 'https://kevinh.cv', year: 2026, created_at: new Date() },
    { id: 10, name: 'Freeman Jiang', website: 'https://freemanjiang.com', year: 2026, created_at: new Date() },
    { id: 11, name: 'Aryaman Dhingra', website: 'https://aryaman.dev', year: 2025, created_at: new Date() },
    { id: 12, name: 'Gaurav Talreja', website: 'https://gaurav.fyi', year: 2025, created_at: new Date() },
    { id: 13, name: 'Dundee Zhang', website: 'https://dundeezhang.com', year: 2029, created_at: new Date() },
  ];

  return (
    <div className="mt-12 max-w-6xl">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <th className="text-left pb-3 pr-8 font-latinRomanDunhillOblique text-base italic font-normal" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              NAME
            </th>
            <th className="text-left pb-3 pr-8 font-latinRomanDunhillOblique text-base italic font-normal" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              YEAR
            </th>
            <th className="text-left pb-3 font-latinRomanDunhillOblique text-base italic font-normal" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              URL
            </th>
          </tr>
        </thead>
        <tbody>
          {displayMembers.map((member, index) => (
            <tr key={member.id}>
              <td className="py-3 pr-8 font-latinRomanCaps text-base align-top" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {member.name}
              </td>
              <td className="py-3 pr-8 font-latinRoman text-base align-top" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {member.year}
              </td>
              <td className="py-3 font-latinMonoRegular text-base align-top">
                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                >
                  {member.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

