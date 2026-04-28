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

export default function SyncSettings({ syncStatus, syncError, onPatChange, onClose }) {
  const [pat, setPat] = useState(loadPat);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(!loadPat());

  function handleSave() {
    const trimmed = input.trim();
    savePat(trimmed);
    setPat(trimmed);
    clearGistCache();
    onPatChange(trimmed);
    setShowInput(false);
  }

  function handleDisconnect() {
    savePat('');
    setPat('');
    clearGistCache();
    onPatChange('');
    setShowInput(true);
  }

  const statusInfo = {
    idle:    { dot: 'bg-gray-300',  text: '未接続' },
    syncing: { dot: 'animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full', text: '同期中...' },
    synced:  { dot: 'bg-green-500', text: '同期済み ✓' },
    error:   { dot: 'bg-red-500',   text: `エラー: ${syncError}` },
  }[syncStatus] || { dot: 'bg-gray-300', text: '' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">デバイス間同期</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <p className="text-xs text-gray-500">
          GitHubのPersonal Access Token（gistスコープ）を設定すると、
          全デバイスで手動入力した予定が同期されます。
        </p>

        {/* 同期状態 */}
        {pat && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className={`w-2 h-2 flex-shrink-0 ${statusInfo.dot}`} />
            <span className={`text-sm ${syncStatus === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
              {statusInfo.text}
            </span>
          </div>
        )}

        {pat && !showInput ? (
          <div className="space-y-2">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 font-mono flex-1">
                {pat.slice(0, 10)}••••••••
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setInput(''); setShowInput(true); }}
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
              onKeyDown={e => e.key === 'Enter' && input.trim() && handleSave()}
            />
            <a
              href="https://github.com/settings/tokens/new?scopes=gist&description=himekuri-calendar"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline block"
            >
              → GitHubでトークンを発行（gistスコープのみ）
            </a>
            <div className="flex gap-2 justify-end">
              {pat && (
                <button onClick={() => setShowInput(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">
                  キャンセル
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!input.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 rounded-lg transition-colors"
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
