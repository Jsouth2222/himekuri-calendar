import { useState, useEffect, useRef } from 'react';
import { fetchEventsForDay } from '../services/googleCalendar';
import { toDateKey } from '../utils/dateHelpers';

export function useCalendarEvents(date, getValidToken, isAuthenticated) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef(new Map());

  useEffect(() => {
    if (!isAuthenticated) {
      setEvents([]);
      return;
    }

    const key = toDateKey(date);

    if (cache.current.has(key)) {
      setEvents(cache.current.get(key));
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const token = await getValidToken();
        if (!token || cancelled) return;
        const items = await fetchEventsForDay(token, date);
        if (!cancelled) {
          cache.current.set(key, items);
          setEvents(items);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [date, isAuthenticated]);

  return { events, loading, error };
}
