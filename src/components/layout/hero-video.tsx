"use client";

/* 검정 히어로 뒤에 까는 영상. 페이지마다 따로 붙이지 않고 이거 하나만 쓴다.

   자동재생은 muted + playsInline 이 없으면 브라우저가 막는다.
   움직임을 꺼 둔 사람에게는 포스터 한 장만 보인다. */

import { useEffect, useRef } from "react";

export default function HeroVideo({ opacity = 0.55 }: { opacity?: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="hero-video" aria-hidden>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/meridian-hero-poster.jpg"
        style={{ opacity }}
      >
        <source src="/meridian-hero.webm" type="video/webm" />
        <source src="/meridian-hero.mp4" type="video/mp4" />
      </video>
      {/* 글이 얹히는 자리를 눌러 준다. 안 누르면 흰 글씨가 뜬다. */}
      <div className="hero-video-veil" />
    </div>
  );
}
