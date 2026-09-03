"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

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

/* 페이지를 옮기면 맨 위에서 시작해야 한다.
   Lenis 는 자기가 스크롤을 들고 있어서, 브라우저나 Next 가 0 으로 돌려놔도
   다음 프레임에 원래 자리로 되감아 버린다. 그래서 Lenis 에게 직접 시킨다.
   ReactLenis 안쪽이라야 useLenis 가 그 인스턴스를 집으므로 컴포넌트를 따로 둔다. */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    /* immediate: 애니메이션 없이 즉시. 새 페이지가 위에서부터 스르륵 내려오면
       그건 이동이 아니라 스크롤로 읽힌다. */
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
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
      <ScrollToTopOnRouteChange />
      {children}
    </ReactLenis>
  );
}
