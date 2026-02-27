import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers } from '@/lib/db';
import {
  generateWebringComplianceReport,
  type WebringComplianceReport,
} from '@/lib/webringCompliance';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 30 * 60 * 1000;

let cachedReport: WebringComplianceReport | null = null;
let cacheExpiresAt = 0;
let inFlightReportPromise: Promise<WebringComplianceReport> | null = null;

function getWebringOrigins(request: NextRequest): string[] {
  const origins: string[] = [];

  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (forwardedHost) {
    origins.push(`${forwardedProto}://${forwardedHost}`);
  }

  return origins;
}

export async function GET(request: NextRequest) {
  const now = Date.now();
  if (cachedReport && now < cacheExpiresAt) {
    return NextResponse.json(cachedReport, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=300',
      },
    });
  }

  try {
    if (!inFlightReportPromise) {
      inFlightReportPromise = (async () => {
        const members = await getAllMembers();
        const report = await generateWebringComplianceReport(members, {
          webringOrigins: getWebringOrigins(request),
        });

        cachedReport = report;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return report;
      })();
    }

    const report = await inFlightReportPromise;

    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json(
      { error: 'Failed to check member webring compliance' },
      { status: 500 }
    );
  } finally {
    inFlightReportPromise = null;
  }
}
