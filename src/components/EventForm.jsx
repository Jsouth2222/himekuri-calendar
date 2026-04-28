import { useState, useEffect, useRef } from 'react';

const COLORS = [
  { id: 'blue',   bg: '#3b82f6', label: '青' },
  { id: 'green',  bg: '#22c55e', label: '緑' },
  { id: 'red',    bg: '#ef4444', label: '赤' },
  { id: 'purple', bg: '#8b5cf6', label: '紫' },
  { id: 'orange', bg: '#f97316', label: '橙' },
  { id: 'pink',   bg: '#ec4899', label: 'ピンク' },
];

function toTimeStr(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
}

export default function EventForm({ initial, onSave, onDelete, onClose }) {
  const isEdit = Boolean(initial?.id);
  const [title, setTitle] = useState(initial?.title || '');
  const [startTime, setStartTime] = useState(toTimeStr(initial?.startH ?? 9, initial?.startM ?? 0));
  const [endTime, setEndTime] = useState(toTimeStr(initial?.endH ?? 10, initial?.endM ?? 0));
  const [color, setColor] = useState(initial?.color || 'blue');
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const { h: startH, m: startM } = parseTime(startTime);
    const { h: endH, m: endM } = parseTime(endTime);
    onSave({ title: title.trim(), startH, startM, endH, endM, color });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{isEdit ? '予定を編集' : '予定を追加'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タイトル"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-500 w-8 flex-shrink-0">開始</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="text-xs text-gray-500 w-8 flex-shrink-0">終了</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Color picker */}
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className="w-7 h-7 rounded-full transition-transform"
                style={{
                  backgroundColor: c.bg,
                  outline: color === c.id ? `3px solid ${c.bg}` : 'none',
                  outlineOffset: '2px',
                  transform: color === c.id ? 'scale(1.2)' : 'scale(1)',
                }}
                aria-label={c.label}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            {isEdit && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                削除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
