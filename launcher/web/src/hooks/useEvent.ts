import { useEffect, useRef, useCallback } from 'react';
import { on } from '../api/bridge';

export function useEvent(event: string, handler: (data: any) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const stableHandler = useCallback((data: any) => {
    handlerRef.current(data);
  }, []);

  useEffect(() => {
    const unsubscribe = on(event, stableHandler);
    return unsubscribe;
  }, [event, stableHandler]);
}
