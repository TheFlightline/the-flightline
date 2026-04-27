/**
 * The Flightline — Google Distance Matrix Proxy
 * URL: /.netlify/functions/traffic-proxy
 *
 * Proxies Google Distance Matrix API requests server-side so the API key
 * is never exposed in client-side code. Returns live traffic-aware drive
 * time in seconds from a given origin to Pensacola Beach (Casino Beach).
 *
 * Query params:
 *   origin_lat, origin_lng — origin coordinates
 *
 * Response: { ok: true, duration_seconds: 780, updated: "2026-04-27T02:45:00Z" }
 */

const DESTINATION = '30.3340,-87.1421'; // Casino Beach, Pensacola Beach

exports.handler = async function(event) {
  const { origin_lat, origin_lng } = event.queryStringParameters || {};

  if (!origin_lat || !origin_lng) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: 'Missing origin_lat or origin_lng' })
    };
  }

  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'API key not configured' })
    };
  }

  const origin = `${origin_lat},${origin_lng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${encodeURIComponent(origin)}` +
    `&destinations=${encodeURIComponent(DESTINATION)}` +
    `&departure_time=now` +
    `&traffic_model=best_guess` +
    `&key=${key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Google API ' + res.status);
    const data = await res.json();

    const el = data?.rows?.[0]?.elements?.[0];
    if (!el || el.status !== 'OK') {
      throw new Error('Element status: ' + (el?.status || 'unknown'));
    }

    const duration = el.duration_in_traffic?.value ?? el.duration?.value ?? null;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        ok: true,
        duration_seconds: duration,
        updated: new Date().toISOString()
      })
    };
  } catch (e) {
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
