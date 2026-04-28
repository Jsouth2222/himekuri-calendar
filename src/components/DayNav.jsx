import { getDay, getMonth, getYear, getWeekdayShort, isToday, isSaturday, isSunday } from '../utils/dateHelpers';

export default function DayNav({ date, goNext, goPrev, goToday, syncStatus, onOpenSettings }) {
  const sat = isSaturday(date);
  const sun = isSunday(date);
  const dateColor = sun ? 'text-red-600' : sat ? 'text-blue-600' : 'text-gray-800';
  const wdColor = sun ? 'text-red-400' : sat ? 'text-blue-400' : 'text-gray-400';
  const todayFlag = isToday(date);

  const syncDot = {
    syncing: <span className="w-2 h-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />,
    synced:  <span className="w-2 h-2 rounded-full bg-green-400" />,
    error:   <span className="w-2 h-2 rounded-full bg-red-400" />,
  }[syncStatus] || <span className="w-2 h-2 rounded-full bg-gray-200" />;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
      <button
        onClick={goPrev}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="前の日"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-400">{getYear(date)}年 {getMonth(date)}</span>
        <span className={`text-3xl font-black ${dateColor}`}>{getDay(date)}</span>
        <span className={`text-sm font-medium ${wdColor}`}>{getWeekdayShort(date)}曜日</span>
        {todayFlag && (
          <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">今日</span>
        )}
        {!todayFlag && (
          <button onClick={goToday} className="text-xs text-gray-400 hover:text-blue-500 transition-colors ml-1">
            今日へ
          </button>
        )}
      </div>

      <button
        onClick={onOpenSettings}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative"
        aria-label="設定"
        title="デバイス間同期の設定"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="absolute bottom-1.5 right-1.5">{syncDot}</span>
      </button>
    </div>
  );
}
