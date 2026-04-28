import { useState, useEffect } from 'react';
import { useCurrentDay } from './hooks/useCurrentDay';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useLocalEvents } from './hooks/useLocalEvents';
import { toDateKey } from './utils/dateHelpers';
import DayNav from './components/DayNav';
import Timeline from './components/Timeline';
import EventForm from './components/EventForm';
import AuthButton from './components/AuthButton';
import SyncSettings, { loadPat } from './components/SyncSettings';

export default function App() {
  const { date, goNext, goPrev, goToday } = useCurrentDay();
  const { accessToken, loading: authLoading, error: authError, signIn, signOut, getValidToken, hasClientId } = useGoogleAuth();

  const [pat, setPat] = useState(loadPat);
  const { addEvent, updateEvent, deleteEvent, getForDate, syncStatus } = useLocalEvents(pat);
  const { events: gcalEvents, loading: gcalLoading } = useCalendarEvents(date, getValidToken, Boolean(accessToken));

  const [modal, setModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const localEvents = getForDate(date);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Home') goToday();
      if (e.key === 'Escape') { setModal(null); setShowSettings(false); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, goToday]);

  function handleSlotClick({ h, m }) {
    const endH = h < 23 ? h + 1 : h;
    setModal({ mode: 'add', initial: { startH: h, startM: m, endH, endM: m } });
  }

  function handleEventClick(ev) {
    setModal({ mode: 'edit', event: ev });
  }

  function handleSave(data) {
    const dateKey = toDateKey(date);
    if (modal.mode === 'add') addEvent({ ...data, date: dateKey });
    else updateEvent(modal.event.id, data);
    setModal(null);
  }

  function handleDelete() {
    if (modal.mode === 'edit') deleteEvent(modal.event.id);
    setModal(null);
  }

  return (
    <div className="flex flex-col h-svh bg-gray-50">
      <DayNav
        date={date}
        goNext={goNext}
        goPrev={goPrev}
        goToday={goToday}
        syncStatus={syncStatus}
        onOpenSettings={() => setShowSettings(true)}
      />

      <Timeline
        localEvents={localEvents}
        gcalEvents={gcalEvents}
        gcalLoading={gcalLoading}
        isAuthenticated={Boolean(accessToken)}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
      />

      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-2">
        <AuthButton
          accessToken={accessToken}
          loading={authLoading}
          error={authError}
          signIn={signIn}
          signOut={signOut}
          hasClientId={hasClientId}
        />
      </div>

      {modal && (
        <EventForm
          initial={modal.mode === 'edit' ? modal.event : modal.initial}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}

      {showSettings && (
        <SyncSettings
          syncStatus={syncStatus}
          onPatChange={setPat}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
