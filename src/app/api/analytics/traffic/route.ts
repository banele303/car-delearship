import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// NOTE: us.i.posthog.com is the INGESTION host (for browser SDK events).
//       HogQL API queries must use us.posthog.com (the main dashboard host).
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

    // Date range from query param: 1d | 7d | 30d | 90d | 6m | 12m
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Map range to HogQL interval expression
    const intervalMap: Record<string, string> = {
      '1d':  'interval 1 day',
      '7d':  'interval 7 day',
      '30d': 'interval 30 day',
      '90d': 'interval 90 day',
      '6m':  'interval 6 month',
      '12m': 'interval 12 month',
    };
    const interval = intervalMap[range] || 'interval 30 day';

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

    // ─────────────────────────────────────────────────────────────────────────
    // IMPORTANT: All PostHog property names that start with $ must be written
    // as \$ inside JS template literals to avoid template expression expansion.
    // e.g. `event = '$pageview'` breaks because JS sees ${pageview} = undefined
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Daily traffic
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

    // 2. Top Pages
    const pagesQuery = `
      SELECT
        properties.\$pathname as path,
        count() as views,
        uniq(distinct_id) as unique_visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    // 3. Traffic Sources
    const sourcesQuery = `
      SELECT
        if(
          empty(toString(properties.\$referrer)) OR properties.\$referrer = '',
          'Direct',
          if(
            empty(toString(properties.\$referrer_domain)) OR properties.\$referrer_domain = '',
            toString(properties.\$referrer),
            toString(properties.\$referrer_domain)
          )
        ) as source,
        count() as views,
        uniq(distinct_id) as visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
      GROUP BY source
      ORDER BY views DESC
      LIMIT 8
    `;

    // 4. Device breakdown
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

    // 5. Summary
    const summaryQuery = `
      SELECT
        uniq(distinct_id) as total_visitors,
        countIf(event = '\$pageview') as total_pageviews
      FROM events
      WHERE timestamp > now() - ${interval}
    `;

    // 6. Country breakdown
    const countryQuery = `
      SELECT
        coalesce(toString(properties.\$geoip_country_name), 'Unknown') as country,
        count() as views,
        uniq(distinct_id) as visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
        AND notEmpty(toString(properties.\$geoip_country_name))
      GROUP BY country
      ORDER BY views DESC
      LIMIT 8
    `;

    // 7. Hourly heatmap
    const hourlyQuery = `
      SELECT
        toHour(timestamp) as hour,
        toDayOfWeek(timestamp) as dow,
        count() as events
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - ${interval}
      GROUP BY hour, dow
      ORDER BY dow, hour
    `;

    // 8. Active now (last 5 min)
    const activeNowQuery = `
      SELECT uniq(distinct_id) as active
      FROM events
      WHERE timestamp > now() - interval 5 minute
    `;

    const [
      trafficRes,
      pagesRes,
      sourcesRes,
      deviceRes,
      summaryRes,
      countryRes,
      hourlyRes,
      activeNowRes
    ] = await Promise.all([
      fetchHogQL(trafficQuery),
      fetchHogQL(pagesQuery),
      fetchHogQL(sourcesQuery),
      fetchHogQL(deviceQuery),
      fetchHogQL(summaryQuery),
      fetchHogQL(countryQuery),
      fetchHogQL(hourlyQuery),
      fetchHogQL(activeNowQuery),
    ]);

    const totalVisitors  = summaryRes.results?.[0]?.[0] ?? 0;
    const totalPageviews = summaryRes.results?.[0]?.[1] ?? 0;
    const activeNow      = activeNowRes.results?.[0]?.[0] ?? 0;

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
      traffic: (trafficRes.results ?? []).map((r: any) => ({
        name: formatDay(r[0]),
        views: r[1],
        visitors: r[2],
      })),
      pages: (pagesRes.results ?? []).map((r: any) => ({
        path: r[0] || '/',
        views: r[1],
        uniqueVisitors: r[2],
      })),
      sources: (sourcesRes.results ?? []).map((r: any) => ({
        name: r[0],
        value: r[1],
        visitors: r[2],
      })),
      devices: Object.entries(rawDevices).map(([name, count]) => ({ name, count })),
      countries: (countryRes.results ?? []).map((r: any) => ({
        country: r[0],
        views: r[1],
        visitors: r[2],
      })),
      hourly: (hourlyRes.results ?? []).map((r: any) => ({
        hour: r[0],
        dow: r[1],
        events: r[2],
      })),
      summary: {
        totalVisitors,
        totalPageviews,
        activeNow,
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
