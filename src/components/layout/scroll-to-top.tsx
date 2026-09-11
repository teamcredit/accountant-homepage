"use client";
import { useEffect } from 'react';

/** Next and the browser own forward navigation, anchors and history restoration. */
export default function ScrollToTop() {
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'auto';
    return () => { history.scrollRestoration = previous; };
  }, []);
  return null;
}
