"use client";

/* 홈 첫 화면. 장면은 둘뿐이다.

   ① 영상이 화면을 채우고 그 위에 이름이 선다.
   ② 스크롤하면 영상이 본문 열 폭의 판으로 줄어 화면 위에 남고,
      그 밑에서 「무엇을 하는 회사인가」가 올라온다.
      영상을 아예 끄면 다음 화면이 흰 바탕에 글 한 덩어리뿐이라
      위아래로 570px 이 빈다. 판을 남겨 화면을 둘로 나눈다.

   ── 본초자오선 장면은 여기서 뺐다 ─────────────────────────
   지구본이 돌고 광선이 지나가는 그 장면은 /about 의 §① 로 옮겼다.
   첫 화면에서 이름의 유래부터 꺼내면, 세무·회계 자문사라는 걸 알기도
   전에 스크롤이 끝난다. 다시 여기로 가져오지 말 것.

   ── 좁은 화면에서는 붙이지 않는다 ────────────────────────
   프레임마다 clip-path 를 다시 쓰는 일이 휴대폰에서 제일 무겁다.
   넘김이 끊기고 빠르게 굴리면 화면이 튀던 원인이 그것이라, 좁은 화면은
   영상 한 판과 설명 한 판을 그냥 위아래로 쌓는다. */

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { useBackgroundVideo } from "@/lib/use-background-video";
import Wordmark from "@/components/brand/wordmark";
import { useHandheld, useMedia } from "@/lib/use-media";

