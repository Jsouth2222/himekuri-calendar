import { useState } from 'react';
import { addDays } from '../utils/dateHelpers';

export function useCurrentDay() {
  const [date, setDate] = useState(() => {
    const saved = sessionStorage.getItem('himekuri-date');
    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) return d;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  function navigate(n) {
    setDate(prev => {
      const next = addDays(prev, n);
      next.setHours(0, 0, 0, 0);
      sessionStorage.setItem('himekuri-date', next.toISOString());
      return next;
    });
  }

  function goToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionStorage.setItem('himekuri-date', today.toISOString());
    setDate(today);
  }

  return { date, goNext: () => navigate(1), goPrev: () => navigate(-1), goToday };
}
