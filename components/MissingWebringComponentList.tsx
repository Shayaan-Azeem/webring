'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  MemberWebringPresence,
  WebringComplianceReport,
} from '@/lib/webringCompliance';

interface ApiError {
  error?: string;
}

export default function MissingWebringComponentList() {
  const [report, setReport] = useState<WebringComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadComplianceReport() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/webring-compliance');

        if (!response.ok) {
          const apiError = (await response.json()) as ApiError;
          throw new Error(apiError.error || 'Failed to load compliance report');
        }

        const data = (await response.json()) as WebringComplianceReport;
        if (isMounted) {
          setReport(data);
          setError(null);
        }
      } catch (loadError) {
        if (isMounted) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load compliance report';
          setError(message);
          setReport(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadComplianceReport();
    return () => {
      isMounted = false;
    };
  }, []);

  const missingMembers = useMemo(() => {
    if (!report) {
      return [];
    }

    return report.members
      .filter((member) => member.state === 'missing')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [report]);

  const checkedAtLabel = useMemo(() => {
    if (!report) {
      return '';
    }

    const date = new Date(report.checkedAt);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
  }, [report]);

  return (
    <section className="w-full border border-white/20 rounded-sm px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4">
        <h2
          className="font-latinRomanDunhillOblique text-lg sm:text-xl italic font-normal"
          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
        >
          Missing Webring Component / Link
        </h2>
        <p
          className="mt-2 font-latinMonoRegular text-sm"
          style={{ color: 'rgba(255, 255, 255, 0.55)' }}
        >
          Public list of members whose sites currently do not expose a webring widget or link.
        </p>
      </div>

      {isLoading && (
        <p
          className="font-latinMonoRegular text-sm"
          style={{ color: 'rgba(255, 255, 255, 0.55)' }}
        >
          Checking member websites...
        </p>
      )}

      {!isLoading && error && (
        <p className="font-latinMonoRegular text-sm" style={{ color: 'rgba(248, 113, 113, 0.9)' }}>
          {error}
        </p>
      )}

      {!isLoading && !error && report && (
        <div>
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 font-latinMonoRegular text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.65)' }}
          >
            <span>Total: {report.totalMembers}</span>
            <span>Found: {report.foundCount}</span>
            <span>Missing: {report.missingCount}</span>
            <span>Unreachable: {report.unreachableCount}</span>
            {checkedAtLabel && <span>Checked: {checkedAtLabel}</span>}
          </div>

          {missingMembers.length === 0 ? (
            <p className="font-latinRoman text-base" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              No sites are currently missing the webring component/link.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <th
                      className="text-left pb-3 pr-6 font-latinRomanDunhillOblique text-base italic font-normal"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      NAME
                    </th>
                    <th
                      className="text-left pb-3 pr-6 font-latinRomanDunhillOblique text-base italic font-normal"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      YEAR
                    </th>
                    <th
                      className="text-left pb-3 font-latinRomanDunhillOblique text-base italic font-normal"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      URL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {missingMembers.map((member: MemberWebringPresence) => (
                    <tr key={member.id}>
                      <td
                        className="py-3 pr-6 font-latinRomanCaps text-base align-top"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        {member.name}
                      </td>
                      <td
                        className="py-3 pr-6 font-latinRoman text-base align-top"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        {member.year}
                      </td>
                      <td className="py-3 font-latinMonoRegular text-base align-top">
                        <a
                          href={member.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline transition-colors"
                          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                          }}
                        >
                          {member.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
