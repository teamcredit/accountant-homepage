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

      /* 히어로 안(첫 화면)이라 스크롤로 모으면 구간이 안 나온다.
         화면에 들어오면 저절로 모이고, 다 모인 채로 남는다.
         모인 그 한 장이 아래 대시보드로 이어진다. */
      const tl = gsap.timeline({ paused: true });

      // 1) 흩어진 채로 아주 잠깐만 머문다 — "따로 놀던" 상태를 보여줄 만큼만
      tl.to({}, { duration: 0.45 });

      // 2) 한 장씩 가운데로 모인다
      cards.forEach((card, i) => {
        tl.to(
          card,
          {
            x: () => moves[i].x,
            y: () => moves[i].y,
            duration: 1.0,
            ease: "power3.inOut",
          },
          0.45 + i * 0.09,
        );
      });

      // 3) 다 모이면 한 장으로 굳는다. 문구는 여기서 안 띄운다 —
      //    스크롤을 내려 대시보드로 넘어갈 때 뜬다.
      tl.to(target, { opacity: 1, duration: 0.4 }, ">");

      /* 시작 조건: 화면에 들어와 있고 + 일정 팝업이 닫혀 있을 것.
         팝업이 떠 있는 동안 돌려버리면, 닫았을 때 이미 끝나 있어
         "합쳐지는 모습"을 통째로 놓친다. */
      let visible = false;
      let started = false;

      const io = new IntersectionObserver(
        (es) => { visible = es[0].isIntersecting; tryStart(); },
        { threshold: 0.3 },
      );
      // 팝업이 닫히는 걸 지켜본다
      const popWatch = new MutationObserver(() => tryStart());

      /* 팝업은 이 컴포넌트보다 늦게 그려질 수 있다.
         그래서 "지금 팝업이 없다"만 보고 출발하면, 곧 뜰 팝업 뒤에서
         애니메이션이 다 끝나 버린다. 팝업이 뜰 기회를 한 번 준 뒤에 판단한다. */
      let popupSettled = false;
      setTimeout(() => { popupSettled = true; tryStart(); }, 350);

      function tryStart() {
        if (started || !visible || !popupSettled) return;
        if (document.querySelector(".schp")) return;   // 팝업이 떠 있다
        started = true;
        tl.play();
        io.disconnect();
        popWatch.disconnect();
      }

      io.observe(root);
      popWatch.observe(document.body, { childList: true, subtree: true });

      /* 모인 한 장이 그대로 대시보드가 된다.
         스크롤을 내리면 모인 카드가 아래 대시보드 자리로 이동하면서 커지고,
         다 커진 순간 진짜 대시보드로 바뀐다. 화면 밖으로 사라지지 않는다. */
      const shot = document.querySelector(".shot");
      const onScroll = () => {
        if (!started || !shot) return;

        /* 기준 자리는 스택(움직이지 않는 것)으로 잰다.
           .svm-target 은 카드와 같이 움직이므로 그걸로 재면
           거리가 늘 0 으로 나와 아무 일도 안 일어난다. */
        const stackEl = root.querySelector(".svm-stack");
        const st = stackEl.getBoundingClientRect();
        const c = {
          left: st.left + st.width / 2 - 150,       // 모인 카드 폭 300 의 절반
          top: st.top + st.height / 2 - 59,         // 높이 118 의 절반
          width: 300,
          height: 118,
        };
        const s = shot.getBoundingClientRect();     // 대시보드가 설 자리

        /* 진행도: 모인 카드가 화면 가운데를 지나 위로 올라갈수록 1 에 가까워진다.
           이 구간 동안 카드가 대시보드 자리로 이동하며 커진다. */
        const startY = innerHeight * 0.52;
        const endY = innerHeight * 0.06;
        const t = Math.min(Math.max((startY - c.top) / (startY - endY), 0), 1);
        const e = t * t * (3 - 2 * t);              // 부드럽게

        // 카드 → 대시보드 자리까지의 거리와 크기 차이
        const dx = (s.left + s.width / 2) - (c.left + c.width / 2);
        const dy = (s.top + s.height / 2) - (c.top + c.height / 2);
        const sx = s.width / c.width;
        const sy = s.height / c.height;

        const fade = 1 - Math.max((e - 0.6) / 0.4, 0);
        // 커지는 동안 안쪽 글씨는 같이 늘어나면 안 된다. 일찍 물러난다.
        const inkFade = 1 - Math.min(e / 0.35, 1);

        cards.forEach((card, i) => {
          gsap.set(card, {
            x: moves[i].x + dx * e,
            y: moves[i].y + dy * e,
            scaleX: 1 + (sx - 1) * e,
            scaleY: 1 + (sy - 1) * e,
            opacity: fade,             // 다 커지면 진짜 대시보드에 자리를 넘긴다
          });
          gsap.set(card.children, { opacity: inkFade });
        });
        gsap.set(target, {
          x: dx * e, y: dy * e,
          scaleX: 1 + (sx - 1) * e,
          scaleY: 1 + (sy - 1) * e,
          opacity: fade,
        });

        // 문구는 넘어가는 도중에 떴다가, 대시보드가 되면 물러난다
        gsap.set(label, {
          opacity: Math.min(Math.max((e - 0.08) * 4, 0), 1) * (1 - Math.max((e - 0.6) / 0.3, 0)),
        });
      };
      addEventListener("scroll", onScroll, { passive: true });

      // 창 크기가 바뀌면 거리를 다시 잰다
      const onResize = () => { moves = measure(); };
      addEventListener("resize", onResize);

      return () => {
        io.disconnect();
        popWatch.disconnect();
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
      <p className="svm-label">
        <span className="s">따로 굴러다니던 일이</span>
        <span className="s">한 화면으로 모입니다.</span>
      </p>
    </div>
  );
}
