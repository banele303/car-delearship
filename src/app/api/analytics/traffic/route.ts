import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const POSTHOG_API_HOST = 'https://us.posthog.com';
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request, ["ADMIN", "SALES_MANAGER"]);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!POSTHOG_PERSONAL_API_KEY || !POSTHOG_PROJECT_ID) {
      return NextResponse.json({
        error: 'PostHog API keys missing',
        setup_required: true
      }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Cap range to 30d max to prevent query timeouts on PostHog free tier
    const intervalMap: Record<string, string> = {
      '1d':  'interval 1 day',
      '7d':  'interval 7 day',
      '30d': 'interval 30 day',
    };
    const interval = intervalMap[range] || 'interval 7 day';

    const fetchHogQL = async (query: string) => {
      const res = await fetch(`${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
        cache: 'no-store',
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`PostHog ${res.status}: ${errText.slice(0, 400)}`);
      }
      return res.json();
    };

    // Only 3 lightweight queries — runs sequentially to respect concurrency limit

    // 1. Daily traffic (simple, fast)
    const trafficQuery = `
      SELECT
        toDate(timestamp) as day,
        count() as pageviews,
        uniq(distinct_id) as visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
      GROUP BY day
      ORDER BY day ASC
    `;

    // 2. Top Pages (simple group-by on pathname)
    const pagesQuery = `
      SELECT
        properties.\$pathname as path,
        count() as views
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    // 3. Device breakdown (lightweight)
    const deviceQuery = `
      SELECT
        coalesce(toString(properties.\$device_type), 'Desktop') as device,
        count() as count
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
      GROUP BY device
      ORDER BY count DESC
    `;

    // Run sequentially — PostHog free tier allows max 3 concurrent per team
    const trafficRes = await fetchHogQL(trafficQuery);
    const pagesRes = await fetchHogQL(pagesQuery);
    const deviceRes = await fetchHogQL(deviceQuery);

    // Calculate totals from daily traffic rows
    const trafficRows = trafficRes.results ?? [];
    let totalPageviews = 0;
    let totalVisitors = 0;
    trafficRows.forEach((r: any) => {
      totalPageviews += (r[1] || 0);
      totalVisitors += (r[2] || 0);
    });

    // Normalise device data
    const rawDevices: Record<string, number> = {};
    for (const row of (deviceRes.results ?? [])) {
      const type = (row[0] || 'Desktop') as string;
      rawDevices[type] = (rawDevices[type] || 0) + (row[1] as number);
    }

    const formatDay = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    return NextResponse.json({
      traffic: trafficRows.map((r: any) => ({
        name: formatDay(r[0]),
        views: r[1],
        visitors: r[2],
      })),
      pages: (pagesRes.results ?? []).map((r: any) => ({
        path: r[0] || '/',
        views: r[1],
        uniqueVisitors: 0,
      })),
      sources: [],
      devices: Object.entries(rawDevices).map(([name, count]) => ({ name, count })),
      countries: [],
      hourly: [],
      summary: {
        totalVisitors,
        totalPageviews,
        activeNow: 0,
        avgPagesPerVisit: totalVisitors > 0 ? +(totalPageviews / totalVisitors).toFixed(1) : 0,
      }
    });

  } catch (error) {
    console.error('[Traffic API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic data', detail: String(error) },
      { status: 500 }
    );
  }
}
