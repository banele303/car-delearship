import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// NOTE: us.i.posthog.com is the INGESTION host (for sending events from the browser).
//       HogQL API queries must go to us.posthog.com (the main app host) instead.
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

    const fetchHogQL = async (query: string) => {
      const res = await fetch(`${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`
        },
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: query
          }
        }),
        // Do NOT cache on the server — we always want fresh data
        cache: 'no-store',
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`PostHog API error: ${res.status} ${res.statusText} — ${errText.slice(0, 300)}`);
      }
      return res.json();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // IMPORTANT: All $ signs inside backtick template literals MUST be escaped
    // as \$ to prevent JavaScript from treating them as template expressions.
    // e.g. '$pageview' in a template literal becomes '' because JS tries to
    // evaluate ${pageview} — so we use '\$pageview' everywhere below.
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Daily visitor traffic — last 30 days, using toDate() (safe in HogQL)
    const trafficQuery = `
      SELECT
        toDate(timestamp) as day,
        count() as pageviews,
        uniq(distinct_id) as visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - interval 30 day
      GROUP BY day
      ORDER BY day ASC
    `;

    // 2. Top Pages — last 30 days
    const pagesQuery = `
      SELECT
        properties.\$pathname as path,
        count() as views,
        uniq(distinct_id) as unique_visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - interval 30 day
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    // 3. Traffic Sources — last 30 days
    const sourcesQuery = `
      SELECT
        if(
          empty(toString(properties.\$referrer_domain)) OR properties.\$referrer_domain = '',
          'Direct',
          toString(properties.\$referrer_domain)
        ) as source,
        count() as views,
        uniq(distinct_id) as visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - interval 30 day
      GROUP BY source
      ORDER BY views DESC
      LIMIT 8
    `;

    // 4. Device breakdown — last 30 days
    const deviceQuery = `
      SELECT
        properties.\$device_type as device,
        count() as count
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - interval 30 day
      GROUP BY device
      ORDER BY count DESC
    `;

    // 5. Summary — total unique visitors + total pageviews — last 30 days
    const summaryQuery = `
      SELECT
        uniq(distinct_id) as total_visitors,
        countIf(event = '\$pageview') as total_pageviews
      FROM events
      WHERE timestamp > now() - interval 30 day
    `;

    // 6. Country breakdown — last 30 days
    const countryQuery = `
      SELECT
        properties.\$geoip_country_name as country,
        count() as views,
        uniq(distinct_id) as visitors
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - interval 30 day
        AND notEmpty(toString(properties.\$geoip_country_name))
      GROUP BY country
      ORDER BY views DESC
      LIMIT 8
    `;

    // 7. Hourly activity heatmap — last 7 days (all events, not just pageview)
    const hourlyQuery = `
      SELECT
        toHour(timestamp) as hour,
        toDayOfWeek(timestamp) as dow,
        count() as events
      FROM events
      WHERE event = '\$pageview'
        AND timestamp > now() - interval 7 day
      GROUP BY hour, dow
      ORDER BY dow, hour
    `;

    // 8. Active users in the last 5 minutes
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

    // Normalise device data — PostHog may return null/empty for Desktop
    const rawDevices: Record<string, number> = {};
    for (const row of (deviceRes.results ?? [])) {
      const type = (row[0] || 'Desktop') as string;
      rawDevices[type] = (rawDevices[type] || 0) + (row[1] as number);
    }

    // Format date labels for the traffic chart: "Feb 27"
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
