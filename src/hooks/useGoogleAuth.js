import { useState, useEffect, useRef } from 'react';
import { GOOGLE_SCOPES, GOOGLE_CLIENT_ID } from '../utils/constants';

const AUTO_AUTH_KEY = 'himekuri-gcal-authed';

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 以前に連携済みかどうか（再接続ボタン表示用）
  const [wasAuthed, setWasAuthed] = useState(() => Boolean(localStorage.getItem(AUTO_AUTH_KEY)));
  const tokenClientRef = useRef(null);
  const expiresAtRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function initClient() {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (response) => {
          setLoading(false);
          if (response.error) {
            // interaction_required = ユーザー操作が必要（サイレント失敗は無視）
            if (response.error !== 'interaction_required') {
              setError(response.error);
            }
            return;
          }
          setAccessToken(response.access_token);
          expiresAtRef.current = Date.now() + response.expires_in * 1000;
          localStorage.setItem(AUTO_AUTH_KEY, '1');
          setWasAuthed(true);
          setError(null);
        },
      });
    }

    if (window.google?.accounts?.oauth2) {
      initClient();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (script) script.addEventListener('load', initClient);
    }
  }, []);

  // ユーザー操作から呼ばれる（ポップアップ許可に必要）
  function signIn() {
    if (!tokenClientRef.current) {
      setError('Google認証を初期化できませんでした');
      return;
    }
    setLoading(true);
    // 一度許可済みなら prompt:'' でポップアップなし再接続
    const prompt = wasAuthed ? '' : '';
    tokenClientRef.current.requestAccessToken({ prompt });
  }

  function signOut() {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    }
    setAccessToken(null);
    expiresAtRef.current = null;
    localStorage.removeItem(AUTO_AUTH_KEY);
    setWasAuthed(false);
    setError(null);
  }

  function isTokenValid() {
    return accessToken && expiresAtRef.current && Date.now() < expiresAtRef.current;
  }

  async function getValidToken() {
    if (isTokenValid()) return accessToken;
    if (tokenClientRef.current) {
      return new Promise((resolve) => {
        const prev = tokenClientRef.current.callback;
        tokenClientRef.current.callback = (response) => {
          tokenClientRef.current.callback = prev;
          if (!response.error) {
            setAccessToken(response.access_token);
            expiresAtRef.current = Date.now() + response.expires_in * 1000;
            resolve(response.access_token);
          } else {
            resolve(null);
          }
        };
        tokenClientRef.current.requestAccessToken({ prompt: '' });
      });
    }
    return null;
  }

  return {
    accessToken, loading, error, wasAuthed,
    signIn, signOut, getValidToken,
    hasClientId: Boolean(GOOGLE_CLIENT_ID),
  };
}
