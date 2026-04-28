import { useState, useCallback, useEffect, useRef } from 'react';
import { toDateKey } from '../utils/dateHelpers';
import { loadFromGist, saveToGist } from './useGistSync';

const LS_KEY = 'himekuri-events';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function saveLocal(events) {
  localStorage.setItem(LS_KEY, JSON.stringify(events));
}

export function useLocalEvents(pat) {
  const [events, setEvents] = useState(loadLocal);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const saveTimer = useRef(null);

  // Load from Gist when PAT becomes available
  useEffect(() => {
    if (!pat) return;
    setSyncStatus('syncing');
    loadFromGist(pat)
      .then(gistEvents => {
        setEvents(gistEvents);
        saveLocal(gistEvents);
        setSyncStatus('synced');
      })
      .catch(() => setSyncStatus('error'));
  }, [pat]);

  // Debounced Gist save
  function syncToGist(nextEvents) {
    if (!pat) return;
    clearTimeout(saveTimer.current);
    setSyncStatus('syncing');
    saveTimer.current = setTimeout(() => {
      saveToGist(pat, nextEvents)
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    }, 800);
  }

  const mutate = useCallback((updater) => {
    setEvents(prev => {
      const next = updater(prev);
      saveLocal(next);
      syncToGist(next);
      return next;
    });
  }, [pat]);

  const addEvent = useCallback((ev) => {
    mutate(prev => [...prev, { ...ev, id: `${Date.now()}-${Math.random()}` }]);
  }, [mutate]);

  const updateEvent = useCallback((id, updates) => {
    mutate(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [mutate]);

  const deleteEvent = useCallback((id) => {
    mutate(prev => prev.filter(e => e.id !== id));
  }, [mutate]);

  function getForDate(date) {
    const key = toDateKey(date);
    return events.filter(e => e.date === key);
  }

  return { addEvent, updateEvent, deleteEvent, getForDate, syncStatus };
}
