import { formatTimeRange } from '../utils/dateHelpers';

// Calendar event colors mapping (Google Calendar color IDs)
const COLOR_MAP = {
  '1': '#ef4444',   // Tomato
  '2': '#f97316',   // Flamingo
  '3': '#84cc16',   // Sage
  '4': '#22c55e',   // Basil
  '5': '#6ee7b7',   // Peacock
  '6': '#06b6d4',   // Blueberry
  '7': '#3b82f6',   // Lavender
  '8': '#8b5cf6',   // Grape
  '9': '#ec4899',   // Graphite
  '10': '#64748b',  // Default
  '11': '#ef4444',  // Tomato
};

function getEventColor(event) {
  if (event.colorId && COLOR_MAP[event.colorId]) return COLOR_MAP[event.colorId];
  return '#3b82f6'; // default blue
}

function isAllDay(event) {
  return Boolean(event.start?.date && !event.start?.dateTime);
}

export default function EventItem({ event }) {
  const color = getEventColor(event);
  const allDay = isAllDay(event);
  const timeRange = allDay ? '終日' : formatTimeRange(event.start, event.end);
  const title = event.summary || '(タイトルなし)';
  const location = event.location;

  if (allDay) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white"
        style={{ backgroundColor: color }}
      >
        <span className="text-xs opacity-80">終日</span>
        <span className="truncate">{title}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <div
        className="w-1 rounded-full flex-shrink-0 my-0.5"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-800 truncate leading-snug">{title}</p>
          <p className="text-xs text-gray-400 flex-shrink-0 leading-snug mt-0.5">{timeRange}</p>
        </div>
        {location && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{location}</p>
        )}
      </div>
    </div>
  );
}