export default function AboutOpening() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const handheld = useHandheld();
  useBackgroundVideo(ref, handheld || reduced);

  /* 이 구간을 지나는 동안 0 → 1. 그게 아래 모든 값의 시계다. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* 값을 한 번 옮겨 담는다.
     useScroll 이 준 값을 style 에 바로 물리면 브라우저의 스크롤 타임라인으로
     넘어가는데, 그쪽은 target/offset 을 안 보고 문서 전체를 구간으로 잡는다.
     그래서 장면이 실제보다 세 배 늘어졌다. 평범한 값으로 옮기면 그 경로를
     안 타고 우리가 준 구간대로 돈다. 다시 그리지 않으니 값도 안 든다. */
  const p = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => p.set(v));

  /* ⓪ 영상. 예전에는 위아래에서 셔터가 닫히듯 아예 꺼졌다. 그러면 다음
     화면이 흰 바탕에 글 한 덩어리뿐이라 위아래로 570px 이 비었다.
     지금은 끄지 않는다 — 본문 열 폭의 판으로 줄어들어 화면 위에 남는다.
     그 밑에서 글이 올라오면 한 화면이 「영상 + 글」 둘로 찬다.

     줄어드는 모양은 CSS 가 정한다(.about-video). 여기서는 0 에서 1 까지
     진행도만 넘긴다 — 판의 자리와 크기는 본문 열·헤더 높이에 매여 있어서
     px 로 여기 적어 두면 화면 크기가 바뀔 때마다 어긋난다. */
  const filmP = useTransform(p, [0.18, 0.44], [0, 1]);

  /* 헤더는 자기 밑에 깔린 배경색을 읽어 글자 밝기를 정한다. 영상이 위에서
     물러나면 헤더 밑은 흰 바탕이 되므로 그때 한 번 다시 재라고 알려 준다.
     예전에는 영상 판을 통째로 DOM 에서 뺐는데, 이제는 남으므로 뺄 수 없다. */
  const [filmShrunk, setFilmShrunk] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const next = v > 0.2;
    setFilmShrunk((prev) => (prev === next ? prev : next));
  });
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, [filmShrunk]);

  /* ① 이름이 내려오는 길.
     화면 한가운데(크게) → 글판 왼쪽 위 제자리(작게).
     가는 거리와 줄어드는 비율은 화면마다 달라서 재야 한다. 아래
     useLayoutEffect 가 첫 그림 전에 한 번, 그리고 폭이 바뀔 때마다 잰다. */
  const nameRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLHeadingElement>(null);
  const [fly, setFly] = useState<{ dx: number; dy: number; s: number } | null>(null);

  useLayoutEffect(() => {
    if (reduced || handheld) return;
    let w = 0;
    const measure = () => {
      const box = nameRef.current;
      const ink = box?.querySelector(".brand-lockup") as HTMLElement | null;
      if (!box || !ink) return;
      /* 잴 때는 움직임을 잠시 끈다. 안 그러면 「이미 옮겨진 자리」를
         새 기준으로 잡아 화면이 한 번 튄다. */
      const prev = flyRef.current?.style.transform ?? "";
      if (flyRef.current) flyRef.current.style.transform = "none";
      const r = ink.getBoundingClientRect();
      if (flyRef.current) flyRef.current.style.transform = prev;
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      /* 처음 크기는 예전 가운데 로고와 같다 — clamp(3.2rem, 13vw, 13rem). */
      const startPx = Math.min(Math.max(3.2 * root, window.innerWidth * 0.13), 13 * root);
      const nowPx = parseFloat(getComputedStyle(box).fontSize) || startPx;
      setFly({
        dx: window.innerWidth / 2 - (r.left + r.width / 2),
        dy: window.innerHeight / 2 - (r.top + r.height / 2),
        s: startPx / nowPx,
      });
    };
    measure();
    w = window.innerWidth;
    const onResize = () => {
      /* 가로가 안 바뀐 resize 는 무시한다. 주소창이 접힐 때마다 오는
         세로만 바뀐 resize 에 다시 재면 로고가 한 칸씩 뛴다. */
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      measure();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reduced, handheld]);

  const flyT = useTransform(p, [0.08, 0.4], [1, 0]);
  const flyX = useTransform(flyT, (t) => (fly ? fly.dx * t : 0));
  const flyY = useTransform(flyT, (t) => (fly ? fly.dy * t : 0));
  const flyS = useTransform(flyT, (t) => (fly ? 1 + (fly.s - 1) * t : 1));
  /* 색. 영상 위에서는 흰 글씨, 흰 바탕에 내려앉으면 검정. */
  const flyColor = useTransform(p, [0.26, 0.38], ["#ffffff", "#0F141B"]);
  const flyStyle = { x: flyX, y: flyY, scale: flyS, color: flyColor };

  /* ② 로고 말고 나머지. 로고가 다 내려온 뒤에 뜬다. */
  const restP = useTransform(p, [0.42, 0.6], [0, 1]);

  /* 움직임을 꺼 둔 화면과 휴대폰. 두 판을 그냥 위아래로 쌓는다. */
  if (reduced || handheld) {
    /* ref 는 여기도 붙인다. useScroll 이 붙을 데를 못 찾으면 콘솔에
       경고를 남긴다 — 값은 안 쓰지만 자리는 준다. */
    return (
      <div ref={ref} className="about-flat">
        <section className="aflat-film">
          {!reduced && (
            <video muted loop playsInline preload="metadata" poster="/home-hero-poster.jpg">
              <source src="/home-hero.webm" type="video/webm" />
              <source src="/home-hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="about-video-veil" />
          <h1 className="about-logo">
            <Wordmark mark={false} />
          </h1>
        </section>

        <section className="aflat-what">
          <What />
        </section>
      </div>
    );
  }

  return (
    <div ref={ref} className="about-stage">
      <div className="about-stage-pin" data-film={filmShrunk ? "small" : "full"}>
        {/* ⓪ 영상. 제일 뒤에 깐다. 끄지 않고 위쪽 판으로 남긴다. */}
        <motion.div
            className="about-video"
            style={{ "--vp": filmP } as unknown as CSSProperties}
          >
            {/* webm 이 먼저다 — 같은 화질에 mp4 보다 15% 작다.
                7.8MB 원본을 crf 27 로 다시 떠서 1.1MB 로 줄였다. */}
            <video muted loop playsInline preload="metadata" poster="/home-hero-poster.jpg">
              <source src="/home-hero.webm" type="video/webm" />
              <source src="/home-hero.mp4" type="video/mp4" />
            </video>
            {/* 흰 로고가 얹히는 자리를 눌러 준다. 안 누르면 밝은 장면에서
                이름이 사라진다. 헤더도 이 색을 읽어 밝기를 정한다. */}
            <div className="about-video-veil" />
        </motion.div>

        {/* ① 무엇을 하는 회사인가.
            로고는 이 판 안에 있다. 처음에는 화면 한가운데 크게 서 있다가
            영상이 줄어드는 동안 제자리로 내려온다. 이름 하나가 계속
            같은 이름으로 남아 있어야 「같은 것이 옮겨 갔다」로 읽힌다.
            예전에는 가운데 로고와 아래 로고가 따로 있어서, 하나가 꺼지고
            다른 하나가 켜졌다 — 둘로 보였다.
            --rest 는 「로고 말고 나머지」의 진행도다. 로고가 다 내려온 뒤에
            0 에서 1 로 간다. */}
        <motion.div
          className="about-close"
          style={{ "--rest": restP } as unknown as CSSProperties}
        >
          <What nameRef={nameRef} flyRef={flyRef} flyStyle={flyStyle} />
        </motion.div>
      </div>
    </div>
  );
}

/* 무슨 회사인가. 첫 화면이 이 한 판을 위해 있다 —
   영상 다음에 바로 이게 와야 무엇을 파는 곳인지가 읽힌다. */
function What({
  nameRef,
  flyRef,
  flyStyle,
}: {
  nameRef?: React.Ref<HTMLDivElement>;
  flyRef?: React.Ref<HTMLDivElement>;
  flyStyle?: Record<string, unknown>;
}) {
  return (
    /* 넓은 화면은 좌우로 나눈다.
       왼쪽은 「누구인가」— 로고와 업(業) 한 줄. 크게 세운다.
       오른쪽은 「무엇을 해주는가」— 설명과 갈 곳.
       한 줄로 쌓아 두면 가운데 580px 만 쓰고 좌우가 통째로 비었다.
       좁은 화면에서는 두 묶음이 그냥 위아래로 쌓인다. */
    <div className="about-what">
      <div className="about-what-id">
        {/* 회사 이름. 표식은 빼고 글자만 쓴다.
            넓은 화면에서는 이 로고가 처음에 화면 한가운데 크게 섰다가
            여기로 내려온다. 그 움직임은 부모(.about-logo-fly)가 맡는다. */}
        <div className="about-what-name" ref={nameRef}>
          <motion.h1 className="about-logo-fly" ref={flyRef} style={flyStyle}>
            <Wordmark mark={false} />
          </motion.h1>
        </div>
        {/* 업(業)을 한 줄로 먼저 박는다. 이 줄이 없으면 아래 설명이
            무엇에 대한 설명인지 모른 채 읽힌다.
            고객이 제일 먼저 말한 것도 이것이다 — 영상 바로 아래서
            세무·회계 자문사라는 걸 알 수 있어야 한다. */}
        <p className="about-what-kind">세무 · 회계 자문</p>
      </div>
      <div className="about-what-say">
      <p className="about-what-body">
        <span className="s">매일의 기장부터 세무조정, 세무자문, 가치평가까지</span>
        <span className="s"><strong>회계사가 직접 맡습니다.</strong></span>
      </p>
      {/* 여기까지가 「무엇을 하는가」. 한 줄 더 — 그 일이 어디에 모이는지. */}
      <p className="about-what-more">
        <span className="s">그리고 그 모든 것을 한 화면에서 보는</span>
        <span className="s">
          회사 전용 <strong className="hl">세무 대시보드</strong>까지.
        </span>
      </p>
      {/* 같은 사이트 안이라 Link 로 간다. 주소는 그대로 — 바꾸면 검색 순위가 흔들린다.
          <a> 로 두면 페이지를 통째로 다시 받아서 느리고, 린트도 막는다. */}
      <div className="about-what-cta">
        <Link className="about-btn about-btn--fill" href="/contact">
          상담하기
        </Link>
        <Link className="about-btn about-btn--line" href="/services">
          하는 일 자세히 보기
        </Link>
      </div>
      </div>
    </div>
  );
}
