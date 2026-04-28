import EventItem from './EventItem';

function Skeleton() {
  return (
    <div className="space-y-3 px-1 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-1 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventList({ events, loading, error, isAuthenticated }) {
  const allDayEvents = events.filter(e => e.start?.date && !e.start?.dateTime);
  const timedEvents = events.filter(e => Boolean(e.start?.dateTime));

  return (
    <div className="flex-1 overflow-y-auto">
      {!isAuthenticated && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 py-8">
          <CalendarIcon />
          <p className="text-sm">Googleカレンダーと連携すると<br />予定が表示されます</p>
        </div>
      )}

      {isAuthenticated && loading && <Skeleton />}

      {isAuthenticated && error && !loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-400">予定の取得に失敗しました</p>
        </div>
      )}

      {isAuthenticated && !loading && !error && events.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 py-8">
          <CheckIcon />
          <p className="text-sm text-gray-400">予定なし</p>
        </div>
      )}

      {isAuthenticated && !loading && !error && events.length > 0 && (
        <div className="space-y-2">
          {allDayEvents.length > 0 && (
            <div className="space-y-1.5">
              {allDayEvents.map(e => <EventItem key={e.id} event={e} />)}
            </div>
          )}
          {timedEvents.length > 0 && (
            <div>
              {timedEvents.map(e => <EventItem key={e.id} event={e} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
