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
    const label = root.querySelector(".svm-label");
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
      const CARD_W = 420;
      const CARD_H = 158;

      /* 전부 스크롤이 몬다. 저절로 돌아가는 부분은 없다.
         한 줄기 진행도 p (0 → 1) 를 두 구간으로 나눠 쓴다.

           p 0.00 ~ 0.42   흩어진 6장이 한 장으로 모인다
           p 0.42 ~ 1.00   그 한 장이 대시보드 자리로 가며 커진다

         모이는 구간을 넉넉히 잡아야 "스르륵" 변한다.
         짧으면 눈 깜짝할 새 끝나서 재미가 없다. */
      const onScroll = () => {
        if (!shot || !stackEl) return;

        const st = stackEl.getBoundingClientRect();
        // 스택 가운데 = 모이는 자리 (카드와 함께 움직이지 않는 기준)
        const c = {
          left: st.left + st.width * 0.12 - CARD_W / 2,
          top: st.top + st.height / 2 - CARD_H / 2,
          width: CARD_W,
          height: CARD_H,
        };

        /* 진행도는 "얼마나 스크롤했나"로 잰다.
           화면 위치로 재면 첫 화면에서 이미 스택이 가운데라 0 이 안 나온다.

           순서를 또렷하게 나눈다. 겹치면 무슨 일이 일어나는지 안 읽힌다.

             p 0.00 ~ 0.45   흩어진 6장이 한 장으로 모인다
             p 0.45 ~ 0.62   그 한 장이 아래로 넘어가며 사라진다
             p 0.55 ~ 0.78   문구가 뜬다
             p 0.78 ~ 1.00   문구가 물러나고 대시보드가 드러난다
                             (그 뒤는 원래 있던 대시보드 애니메이션) */
        const SPAN = innerHeight * 1.45;
        const p = Math.min(Math.max(scrollY / SPAN, 0), 1);
        const ease = (v) => v * v * (3 - 2 * v);
        const seg = (a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

        // ── 1) 모인다 ──────────────────────────────
        const m = ease(seg(0, 0.45));

        // ── 2) 모인 장이 아래로 넘어가며 사라진다 ──
        //    크기를 늘리지 않는다. 늘리면 안쪽 글씨가 같이 늘어나 깨져 보인다.
        const away = ease(seg(0.45, 0.62));

        const s = shot.getBoundingClientRect();
        const dx = (s.left + s.width / 2) - (c.left + c.width / 2);
        const dy = (s.top + s.height / 2) - (c.top + c.height / 2);

        const cardFade = 1 - seg(0.45, 0.60);

        cards.forEach((card, i) => {
          gsap.set(card, {
            x: moves[i].x * m + dx * away * 0.55,
            y: moves[i].y * m + dy * away * 0.55,
            opacity: cardFade,
          });
        });
        gsap.set(target, {
          x: dx * away * 0.55,
          y: dy * away * 0.55,
          opacity: (m > 0.85 ? 1 : 0) * cardFade,
        });

        // ── 3) 문구가 뜬다. 카드가 사라진 뒤다 ──────
        gsap.set(label, {
          opacity: seg(0.55, 0.68) * (1 - seg(0.78, 0.9)),
          y: (1 - seg(0.55, 0.68)) * 14,
        });

        /* ── 4) 대시보드가 드러난다 ──────────────────
           문구가 뜨는 동안엔 아직 안 보인다. 문구가 물러나면서 서서히 나타난다.
           다 드러난 뒤부터는 원래 있던 대시보드 애니메이션이 이어받는다.

           대시보드의 transform 은 promo-motion 이 잡고 있다. 겹쳐 쓰면 서로
           덮어써서 깜빡인다. 그래서 여기서는 감싸는 .stage 의 투명도만 만진다. */
        const reveal = ease(seg(0.72, 0.98));
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
        {/* 카드가 넘어간 뒤 그 자리에서 뜬다. 그래서 스택 안에 둔다. */}
        <p className="svm-label">
          <span className="s">따로 굴러다니던 일이</span>
          <span className="s">한 화면으로 모입니다.</span>
        </p>
      </div>
    </div>
  );
}
