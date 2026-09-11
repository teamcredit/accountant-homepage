"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersReduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot
  );

  if (prefersReduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{ lerp: 0.2, duration: 0.65, wheelMultiplier: 0.85, smoothWheel: true }}
    >
      {children}
    </ReactLenis>
  );
}
