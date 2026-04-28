import { useState, useEffect, useRef } from 'react';
import { GOOGLE_SCOPES, GOOGLE_CLIENT_ID } from '../utils/constants';

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
            setError(response.error);
            return;
          }
          setAccessToken(response.access_token);
          expiresAtRef.current = Date.now() + response.expires_in * 1000;
          setError(null);
        },
      });
    }

    if (window.google?.accounts?.oauth2) {
      initClient();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initClient);
      }
    }
  }, []);

  function signIn() {
    if (!tokenClientRef.current) {
      setError('Google認証の初期化に失敗しました。Client IDを確認してください。');
      return;
    }
    setLoading(true);
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  }

  function signOut() {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    }
    setAccessToken(null);
    expiresAtRef.current = null;
    setError(null);
  }

  function isTokenValid() {
    return accessToken && expiresAtRef.current && Date.now() < expiresAtRef.current;
  }

  async function getValidToken() {
    if (isTokenValid()) return accessToken;
    if (tokenClientRef.current) {
      return new Promise((resolve) => {
        tokenClientRef.current.requestAccessToken({ prompt: '' });
        const originalCallback = tokenClientRef.current.callback;
        tokenClientRef.current.callback = (response) => {
          if (!response.error) {
            setAccessToken(response.access_token);
            expiresAtRef.current = Date.now() + response.expires_in * 1000;
            resolve(response.access_token);
          } else {
            resolve(null);
          }
          tokenClientRef.current.callback = originalCallback;
        };
      });
    }
    return null;
  }

  const hasClientId = Boolean(GOOGLE_CLIENT_ID);

  return { accessToken, loading, error, signIn, signOut, getValidToken, hasClientId };
}
