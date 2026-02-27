import { WebringMember } from '@/lib/db';

export type WebringPresenceState = 'found' | 'missing' | 'unreachable';

export interface MemberWebringPresence {
  id: number;
  name: string;
  website: string;
  year: number;
  state: WebringPresenceState;
  reason: string;
}

export interface WebringComplianceReport {
  checkedAt: string;
  totalMembers: number;
  foundCount: number;
  missingCount: number;
  unreachableCount: number;
  members: MemberWebringPresence[];
}

interface ComplianceOptions {
  webringOrigins: string[];
  timeoutMs?: number;
  concurrency?: number;
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CONCURRENCY = 6;
const MAX_HTML_CHARS = 350_000;

function normalizeOrigin(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeHost(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function extractLinksFromHtml(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let match = linkRegex.exec(html);

  while (match !== null) {
    links.push(match[1].trim());
    match = linkRegex.exec(html);
  }

  return links;
}

function hasWidgetMarkup(html: string): boolean {
  if (/id\s*=\s*["']webring-widget["']/.test(html)) {
    return true;
  }

  const hasDataSite = /data-site\s*=\s*["'][^"']+["']/.test(html);
  const hasWidgetScript = /widget\.js/.test(html);

  return hasDataSite && hasWidgetScript;
}

function linkPointsToWebring(
  rawLink: string,
  pageUrl: string,
  webringOrigins: string[],
  webringHosts: Set<string>
): boolean {
  const directMatch = webringOrigins.some((origin) =>
    rawLink.toLowerCase().includes(origin)
  );
  if (directMatch) {
    return true;
  }

  try {
    const resolved = new URL(rawLink, pageUrl);
    const host = resolved.hostname.toLowerCase().replace(/^www\./, '');
    return webringHosts.has(host);
  } catch {
    return false;
  }
}

function hasWebringLink(
  html: string,
  pageUrl: string,
  webringOrigins: string[],
  webringHosts: Set<string>
): boolean {
  const links = extractLinksFromHtml(html);
  return links.some((link) =>
    linkPointsToWebring(link, pageUrl, webringOrigins, webringHosts)
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  });

  await Promise.all(workers);
  return results;
}

async function checkMemberWebsite(
  member: WebringMember,
  webringOrigins: string[],
  webringHosts: Set<string>,
  timeoutMs: number
): Promise<MemberWebringPresence> {
  let checkedWebsite = member.website;
  try {
    checkedWebsite = new URL(member.website).toString();
  } catch {
    return {
      id: member.id,
      name: member.name,
      website: member.website,
      year: member.year,
      state: 'unreachable',
      reason: 'Invalid member URL',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(checkedWebsite, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'uw-cs-webring-checker/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        id: member.id,
        name: member.name,
        website: member.website,
        year: member.year,
        state: 'unreachable',
        reason: `HTTP ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (contentType && !contentType.includes('text/html')) {
      return {
        id: member.id,
        name: member.name,
        website: member.website,
        year: member.year,
        state: 'unreachable',
        reason: `Unsupported content type: ${contentType}`,
      };
    }

    const html = (await response.text()).slice(0, MAX_HTML_CHARS).toLowerCase();
    const hasWidget = hasWidgetMarkup(html);
    const hasLink = hasWebringLink(html, checkedWebsite, webringOrigins, webringHosts);

    if (hasWidget || hasLink) {
      return {
        id: member.id,
        name: member.name,
        website: member.website,
        year: member.year,
        state: 'found',
        reason: hasWidget ? 'Webring widget detected' : 'Webring link detected',
      };
    }

    return {
      id: member.id,
      name: member.name,
      website: member.website,
      year: member.year,
      state: 'missing',
      reason: 'No webring widget or webring link detected',
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? `Timed out after ${timeoutMs}ms`
        : 'Could not fetch website';

    return {
      id: member.id,
      name: member.name,
      website: member.website,
      year: member.year,
      state: 'unreachable',
      reason: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateWebringComplianceReport(
  members: WebringMember[],
  options: ComplianceOptions
): Promise<WebringComplianceReport> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  const normalizedOrigins = unique(
    options.webringOrigins
      .map((origin) => normalizeOrigin(origin))
      .filter((origin): origin is string => Boolean(origin))
  );

  const webringHosts = new Set(
    normalizedOrigins
      .map((origin) => normalizeHost(origin))
      .filter((host): host is string => Boolean(host))
  );

  const checkedMembers = await mapWithConcurrency(members, concurrency, (member) =>
    checkMemberWebsite(member, normalizedOrigins, webringHosts, timeoutMs)
  );

  const foundCount = checkedMembers.filter((member) => member.state === 'found').length;
  const missingCount = checkedMembers.filter((member) => member.state === 'missing').length;
  const unreachableCount = checkedMembers.filter((member) => member.state === 'unreachable').length;

  return {
    checkedAt: new Date().toISOString(),
    totalMembers: checkedMembers.length,
    foundCount,
    missingCount,
    unreachableCount,
    members: checkedMembers,
  };
}
