/**
 * The Flightline — Event ICS Generator
 * URL: /.netlify/functions/event-ics
 *
 * Returns a properly-formatted .ics calendar event with the correct
 * Content-Type and Content-Disposition headers so iOS Safari opens it
 * directly in the Calendar app's "Add Event" sheet rather than the
 * "Save in Files" download sheet.
 *
 * Query params (all required except desc/loc):
 *   title    — event title
 *   start    — ISO 8601 start (e.g. 20260518T193000)
 *   end      — ISO 8601 end (e.g. 20260518T213000)
 *   loc      — location (optional)
 *   desc     — description (optional)
 *   uid      — optional unique id (auto-generated if missing)
 *
 * Why this is necessary: iOS Safari on iPhone treats anchor `download`
 * attributes and Blob URLs as forced file downloads, regardless of MIME
 * type, which routes the response through the system "Save in..." sheet.
 * A real server response with `Content-Type: text/calendar` and no
 * forced-download headers is the only path that reliably triggers the
 * native "Add Event" sheet on tap.
 */

function escIcs(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function safeFilename(title) {
  return String(title || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'event';
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const title = q.title || 'Event';
  const start = q.start || '';
  const end   = q.end || '';
  const loc   = q.loc || '';
  const desc  = q.desc || '';

  if (!start || !end) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Missing start or end parameter'
    };
  }

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const uid = q.uid || ('flightline-' + safeFilename(title) + '-' + Date.now() + '@theflightline.com');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Flightline//Pensacola Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + now,
    'DTSTART:' + start,
    'DTEND:' + end,
    'SUMMARY:' + escIcs(title),
    desc ? 'DESCRIPTION:' + escIcs(desc) : '',
    loc  ? 'LOCATION:' + escIcs(loc) : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  // Critical headers for iOS Safari to open in Calendar app:
  // - text/calendar MIME with charset
  // - inline (NOT attachment) — attachment forces the Save sheet
  // - filename hint allows download fallback on desktop
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="' + safeFilename(title) + '.ics"',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    },
    body: ics
  };
};
