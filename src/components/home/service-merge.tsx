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
        // 모이는 자리도 화면 세로 한가운데다 — 잡히는 순간부터 중앙에 있어야 한다
        const cy = innerHeight / 2;
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
      // .svm-card 의 CSS 값과 같아야 한다
      const CARD_W = 420;
      const CARD_H = 158;

      /* 전부 스크롤이 몬다. 저절로 돌아가는 부분은 없다. */
      const onScroll = () => {
        if (!shot || !stackEl) return;

        /* 진행도는 "얼마나 스크롤했나"로 잰다.
           화면 위치로 재면 첫 화면에서 이미 스택이 가운데라 0 이 안 나온다.

           순서를 또렷하게 나눈다. 겹치면 무슨 일이 일어나는지 안 읽힌다.

             p 0.00 ~ 0.34   흩어진 6장이 한 장으로 모인다 (여기까지 화면을 붙잡음)
             p 0.34 ~ 0.62   붙잡기가 풀리고, 모인 한 장이 화면 한가운데를
                             따라오며 대시보드 크기까지 커진다
                             (안쪽 글씨는 먼저 지워진다 — 빈 흰 네모가 된다)
             p 0.40 ~ 0.62   커지는 그 뒤에서 대시보드가 연하게 차오른다
             p 0.62          제자리에 닿는 순간 딱 진해진다 (쨍한 한 장면)
             p 0.62 ~ 0.68   흰 네모가 물러나고 대시보드가 연해진다
             p 0.68 ~ 0.76   그 위에 문구가 뜬다
             p 0.82 ~ 0.90   문구가 물러난다
             그 뒤            바로 조각 확대(「통장까지 붙어서」)가 이어받는다

           문구와 대시보드가 같이 떠 있으면 글자 위에 화면이 겹쳐 둘 다 안 읽힌다.
           그래서 겹치는 구간을 두지 않는다. */
        /* 마지막 단계(대시보드 등장)가 끝나는 지점이 곧 전체 끝이어야 한다.
           남는 구간이 있으면 다 끝났는데도 스크롤이 헛돈다. */
        const SPAN = innerHeight * 2.2;
        const p = Math.min(Math.max(scrollY / SPAN, 0), 1);
        const ease = (v) => v * v * (3 - 2 * v);
        const seg = (a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

        // ── 1) 모인다. 다 모일 때까지 화면을 붙잡는다 ──
        const m = ease(seg(0, 0.34));

        /* 붙잡혀 있는 동안에도 왼쪽 글이 조금씩 올라간다.
           완전히 멈춰 있으면 스크롤이 먹통인 것처럼 느껴진다.
           카드가 모이는 만큼만 살짝 — 다 모이면 120px 올라가 있다. */
        const holdEl = document.querySelector(".hero-hold");
        if (holdEl) holdEl.style.setProperty("--svm-lift", `${seg(0, 0.34) * 120}px`);

        /* ── 2) 모인 한 장이 화면 한가운데에 붙어 따라오며 커진다 ──
           스크롤을 내려도 카드는 늘 화면 세로 한가운데에 있다.
           그동안 가로로는 대시보드 자리로 옮겨가고, 크기는 대시보드만큼
           커진다. 그래서 "이 카드가 곧 저 화면이 된다" 가 읽힌다. */
        const down = ease(seg(0.34, 0.62));

        const st = stackEl.getBoundingClientRect();

        /* 대시보드 크기를 잰다. 우리가 카드 안에 앉히려고 변형해 둔 상태라
           그대로 재면 그 값이 다시 목표가 되어 카드가 안 커진다.
           변형을 잠깐 지우고 원래 크기를 잰 뒤 되돌린다. */
        const keepTf = shot.style.transform;
        shot.style.transform = "none";
        const s = shot.getBoundingClientRect();
        shot.style.transform = keepTf;

        /* 모이는 자리. 가로는 스택의 12% 지점, 세로는 늘 화면 한가운데다.
           스택은 스크롤을 따라 움직이므로, 세로만큼은 매 프레임 화면 기준으로
           다시 재야 카드가 중앙에 붙어 있는다. */
        const fromX = st.left + st.width * 0.12;
        const fromY = innerHeight / 2;

        /* 각 카드가 지금 있어야 할 자리 = 원래 자리에서 화면 중앙까지.
           measure() 는 처음 한 번만 재므로 세로는 여기서 매번 보정한다. */
        const stackCenterNow = st.top + st.height / 2;
        const centerFix = fromY - stackCenterNow;

        /* 목표: 가로는 대시보드 한가운데, 세로는 늘 화면 한가운데.
           한 번 모인 뒤로는 스크롤이 어디에 있든 카드 중심이
           화면 세로 한가운데에 딱 붙어 있어야 한다. */
        const toX = s.left + s.width / 2;
        const toY = innerHeight / 2;

        /* 가로와 세로에 서로 다른 곡선을 준다.
           같은 속도로 가면 대각선이 자로 그은 듯 뻣뻣하다.
           가로는 먼저 빠지고(easeOut), 세로는 늦게 따라붙어(easeIn→Out)
           호를 그리며 안착한다. */
        const easeOut = (v) => 1 - Math.pow(1 - v, 3);
        const easeInOut = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
        const dxRaw = seg(0.34, 0.62);
        const dx = (toX - fromX) * easeOut(dxRaw);
        const dy = (toY - fromY) * easeInOut(dxRaw);

        /* 대시보드 크기까지 커진다.
           scale 로 늘리면 그림자와 테두리까지 같이 늘어나 계단처럼 깨진다.
           실제 폭·높이를 바꿔서 그림자·테두리는 원래 굵기를 지킨다.

           크기를 줄여 잡으면(예: 화면 폭의 86%) 카드가 사라진 뒤 대시보드가
           제 크기로 커지면서 화면이 한 번 튄다. 대시보드 크기 그대로 맞춘다. */
        const toW = s.width;
        const toH = s.height;
        const curW = CARD_W + (toW - CARD_W) * down;
        const curH = CARD_H + (toH - CARD_H) * down;

        /* 흰 네모는 대시보드를 담는 그릇이다. 대시보드가 그 안에 들어 있으므로
           끝까지 남아 있다가, 대시보드가 제 크기로 풀릴 때 함께 물러난다. */
        const cardFade = 1 - seg(0.90, 1);
        // 커지는 동안 안쪽 글씨는 같이 늘어나면 깨져 보인다. 먼저 지워진다.
        const inkFade = 1 - seg(0.36, 0.50);

        /* 폭·높이를 늘리면 왼쪽 위를 기준으로 자라서 중심이 밀린다.
           늘어난 만큼 절반을 되돌려 중심을 붙잡는다. */
        const cx = -(curW - CARD_W) / 2;
        const cy = -(curH - CARD_H) / 2;

        /* 커질수록 대시보드의 생김새를 닮아간다.
           모서리와 그림자가 카드 그대로면 커졌을 때 어색하다. */
        const radius = 12 + (14 - 12) * down;
        const shadowY = 12 + (24 - 12) * down;
        const shadowBlur = 30 + (60 - 30) * down;

        /* 커지기 시작하면 맨 위 한 장만 남긴다.
           6장이 겹친 채 커지면 테두리가 여러 겹으로 비쳐 지저분하다. */
        const stackFade = 1 - seg(0.36, 0.46);

        cards.forEach((card, i) => {
          const isTop = i === cards.length - 1;
          gsap.set(card, {
            x: moves[i].x * m + dx + cx,
            y: moves[i].y * m + centerFix * m + dy + cy,
            width: curW,
            height: curH,
            borderRadius: radius,
            boxShadow: `0 ${shadowY}px ${shadowBlur}px -${20 + down * 14}px rgba(0,0,0,.4)`,
            opacity: cardFade * (isTop ? 1 : stackFade),
          });
          gsap.set(card.children, { opacity: inkFade });
        });
        /* 모이는 자리 표시는 카드가 다 모이기 전까지만 쓴다.
           커지는 동안 같이 두면 카드와 미세하게 어긋나 테두리가 겹쳐 보인다. */
        gsap.set(target, { opacity: 0 });

        /* ── 3) 빈 흰 네모 한가운데에 문구가 뜬다 ──────
           카드가 대시보드 크기가 되고 안쪽 글씨가 지워진 그 순간,
           그 흰 네모 안에 문구만 뜬다. 사라진 뒤에 대시보드가 나온다.
           문구는 화면에 붙어 있으므로 카드가 있는 화면 한가운데로 맞춘다. */
        const labelY = toY - innerHeight * 0.5;
        gsap.set(label, {
          opacity: seg(0.68, 0.76) * (1 - seg(0.82, 0.90)),
          y: labelY + (1 - easeOut(seg(0.68, 0.76))) * 14,
        });

        /* ── 4) 대시보드가 드러난다 ──────────────────
           문구가 뜨는 동안엔 아직 안 보인다. 문구가 물러나면서 서서히 나타난다.
           다 드러난 뒤부터는 원래 있던 대시보드 애니메이션이 이어받는다.

           대시보드의 transform 은 promo-motion 이 잡고 있다. 겹쳐 쓰면 서로
           덮어써서 깜빡인다. 그래서 여기서는 감싸는 .stage 의 투명도만 만진다. */
        /* 커지는 동안 뒤에서 연하게 차오르다가(0.40~0.62),
           제자리에 닿는 순간(0.62) 딱 진해진다.
           그 뒤 살짝 연해져서 문구가 읽히게 자리를 내준다. */
        const rising = ease(seg(0.40, 0.62)) * 0.55;      // 연하게, 최대 0.55
        const snap = seg(0.62, 0.645);                    // 도착 순간 확 채운다
        /* 문구가 뜰 때 한 번 연해지고, 다시 진해지지 않는다.
           또 밝아지면 화면이 두 번 번쩍여 산만하다.
           연해진 그 상태로 조각 확대가 이어받는다 — 조각이 뜨면 어차피
           나머지가 흐려지므로 흐름이 그대로 이어진다. */
        const dim = seg(0.68, 0.76) * 0.4;
        const reveal = Math.min(rising + snap * (1 - 0.55), 1) - dim;

        const stageEl = shot.parentElement;
        if (stageEl) stageEl.style.opacity = String(Math.max(reveal, 0));

        /* 대시보드를 흰 카드 안에 정확히 앉힌다.
           둘이 따로 놀면 "카드가 대시보드가 된다" 가 안 읽힌다.
           카드가 다 커진 뒤에는 대시보드가 제 크기로 돌아간다. */
        const topCard = cards[cards.length - 1];
        const cr = topCard.getBoundingClientRect();
        const sr = s;                            // 위에서 이미 원래 크기로 재뒀다

        /* 카드와 대시보드가 이미 같은 크기·같은 자리가 되도록 위에서 맞춰 뒀다.
           그래도 남는 차이만 보정한다. 1px 아래는 건드리지 않는다 —
           미세한 값이 스크롤마다 계속 바뀌면 화면이 떨린다. */
        const ox = cr.left + cr.width / 2 - (sr.left + sr.width / 2);
        const oy = cr.top + cr.height / 2 - (sr.top + sr.height / 2);
        const sx = cr.width / sr.width;
        const sy = cr.height / sr.height;

        const needsFit =
          Math.abs(ox) > 1 || Math.abs(oy) > 1 ||
          Math.abs(sx - 1) > 0.002 || Math.abs(sy - 1) > 0.002;

        if (needsFit) {
          shot.dataset.svmFit = "1";            // promo-motion 이 덮어쓰지 않게
          shot.style.transformOrigin = "50% 50%";
          shot.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
        } else if (shot.dataset.svmFit) {
          delete shot.dataset.svmFit;
          shot.style.transform = "none";
        }
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
