import { startOfDay, endOfDay } from '../utils/dateHelpers';

export async function fetchEventsForDay(accessToken, date) {
  const timeMin = startOfDay(date).toISOString();
  const timeMax = endOfDay(date).toISOString();

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '50');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) throw new Error('AUTH_EXPIRED');
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);

  const data = await res.json();
  return data.items ?? [];
}
