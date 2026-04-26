import { useState, useEffect } from 'react';
import { api, isApiReady } from '../api/bridge';

export function useApi() {
  const [ready, setReady] = useState(isApiReady());

  useEffect(() => {
    if (ready) return;

    const check = () => {
      if (isApiReady()) {
        setReady(true);
      }
    };

    window.addEventListener('pywebview-ready', check);
    // Poll as fallback in case the event already fired
    const interval = setInterval(check, 200);

    return () => {
      window.removeEventListener('pywebview-ready', check);
      clearInterval(interval);
    };
  }, [ready]);

  return { api: ready ? api : null, ready };
}
