"use client";
import { useSyncExternalStore } from 'react';
import { seoulToday } from './schedule';

function subscribe(callback: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    const delay = 86400000 - ((Date.now() + 9 * 3600000) % 86400000) + 10;
    timer = setTimeout(() => { callback(); schedule(); }, delay);
  };
  schedule();
  window.addEventListener('focus', callback);
  document.addEventListener('visibilitychange', callback);
  return () => { clearTimeout(timer); window.removeEventListener('focus', callback); document.removeEventListener('visibilitychange', callback); };
}
export const useToday = () => useSyncExternalStore(subscribe, seoulToday, () => null);
