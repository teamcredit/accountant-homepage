"use client";

/* 대시보드 배너의 무대.
 *
 * 태블릿이 마우스 쪽으로 아주 조금 돈다. 그게 전부다.
 *
 * 전에는 뒤에 WebGL 로 빛을 깔았는데, 태블릿 왼쪽 위로 연한 하늘색 네모가
 * 삐져나와 「빛」이 아니라 「판」으로 읽혔다. 뺐다. 마우스 반응은 기울기
 * 하나로 충분하고, 그림자가 이미 깊이를 만든다.
 *
 * 각도는 매 프레임 조금씩 따라간다. 커서 자리를 그대로 넣으면 튕기듯 돌아
 * 싸구려로 보인다.
 */

import { useEffect, useRef, type ReactNode } from "react";

export default function PortalStage({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const tilt = tiltRef.current;
    if (!host || !tilt) return;

    /* 손가락에는 커서가 없고, 움직임을 꺼 둔 사람에게는 돌리지 않는다. */
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const want = { x: 0.5, y: 0.55 };
    const now = { x: 0.5, y: 0.55 };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      want.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      want.y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    };
    const onLeave = () => {
      want.x = 0.5;
      want.y = 0.55;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    /* 화면 밖에서는 안 돈다. 홈이 12,000px 인데 계속 돌 이유가 없다. */
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(host);

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      now.x += (want.x - now.x) * 0.06;
      now.y += (want.y - now.y) * 0.06;
      /* 크게 주면 화면 속 글자가 사다리꼴로 눕는다. */
      tilt.style.setProperty("--rx", `${((now.y - 0.55) * 5).toFixed(2)}deg`);
      tilt.style.setProperty("--ry", `${(-7 + (now.x - 0.5) * 9).toFixed(2)}deg`);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={hostRef} className="pb-stage">
      <div ref={tiltRef} className="pb-tablet">
        <div className="pb-tablet-body">{children}</div>
      </div>
    </div>
  );
}
