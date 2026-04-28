import { useRef, useEffect } from 'react';
import { formatTime } from '../utils/dateHelpers';

export const HOUR_HEIGHT = 80; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const COLOR_BG = {
  blue:   '#3b82f6',
  green:  '#22c55e',
  red:    '#ef4444',
  purple: '#8b5cf6',
  orange: '#f97316',
  pink:   '#ec4899',
};

// Map Google Calendar colorId to a hex color
const GCAL_COLORS = {
  '1': '#ef4444', '2': '#f97316', '3': '#84cc16',
  '4': '#22c55e', '5': '#06b6d4', '6': '#3b82f6',
  '7': '#8b5cf6', '8': '#ec4899', '9': '#64748b',
  '10': '#ef4444', '11': '#f97316',
};

function eventToMinutes(h, m) { return h * 60 + m; }

function LocalEventBlock({ event, onClick }) {
  const top = eventToMinutes(event.startH, event.startM) / 60 * HOUR_HEIGHT;
  const height = Math.max(
    20,
    (eventToMinutes(event.endH, event.endM) - eventToMinutes(event.startH, event.startM)) / 60 * HOUR_HEIGHT
  );
  const bg = COLOR_BG[event.color] || COLOR_BG.blue;

  return (
    <div
      className="absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden text-white text-xs shadow-sm hover:brightness-110 transition-all"
      style={{ top, height, backgroundColor: bg }}
      onClick={onClick}
    >
      <div className="font-semibold truncate leading-tight">{event.title}</div>
      <div className="opacity-80 text-[10px]">
        {String(event.startH).padStart(2,'0')}:{String(event.startM).padStart(2,'0')}
        {' – '}
        {String(event.endH).padStart(2,'0')}:{String(event.endM).padStart(2,'0')}
      </div>
    </div>
  );
}

function GCalEventBlock({ event }) {
  const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
  if (isAllDay) return null; // all-day shown in header

  const start = new Date(event.start.dateTime);
  const end = new Date(event.end?.dateTime || event.start.dateTime);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = startMin / 60 * HOUR_HEIGHT;
  const height = Math.max(20, (endMin - startMin) / 60 * HOUR_HEIGHT);
  const color = event.colorId ? GCAL_COLORS[event.colorId] : '#3b82f6';

  return (
    <div
      className="absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden text-xs shadow-sm"
      style={{ top, height, backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
    >
      <div className="font-semibold truncate leading-tight" style={{ color }}>
        {event.summary || '(タイトルなし)'}
      </div>
      <div className="opacity-70 text-[10px]" style={{ color }}>
        {formatTime(event.start.dateTime)} – {formatTime(event.end?.dateTime)}
      </div>
    </div>
  );
}

function AllDayStrip({ events }) {
  const allDay = events.filter(e => e.start?.date && !e.start?.dateTime);
  if (allDay.length === 0) return null;
  return (
    <div className="flex gap-1 flex-wrap px-2 py-1 bg-blue-50 border-b border-gray-200">
      {allDay.map(e => (
        <span
          key={e.id}
          className="text-xs bg-blue-500 text-white rounded px-2 py-0.5"
        >
          {e.summary}
        </span>
      ))}
    </div>
  );
}

export default function Timeline({
  localEvents,
  gcalEvents,
  gcalLoading,
  isAuthenticated,
  onSlotClick,
  onEventClick,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    const scrollTo = Math.max(0, (now.getHours() - 1)) * HOUR_HEIGHT;
    scrollRef.current?.scrollTo({ top: scrollTo, behavior: 'smooth' });
  }, []);

  function handleLocalColumnClick(e) {
    // Don't trigger when clicking an existing event block
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0);
    const totalMin = Math.floor(y / HOUR_HEIGHT * 60);
    const h = Math.min(23, Math.max(0, Math.floor(totalMin / 60)));
    const m = Math.round((totalMin % 60) / 15) * 15 % 60;
    onSlotClick({ h, m });
  }

  // Current time line
  const now = new Date();
  const nowTop = (now.getHours() * 60 + now.getMinutes()) / 60 * HOUR_HEIGHT;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* All-day GCal events */}
      <AllDayStrip events={gcalEvents} />

      {/* Column headers */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        <div className="w-10 flex-shrink-0" />
        <div className="flex-1 py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">
          マイスケジュール
          <span className="ml-1 text-gray-400 font-normal normal-case">クリックで追加</span>
        </div>
        <div className="flex-1 py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Googleカレンダー
        </div>
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex relative" style={{ height: HOUR_HEIGHT * 24 }}>

          {/* Time gutter */}
          <div className="w-10 flex-shrink-0 relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-1 text-[10px] text-gray-400 select-none"
                style={{ top: h * HOUR_HEIGHT - 7 }}
              >
                {String(h).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Local events column */}
          <div
            className="flex-1 relative border-r border-gray-200 cursor-crosshair"
            onClick={handleLocalColumnClick}
          >
            {HOURS.map(h => (
              <div key={h} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: h * HOUR_HEIGHT }} />
            ))}
            {/* Half-hour lines */}
            {HOURS.map(h => (
              <div key={`h${h}`} className="absolute left-0 right-0 border-t border-gray-50 border-dashed" style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
            ))}
            {localEvents.map(ev => (
              <LocalEventBlock
                key={ev.id}
                event={ev}
                onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
              />
            ))}
          </div>

          {/* GCal column */}
          <div className="flex-1 relative">
            {HOURS.map(h => (
              <div key={h} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: h * HOUR_HEIGHT }} />
            ))}
            {HOURS.map(h => (
              <div key={`h${h}`} className="absolute left-0 right-0 border-t border-gray-50 border-dashed" style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
            ))}
            {!isAuthenticated && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-300 text-center px-4">
                  下のボタンで<br />Googleカレンダーと連携
                </p>
              </div>
            )}
            {isAuthenticated && gcalLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
            {isAuthenticated && !gcalLoading && gcalEvents
              .filter(e => e.start?.dateTime)
              .map(ev => <GCalEventBlock key={ev.id} event={ev} />)
            }
          </div>

          {/* Current time line */}
          <div
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ top: nowTop }}
          >
            <div className="relative flex items-center">
              <div className="w-10 flex-shrink-0" />
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-red-400" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
