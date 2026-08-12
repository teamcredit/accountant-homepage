// @ts-nocheck
/* eslint-disable */
"use client";

/**
 * 히어로와 대시보드 사이. 흩어져 있던 서비스 6개가 한 장으로 모인다.
 *
 * 배경이 아니라 실제 요소다. 스크롤을 내리면 모이고,
 * 모인 자리가 그대로 아래 대시보드 화면이 서는 곳이다.
 * 흩어진 일들이 모여서 → 한 화면이 된다. 이 페이지가 파는 게 그거다.
 *
 * 이름은 실제 lib/data.ts 의 서비스 6개를 그대로 쓴다. 지어내지 않는다.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ServiceMerge({ items }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...root.querySelectorAll(".svm-card")];
    const target = root.querySelector(".svm-target");
    // 문구는 대시보드(.stage) 안에 있다 — 커진 네모 위에 떠야 하기 때문
    const label = document.querySelector(".svm-label");
    if (!cards.length || !target) return;

    // 움직임을 줄이는 설정이면 스크롤 연동을 안 한다. 대시보드는 그냥 보인다.
    if (reduce) {
      gsap.set(root, { opacity: 1 });
      gsap.set(label, { opacity: 1 });
      const stageEl = document.querySelector(".stage");
      if (stageEl) stageEl.style.opacity = "1";
      return;
    }

    const ctx = gsap.context(() => {
      /* 각 카드가 모이는 자리까지 가야 할 거리를 잰다.
         기준은 스택(움직이지 않는 것)이다 — target 은 카드와 함께
         움직이므로 그걸로 재면 거리가 0 이 되어 아무 일도 안 일어난다. */
      const measure = () => {
        const stackEl = root.querySelector(".svm-stack");
        const st = stackEl.getBoundingClientRect();
        const cx = st.left + st.width * 0.12;      // 모이는 자리 = CSS 의 left:12%
        const cy = st.top + st.height / 2;
        return cards.map((card) => {
          // 이동값을 빼고 원래 자리에서 잰다
          const prevX = gsap.getProperty(card, "x");
          const prevY = gsap.getProperty(card, "y");
          gsap.set(card, { x: 0, y: 0 });
          const r = card.getBoundingClientRect();
          gsap.set(card, { x: prevX, y: prevY });
          return {
            x: cx - (r.left + r.width / 2),
            y: cy - (r.top + r.height / 2),
          };
        });
      };

      let moves = measure();

      const shot = document.querySelector(".shot");
      const stackEl = root.querySelector(".svm-stack");

      /* 전부 스크롤이 몬다. 저절로 돌아가는 부분은 없다. */
      const onScroll = () => {
        if (!shot || !stackEl) return;

        /* 진행도는 "얼마나 스크롤했나"로 잰다.
           화면 위치로 재면 첫 화면에서 이미 스택이 가운데라 0 이 안 나온다.

           순서를 또렷하게 나눈다. 겹치면 무슨 일이 일어나는지 안 읽힌다.

             p 0.00 ~ 0.35   흩어진 6장이 한 장으로 모인다 (여기까지 화면을 붙잡음)
             p 0.35 ~ 0.58   모인 한 장이 아래 대시보드 자리까지 내려간다
             p 0.50 ~ 0.62   대시보드 자리에 닿으면 그 자리를 넘겨주고 사라진다
             p 0.50 ~ 0.66   커진 네모(대시보드)가 드러난다
             p 0.60 ~ 0.78   그 네모 위에 문구가 떴다가 물러난다
             그 뒤            원래 있던 대시보드 애니메이션 */
        const SPAN = innerHeight * 2.6;
        const p = Math.min(Math.max(scrollY / SPAN, 0), 1);
        const ease = (v) => v * v * (3 - 2 * v);
        const seg = (a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

        // ── 1) 모인다. 다 모일 때까지 화면을 붙잡는다 ──
        const m = ease(seg(0, 0.35));

        /* ── 2) 모인 한 장이 아래 대시보드 자리까지 실제로 내려간다 ──
           제자리에서 사라지면 "어디로 갔지" 가 된다. 눈으로 따라갈 수 있게
           대시보드가 설 자리까지 데려간다. */
        const down = ease(seg(0.35, 0.58));

        const st = stackEl.getBoundingClientRect();
        const s = shot.getBoundingClientRect();
        /* 모인 자리(스택의 12% 지점) → 대시보드 윗부분까지.
           대시보드 '한가운데' 를 노리면 카드가 화면 아래로 빠져나가
           내려가는 모습을 못 본다. 화면 안에 머무는 윗머리로 데려간다. */
        const fromX = st.left + st.width * 0.12;
        const fromY = st.top + st.height / 2;
        const dx = (s.left + s.width / 2) - fromX;
        const dy = (s.top + Math.min(s.height * 0.18, 160)) - fromY;

        // 다 내려가서 대시보드에 닿으면 자리를 넘기고 사라진다
        const cardFade = 1 - seg(0.50, 0.62);

        cards.forEach((card, i) => {
          gsap.set(card, {
            x: moves[i].x * m + dx * down,
            y: moves[i].y * m + dy * down,
            opacity: cardFade,
          });
        });
        gsap.set(target, {
          x: dx * down,
          y: dy * down,
          opacity: (m > 0.9 ? 1 : 0) * cardFade,
        });

        /* ── 3) 문구는 커진 네모 위에 뜬다 ──────────
           대시보드가 드러나는 동안 떠 있다가, 다 드러나면 물러난다.
           대시보드 자체 애니메이션(조각 확대)이 시작되기 전에 비켜준다. */
        gsap.set(label, {
          opacity: seg(0.60, 0.68) * (1 - seg(0.74, 0.82)),
          y: (1 - seg(0.60, 0.68)) * 16,
        });

        /* ── 4) 대시보드가 드러난다 ──────────────────
           문구가 뜨는 동안엔 아직 안 보인다. 문구가 물러나면서 서서히 나타난다.
           다 드러난 뒤부터는 원래 있던 대시보드 애니메이션이 이어받는다.

           대시보드의 transform 은 promo-motion 이 잡고 있다. 겹쳐 쓰면 서로
           덮어써서 깜빡인다. 그래서 여기서는 감싸는 .stage 의 투명도만 만진다. */
        const reveal = ease(seg(0.50, 0.66));
        const stageEl = shot.parentElement;
        if (stageEl) stageEl.style.opacity = String(reveal);
      };
      addEventListener("scroll", onScroll, { passive: true });
      gsap.set(root, { opacity: 1 });
      onScroll();                       // 첫 화면 상태를 바로 그린다

      // 창 크기가 바뀌면 거리를 다시 잰다
      const onResize = () => { moves = measure(); };
      addEventListener("resize", onResize);

      return () => {
        removeEventListener("resize", onResize);
        removeEventListener("scroll", onScroll);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="svm" ref={rootRef} aria-hidden="true">
      <div className="svm-stack">
        {/* 모이는 자리. 다 모이면 테두리가 드러난다. */}
        <div className="svm-target" aria-hidden="true" />
        {items.map((s, i) => (
          <div className={`svm-card svm-p${i + 1}`} key={s.slug}>
            <span className="svm-t">{s.title}</span>
            <span className="svm-rows"><i /><i /><i /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
