import { useEffect, useState, useRef } from 'react';
import {
  getDay, getMonth, getYear, getWeekdayShort, getWeekdayFull,
  isToday, isSaturday, isSunday
} from '../utils/dateHelpers';
import EventList from './EventList';
import AuthButton from './AuthButton';

function DateDisplay({ date }) {
  const day = getDay(date);
  const month = getMonth(date);
  const year = getYear(date);
  const weekdayShort = getWeekdayShort(date);
  const weekdayFull = getWeekdayFull(date);
  const todayFlag = isToday(date);
  const sat = isSaturday(date);
  const sun = isSunday(date);

  const dayColor = sun ? 'text-red-600' : sat ? 'text-blue-600' : 'text-gray-800';
  const weekdayColor = sun ? 'text-red-500' : sat ? 'text-blue-500' : 'text-gray-500';

  return (
    <div className="select-none">
      {/* Year and month */}
      <div className="flex items-baseline gap-1.5 justify-center">
        <span className="text-sm text-gray-400 font-light">{year}年</span>
        <span className="text-xl font-semibold text-gray-600">{month}</span>
        {todayFlag && (
          <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5 ml-1">今日</span>
        )}
      </div>

      {/* Day number */}
      <div className={`text-8xl font-black leading-none my-1 ${dayColor}`}>
        {day}
      </div>

      {/* Weekday */}
      <div className={`text-lg font-medium ${weekdayColor}`}>
        {weekdayFull}
      </div>
    </div>
  );
}

function NavButton({ onClick, disabled, children, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white/80 active:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm bg-white/50"
    >
      {children}
    </button>
  );
}

export default function CalendarPage({
  date, goNext, goPrev, goToday,
  events, eventsLoading, eventsError,
  accessToken, authLoading, authError,
  signIn, signOut, hasClientId,
}) {
  const [animKey, setAnimKey] = useState(0);
  const prevDate = useRef(date);

  useEffect(() => {
    if (prevDate.current !== date) {
      setAnimKey(k => k + 1);
      prevDate.current = date;
    }
  }, [date]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Home') goToday();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, goToday]);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh px-4 py-8 gap-4">
      {/* Main card */}
      <div className="w-full max-w-md">
        {/* Hole-punch bar */}
        <div className="flex justify-center gap-8 mb-0">
          <div className="w-6 h-6 rounded-full bg-gray-300 shadow-inner" />
          <div className="w-6 h-6 rounded-full bg-gray-300 shadow-inner" />
        </div>

        {/* Card body */}
        <div
          key={animKey}
          className="flip-in rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top section — date display */}
          <div className="relative bg-gradient-to-b from-amber-50 to-orange-50 px-6 pt-8 pb-6 text-center border-b border-orange-100">
            {/* Red top stripe (calendar binding) */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

            <DateDisplay date={date} />

            {/* Nav controls */}
            <div className="flex items-center justify-between mt-4">
              <NavButton onClick={goPrev} label="前の日">
                <ChevronLeft />
              </NavButton>

              {!isToday(date) && (
                <button
                  onClick={goToday}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1 rounded-full hover:bg-white/60"
                >
                  今日へ戻る
                </button>
              )}
              {isToday(date) && <span className="w-20" />}

              <NavButton onClick={goNext} label="次の日">
                <ChevronRight />
              </NavButton>
            </div>
          </div>

          {/* Bottom section — events */}
          <div className="bg-white px-4 pt-4 pb-4 min-h-48 flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              スケジュール
            </h2>
            <EventList
              events={events}
              loading={eventsLoading}
              error={eventsError}
              isAuthenticated={Boolean(accessToken)}
            />
          </div>
        </div>

        {/* Auth section */}
        <div className="mt-4 px-1">
          <AuthButton
            accessToken={accessToken}
            loading={authLoading}
            error={authError}
            signIn={signIn}
            signOut={signOut}
            hasClientId={hasClientId}
          />
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-300">← → キーで日付を切り替え</p>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

