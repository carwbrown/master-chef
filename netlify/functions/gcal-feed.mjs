/**
 * gcal-feed — fetch a Google Calendar secret .ics feed and return upcoming events
 * as simple JSON the app can turn into master-chef events.
 *
 * POST { url: "https://calendar.google.com/calendar/ical/…/basic.ics" }
 *   -> { events: [{ key, title, date, all_day, start_time, end_time, notes }] }
 *
 * The URL is fetched server-side (CORS + keeps the secret address off the browser
 * network tab beyond our own origin). Only Google Calendar .ics URLs are allowed.
 */
import ical from 'node-ical';

const TZ = 'America/New_York';   // family timezone for wall-clock date/time
const WINDOW_DAYS = 90;          // "upcoming" = next ~3 months
const ALLOWED = /^https:\/\/calendar\.google\.com\/calendar\/ical\/\S+\.ics(\?\S*)?$/i;

const pad = (n) => String(n).padStart(2, '0');

// Wall-clock Y-M-D and H:M for a Date, in the target timezone.
function partsInTZ(date, tz) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  const hour = p.hour === '24' ? '00' : p.hour; // Intl can emit "24" at midnight
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${hour}:${p.minute}` };
}

// All-day events carry a floating date (UTC midnight) — read in UTC to avoid an off-by-one.
const utcDateStr = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function normalize(ev, startDate) {
  const allDay = ev.datetype === 'date';
  const durMs = (ev.end && ev.start) ? (ev.end.getTime() - ev.start.getTime()) : 0;
  let date, start_time = '', end_time = '';
  if (allDay) {
    date = utcDateStr(startDate);
  } else {
    const sp = partsInTZ(startDate, TZ);
    date = sp.date;
    start_time = sp.time;
    if (durMs > 0) end_time = partsInTZ(new Date(startDate.getTime() + durMs), TZ).time;
  }
  const notes = String(ev.location || ev.description || '').trim().slice(0, 500);
  return {
    key: `${ev.uid}::${date}`,
    title: String(ev.summary || '(no title)').trim(),
    date, all_day: allDay, start_time, end_time, notes,
  };
}

function expand(data, winStart, winEnd) {
  const out = [];
  for (const k of Object.keys(data)) {
    const ev = data[k];
    if (!ev || ev.type !== 'VEVENT' || !ev.start) continue;

    if (!ev.rrule) {
      if (ev.start >= winStart && ev.start <= winEnd) out.push(normalize(ev, ev.start));
      continue;
    }
    // Recurring — expand occurrences inside the window.
    const exdates = new Set(Object.keys(ev.exdate || {}));
    for (const d of ev.rrule.between(winStart, winEnd, true)) {
      const iso = d.toISOString().slice(0, 10);
      if (exdates.has(iso) || exdates.has(utcDateStr(d))) continue;
      const override = ev.recurrences && (ev.recurrences[iso] || ev.recurrences[utcDateStr(d)]);
      out.push(normalize(override || ev, override ? override.start : d));
    }
  }
  out.sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  return out;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: CORS });

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let url;
  try { ({ url } = await req.json()); } catch { return json({ error: 'Invalid JSON body' }, 400); }
  if (!url || !ALLOWED.test(url)) {
    return json({ error: 'Only Google Calendar .ics URLs are allowed (https://calendar.google.com/calendar/ical/…/basic.ics).' }, 400);
  }

  let text;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'master-chef-gcal-import' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return json({ error: `Calendar fetch failed (${r.status}). Check it's the secret iCal address and the calendar exists.` }, 502);
    text = await r.text();
  } catch (e) {
    return json({ error: 'Could not reach the calendar feed: ' + (e?.message || e) }, 502);
  }

  let data;
  try { data = await ical.async.parseICS(text); }
  catch (e) { return json({ error: 'Could not parse calendar: ' + (e?.message || e) }, 502); }

  const now = Date.now();
  const events = expand(data, new Date(now - 24 * 3600 * 1000), new Date(now + WINDOW_DAYS * 24 * 3600 * 1000));
  return json({ events });
};
