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
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

    // 움직임을 줄이는 설정이면 모인 상태로 세워둔다. 스크롤 연동은 안 한다.
    if (reduce) {
      gsap.set(root, { opacity: 1 });
      gsap.set(label, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // 모일 자리까지의 거리를 잰다. 창 크기가 바뀌면 다시 잰다.
      const measure = () => {
        const t = target.getBoundingClientRect();
        return cards.map((card) => {
          // 이동값을 빼고 원래 자리에서 잰다
          const prevX = gsap.getProperty(card, "x");
          const prevY = gsap.getProperty(card, "y");
          gsap.set(card, { x: 0, y: 0 });
          const r = card.getBoundingClientRect();
          gsap.set(card, { x: prevX, y: prevY });
          return {
            x: t.left + t.width / 2 - (r.left + r.width / 2),
            y: t.top + t.height / 2 - (r.top + r.height / 2),
          };
        });
      };

      let moves = measure();

      gsap.set(root, { opacity: 1 });

      // 스크롤에 맞춰 모인다. 스크럽이라 스크롤을 되돌리면 다시 흩어진다.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          end: "bottom 42%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        tl.to(
          card,
          {
            x: () => moves[i].x,
            y: () => moves[i].y,
            duration: 1,
            ease: "power2.inOut",
          },
          i * 0.06,
        );
      });

      // 다 모인 뒤에 문구가 뜬다. 모이는 중에 뜨면 흐릿하게 지나가 안 읽힌다.
      tl.to(label, { opacity: 1, duration: 0.35 }, ">");
      tl.to(target, { opacity: 1, duration: 0.35 }, "<");

      // 창 크기가 바뀌면 거리를 다시 잰다
      ScrollTrigger.addEventListener("refreshInit", () => {
        moves = measure();
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="svm" ref={rootRef}>
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
      <p className="svm-label">
        <span className="s">따로 굴러다니던 일이</span>
        <span className="s">한 화면으로 모입니다.</span>
      </p>
    </div>
  );
}
