import { useState } from 'react';
import { clearGistCache } from '../hooks/useGistSync';

const PAT_KEY = 'himekuri-github-pat';

export function loadPat() {
  return localStorage.getItem(PAT_KEY) || '';
}

function savePat(pat) {
  if (pat) localStorage.setItem(PAT_KEY, pat);
  else localStorage.removeItem(PAT_KEY);
}

export default function SyncSettings({ syncStatus, onPatChange, onClose }) {
  const [pat, setPat] = useState(loadPat);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(!loadPat());

  function handleSave() {
    savePat(input.trim());
    setPat(input.trim());
    onPatChange(input.trim());
    clearGistCache();
    setShowInput(false);
  }

  function handleDisconnect() {
    savePat('');
    setPat('');
    clearGistCache();
    onPatChange('');
    setShowInput(true);
  }

  const statusIcon = {
    idle:    <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />,
    syncing: <span className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block" />,
    synced:  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />,
    error:   <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />,
  }[syncStatus] || null;

  const statusText = {
    idle:    '未接続',
    syncing: '同期中...',
    synced:  '同期済み',
    error:   '同期エラー',
  }[syncStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">デバイス間同期（GitHub Gist）</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <p className="text-xs text-gray-500">
          GitHub の Personal Access Token（gist スコープ）を設定すると、
          全デバイスで手動入力した予定が同期されます。
        </p>

        {pat && !showInput ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              {statusIcon}
              <span className="text-sm text-gray-600">{statusText}</span>
              <span className="text-xs text-gray-400 ml-auto font-mono">
                {pat.slice(0, 8)}••••••••
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInput(true)}
                className="flex-1 text-sm text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-lg py-2 transition-colors"
              >
                変更
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 text-sm text-red-500 hover:bg-red-50 border border-red-100 rounded-lg py-2 transition-colors"
              >
                解除
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <a
              href="https://github.com/settings/tokens/new?scopes=gist&description=himekuri-calendar"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline block"
            >
              → GitHub でトークンを発行する（gist スコープのみでOK）
            </a>
            <div className="flex gap-2">
              {pat && (
                <button
                  onClick={() => setShowInput(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  キャンセル
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!input.trim()}
                className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 rounded-lg transition-colors"
              >
                保存して同期
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
