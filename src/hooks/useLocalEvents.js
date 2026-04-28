import { useState, useEffect, useCallback, useRef } from 'react';
import { toDateKey } from '../utils/dateHelpers';
import { loadFromGist, saveToGist } from './useGistSync';

const LS_KEY = 'himekuri-events';

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

export function useLocalEvents(pat) {
  const [events, setEvents] = useState(readLocal);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState('');
  const saveTimerRef = useRef(null);
  const patRef = useRef(pat);

  useEffect(() => { patRef.current = pat; }, [pat]);

  // GistからロードしてローカルとStateを更新
  useEffect(() => {
    if (!pat) {
      setSyncStatus('idle');
      return;
    }
    setSyncStatus('syncing');
    setSyncError('');
    loadFromGist(pat)
      .then(gistEvents => {
        setEvents(gistEvents);
        localStorage.setItem(LS_KEY, JSON.stringify(gistEvents));
        setSyncStatus('synced');
      })
      .catch(err => {
        setSyncStatus('error');
        setSyncError(err.message || '同期エラー');
      });
  }, [pat]);

  // events が変わったらGistに保存（デバウンス）
  const syncNow = useCallback((nextEvents) => {
    const currentPat = patRef.current;
    if (!currentPat) return;
    clearTimeout(saveTimerRef.current);
    setSyncStatus('syncing');
    saveTimerRef.current = setTimeout(() => {
      saveToGist(currentPat, nextEvents)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          setSyncStatus('error');
          setSyncError(err.message || '保存エラー');
        });
    }, 600);
  }, []);

  const addEvent = useCallback((ev) => {
    const next = [...readLocal(), { ...ev, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }];
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setEvents(next);
    syncNow(next);
  }, [syncNow]);

  const updateEvent = useCallback((id, updates) => {
    const next = readLocal().map(e => e.id === id ? { ...e, ...updates } : e);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setEvents(next);
    syncNow(next);
  }, [syncNow]);

  const deleteEvent = useCallback((id) => {
    const next = readLocal().filter(e => e.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setEvents(next);
    syncNow(next);
  }, [syncNow]);

  function getForDate(date) {
    const key = toDateKey(date);
    return events.filter(e => e.date === key);
  }

  return { addEvent, updateEvent, deleteEvent, getForDate, syncStatus, syncError };
}
