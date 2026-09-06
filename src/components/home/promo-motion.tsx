// @ts-nocheck -- 원본은 순수 JS 다. 타입을 붙이려 손대면 동작이 바뀔 위험이 있어
// 옮긴 그대로 둔다. 대신 브라우저에서 실제로 돌려서 확인한다.
/* eslint-disable */
"use client";

/**
 * 홈 스크롤 동작. 원본은 hometax-promo/index.html 의 인라인 <script> 였다.
 * 화면을 그리지 않는다 — DOM 에 붙어서 스크롤에 맞춰 클래스만 바꾼다.
 * 그래서 반환은 null 이다.
 *
 * 헤더 stuck 처리는 여기서 뺐다. 공통 Header 컴포넌트가 한다.
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PromoMotion() {
  useEffect(() => {
    // 원본 스크립트는 즉시실행 함수다. 그 안에서 이벤트를 붙이고 끝난다.
    const stop = (() => {
      const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* 이 화면을 떠날 때 전부 끊는다.
         안 끊으면 Lenis 와 raf 루프가 살아남아, 홈에 다시 들어올 때마다
         한 벌씩 더 쌓인다. 메뉴 이동이 점점 느려지는 원인이 이것이다.
         listener 는 signal 하나로 한꺼번에 뗀다. */
      const ac = new AbortController();
      const sig = ac.signal;
      const obs = [];
      const timers = new Set();
      const later = (fn, ms) => {
        const id = setTimeout(() => { timers.delete(id); if (!sig.aborted) fn(); }, ms);
        timers.add(id);
        return id;
      };
      let rafId = 0;

      /* 부드러운 스크롤. 메리디안 본가와 같은 Lenis, 같은 설정(lerp .2 / duration .65).
         관성을 낮춘 값이다 — .12 로는 손가락 한 번에 한 섹션이 통째로 넘어갔다.
         Lenis 가 스크롤을 직접 돌리므로 그 프레임에 맞춰 화면 계산을 해야 안 끊긴다. */
      let lenis = null;
      if (!rm && Lenis) {
        lenis = new Lenis({ lerp: 0.2, duration: 0.65, wheelMultiplier: 0.85, smoothWheel: true });
        // 스크롤을 프로그램으로 옮겨야 할 때(자동 캡처·테스트) 붙잡을 손잡이.
        // Lenis 를 거치지 않고 window.scrollTo 를 쓰면 곧바로 되돌려진다.
        window.__lenis = lenis;
        const raf = (t) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
        rafId = requestAnimationFrame(raf);
        lenis.on('scroll', () => frame());
      }


      const io = new IntersectionObserver((es) => {
        es.forEach(e => e.isIntersecting && (e.target.classList.add('on'), io.unobserve(e.target)));
      }, { threshold: .12, rootMargin: '0px 0px -6%' });
      obs.push(io);
      document.querySelectorAll('.rise, .rise-slow').forEach(el => io.observe(el));

      /* 「세금은 내는 것이 아니라 설계하는 것입니다」 — 이 한 문장은 읽히고 넘어가야 한다.
         화면 가운데에 처음 걸리는 순간 스크롤을 잠깐 붙잡는다. 한 번만 한다.
         두 번째부터도 잡으면 되돌아 올라갈 때 못 지나가는 화면이 된다. */
      const creed = document.getElementById('creed');
      if (!rm && lenis && creed) {
        let heldCreed = false;
        const creedIo = new IntersectionObserver((es) => {
          if (!es[0].isIntersecting || heldCreed) return;
          heldCreed = true;
          creedIo.disconnect();
          lenis.stop();
          later(() => lenis.start(), 900);
        }, { threshold: .55 });
        obs.push(creedIo);
        creedIo.observe(creed);
      }

      /* 문제 구간. 고정한 채 인용문이 넘어간다.
         스크롤 핸들러를 따로 두지 않고 onFrame 한 곳에서만 처리한다
         (여러 핸들러가 각자 돌면 서로 어긋난다). */
      /* 홈에만 있다. /portal 에는 없으니 없어도 그냥 넘어간다. */
      const pin = document.getElementById('why');
      const slabs = pin ? [...pin.querySelectorAll('.slab')] : [];
      const bars = [...(document.getElementById('prog')?.children || [])];
      let lastStep = -1;

      function onFrame() {
        if (!pin) return;
        const r = pin.getBoundingClientRect();
        const span = r.height - innerHeight;
        if (span <= 0) return;
        // 한 인용문당 두 칸. 질문 → 답. 단계마다 머무는 구간이 있다.
        const steps = slabs.length * 2;
        let step = Math.min(stepOf(pin, steps).idx, steps - 1);
        if (lastStep >= 0 && step !== lastStep) step = step > lastStep ? lastStep + 1 : lastStep - 1;
        if (step === lastStep) return;
        lastStep = step;

        const i = Math.floor(step / 2);
        const isAnswer = step % 2 === 1;

        slabs.forEach((sl, k) => {
          sl.classList.toggle('on', k === i);
          sl.classList.toggle('past', k < i);
          sl.classList.toggle('answer', k === i && isAnswer);
        });
        bars.forEach((b, k) => b.classList.toggle('on', k <= i));
      }

      /* 스크롤에 반응하는 것들을 한 프레임에 모아서 처리한다.
         scroll 이벤트마다 계산하면 프레임과 어긋나 끊겨 보인다.
         스크롤 자체는 가로채지 않는다. 트랙패드·휠·키보드가 그대로 돌아간다. */
      let queued = false;
      function frame() {
        queued = false;
        onFrame();
        parallax();
        featScroll();
        anchorScroll();
        mergeScroll();
        vsScroll();
        statsScroll();
      }
      function schedule() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
      addEventListener('scroll', schedule, { passive: true, signal: sig });
      addEventListener('resize', schedule, { passive: true, signal: sig });
      // 첫 그리기는 스크립트 맨 끝에서 한 번만 부른다 (아래 함수들이 다 선언된 뒤).

      /* 히어로 대시보드 화면.
         들어올 때는 눕혀져 있다가 스크롤과 함께 일어선다.
         다 서면 그때부터 화면 안쪽이 위로 흐른다 — 대시보드를 훑는 느낌. */
      const shot = document.getElementById('shot');
      const shotWin = document.getElementById('shotWin');
      const shotImg = shotWin?.querySelector('.db');
      const tags = [...document.querySelectorAll('.hotspot')];
      let hsIdx = -1;
      const shotCap = document.getElementById('shotCap');
      let capIdx = -2;

      function parallax() {
        if (rm || !shot) return;
        const r = shot.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;

        /* 1단계: 눕은 것이 일어선다 (화면 아래에서 올라오는 동안).
           나타나고 사라지는 것(투명도)은 .stage 가 맡는다 — 위에서 모인 한 장이
           넘어온 뒤에야 드러나야 하고, 그 시점은 service-merge 가 안다. */
        const rise = Math.min(Math.max(1 - r.top / (innerHeight * 0.9), 0), 1);
        let e = 1 - Math.pow(1 - rise, 3);              // 끝에서 부드럽게

        /* 거의 다 선 뒤에는 딱 붙잡는다.
           0.9995 같은 값이 계속 미세하게 바뀌면 박스가 움찔움찔 떨린다.
           문턱을 넘으면 정확히 1 로 고정해 완전히 멈춘다. */
        if (e > 0.985) e = 1;

        /* transform 은 service-merge 가 카드 안에 앉히는 동안 쓰고 있다.
           여기서 덮어쓰면 둘이 싸워 깜빡인다. 다 앉힌 뒤에만 손댄다. */
        if (!shot.dataset.svmFit) {
          shot.style.transform =
            e === 1 ? 'none' : `rotateX(${(1 - e) * 14}deg) scale(${0.9 + e * 0.1})`;
        }
        shot.style.opacity = String(0.35 + e * 0.65);

        /* 2단계: 대시보드 위에서 조각이 하나씩 확대된다.
           단, 위쪽 "한 화면으로 모입니다" 문구가 아직 떠 있으면 기다린다 —
           둘이 겹치면 글자 위에 글자가 얹혀 아무것도 안 읽힌다.
           service-merge 가 문구를 다 물린 뒤에 이어받는다. */
        const label = document.querySelector('.svm-label');
        const labelUp = label && parseFloat(getComputedStyle(label).opacity) > 0.02;

        const stage = shot.parentElement;

        /* 문구가 떠 있는 동안만 기다린다.
           문구가 물러나면 곧바로 첫 조각을 짚어준다 — 사이에 빈 구간을 두면
           "다 끝났나?" 하고 흐름이 끊긴다.
           대시보드 전체를 보여주는 시점은 그 앞(문구 뜨기 전)에 이미 있다. */
        const clear = stepOf(stage, 1).t;     // .stage 안에서의 진행도 0~1

        /* 문구가 떠 있는 동안, 그리고 문구가 뜨기 전 구간에는 조각을 안 띄운다.
           안 막으면 대시보드가 처음 진해질 때 조각이 잠깐 떴다 사라져
           깜빡이는 것처럼 보인다. */
        /* 문구가 물러나는 지점(.stage 진행도 약 0.185)에 맞춘다.
           더 뒤로 잡으면 문구가 사라진 뒤 빈 구간이 생겨 흐름이 끊긴다. */
        const START = 0.185;
        if (labelUp || clear < START) {
          tags.forEach(t => t.classList.remove('on'));
          shotWin?.classList.remove('zoom');
          if (shotCap) { shotCap.innerHTML = ''; capIdx = -2; }
          hsIdx = -1;
          return;
        }

        // 지금 어느 구간인지 하나만 고른다. 마지막 조각은 끝까지 남는다
        // (구간을 폭으로 재면 스크롤 끝에서 아무것도 안 뜬다).
        // 단계마다 머무는 구간이 있다. 문턱을 넘어야 다음 조각으로.
        /* 문구가 물러난 지점부터 남은 구간을 조각 수로 나눈다.
           앞 구간을 빼지 않으면 문구가 사라지자마자 두 번째 조각이 떠 버린다. */
        const after = Math.max((clear - START) / (1 - START), 0);
        let pick = Math.min(Math.floor(after * tags.length), tags.length - 1);
        if (hsIdx >= 0 && pick !== hsIdx) pick = pick > hsIdx ? hsIdx + 1 : hsIdx - 1;
        hsIdx = pick;

        let anyOn = false;
        tags.forEach((t, i) => {
          const on = i === pick;
          t.classList.toggle('on', on);
          if (on) anyOn = true;
        });
        // 설명은 화면 하단 한 자리에서만 갈아끼운다
        if (shotCap && pick !== capIdx) {
          capIdx = pick;
          const html = pick >= 0 ? tags[pick].querySelector('.say').innerHTML : '';
          shotCap.innerHTML = html ? `<p>${html}</p>` : '';
          requestAnimationFrame(() => shotCap.querySelector('p')?.classList.add('on'));
        }
        shotWin?.classList.toggle('zoom', anyOn);
      }



      /* 지표 띠. 붙어 있는 동안 숫자가 하나씩 드러난다. */
      const statsRail = document.querySelector('.stats-rail');
      const statEls = [...document.querySelectorAll('.stat')];
      function statsScroll() {
        if (rm || !statsRail || !statEls.length) return;
        // 마지막 칸까지 레일 끝을 다 써버리면 그 칸은 켜지기 전에 화면을 지나간다.
        // 앞쪽 80% 안에서 다 켜지게 하고, 남은 20% 는 다 켜진 채로 머문다.
        const step = stepOf(statsRail, statEls.length);
        const i = Math.min(Math.floor(step.t / 0.8 * statEls.length), statEls.length - 1);
        statEls.forEach((el, k) => el.classList.toggle('on', k <= i));
      }
      makeSnap(statsRail, statEls.length);

      /* 비교표. 우리 칸 전체가 한 번 커진다. 줄마다 하면 산만하다. */
      const vsRail = document.querySelector('.vs-rail');
      const vsTable = document.querySelector('.vs');
      /* 칸마다 회전축을 "메리디안 칸 전체의 한가운데"로 맞춘다.
         이래야 여섯 칸이 한 판처럼 같이 돈다. */
      function vsOrigin() {
        if (!vsTable) return;
        const cells = [...vsTable.querySelectorAll('.ours')];
        if (!cells.length) return;
        const top = cells[0].offsetTop;
        const mid = top + (cells.at(-1).offsetTop + cells.at(-1).offsetHeight - top) / 2;
        cells.forEach(c => c.style.setProperty('--oy', (mid - c.offsetTop) + 'px'));
      }
      addEventListener('resize', vsOrigin, { signal: sig });
      document.fonts?.ready.then(vsOrigin);
      later(vsOrigin, 300);

      function vsScroll() {
        if (rm || !vsRail || !vsTable) return;
        const r = vsRail.getBoundingClientRect();
        const span = vsRail.offsetHeight - innerHeight;
        if (span <= 0) return;
        const t = -r.top / span;
        // 이 구간에 들어오면 메리디안 칸이 한 번 살짝 강조됐다 돌아온다.
        const on = t > 0.32 && t < 0.78;
        if (on && !vsTable.classList.contains('grown')) vsOrigin();  // 켜지기 직전에 축을 다시 잰다
        vsTable.classList.toggle('grown', on);
      }

      /* 카드가 다 모이면 틈이 닫히고 한 판이 된다. */
      const gatherEl = document.getElementById('gather');
      const gridEl = document.querySelector('.gather-grid');
      function mergeScroll() {
        if (rm || !gatherEl || !gridEl) return;
        const r = gatherEl.getBoundingClientRect();
        const span = r.height - innerHeight;
        if (span <= 0) return;
        const t = Math.min(Math.max(-r.top / span, 0), 1);
        gridEl.classList.toggle('merged', t > 0.7);
      }

      /* 우측 앵커. 지금 보고 있는 구역에 불이 들어온다.
         남색 구간 위에서는 색을 뒤집는다. */
      const anchor = document.getElementById('anchor');
      const anchorLinks = [...(anchor?.querySelectorAll('a') || [])];
      const secs = anchorLinks
        .map(a => ({ a, el: document.getElementById(a.dataset.sec) }))
        .filter(x => x.el);

      function anchorScroll() {
        if (!anchor) return;
        anchor.classList.toggle('on', scrollY > innerHeight * 0.5);

        const mid = innerHeight / 2;
        let cur = secs[0];
        for (const s of secs) if (s.el.getBoundingClientRect().top <= mid) cur = s;
        anchorLinks.forEach(a => a.removeAttribute('aria-current'));
        cur?.a.setAttribute('aria-current', 'true');

        // 앵커가 짙은 구간 위에 있으면 밝게.
        // .invert 는 이제 흰 구간이다. 짙은 데는 .deep 이 붙은 칸과 첫 화면뿐이다.
        const onDark = [...document.querySelectorAll('.invert.deep, .about-stage, .about-stage-static')].some(el => {
          const r = el.getBoundingClientRect();
          return r.top < mid && r.bottom > mid;
        });
        anchor.classList.toggle('dark', onDark);
      }



      /* 기능. 왼쪽을 누르면 오른쪽 실제 화면이 바뀐다. */
      const CAPS = [
        ['meridianco.kr/dashboard/dashboard', '확정 전이라도 지금까지 모인 자료로 계산합니다. 마진율과 전년 대비 증감이 같이 나옵니다.'],
        ['meridianco.kr/dashboard/dashboard', '매출·매입·손익을 작년 같은 기간과 한 표에 놓습니다. 차이와 증감률까지 같이 봅니다.'],
        ['meridianco.kr/dashboard/dashboard', '올해와 작년을 나란히 세운 막대. 계절성이 있는 업종에서 특히 잘 보입니다.'],
        ['meridianco.kr/dashboard/dashboard', '카드 매입은 청구 시차가 있습니다. 숨기지 않고 며칠까지 반영됐는지 적어둡니다.'],
        ['meridianco.kr/dashboard/dashboard', '증빙 유형별 구성과 상위 지출처. 어디에 얼마가 나가는지 비율로 봅니다.'],
        ['meridianco.kr/dashboard/dashboard', '불공제 후보, 갑자기 늘어난 매입처, 고액 1회성 지출을 먼저 짚어줍니다.'],
      ];
      /* 기능 구간. 화면이 붙어 있는 동안 스크롤이 지나가며
         왼쪽 문구와 오른쪽 화면이 함께 갈아탄다.
         기기 틀은 스크롤에 맞춰 아주 조금씩 돌아간다 — 제품처럼 보이게. */
      const copies = [...document.querySelectorAll('.fc')];
      const panes  = [...document.querySelectorAll('.fpane')];
      const dots   = [...(document.getElementById('fdots')?.children || [])];
      const rail   = document.querySelector('.feat-rail');
      let featIdx = -1;

      function showFeat(i) {
        if (i === featIdx) return;
        // 한 번에 한 칸씩만. 두 칸 건너뛰면 카드가 순간이동한 것처럼 보인다.
        if (featIdx >= 0) i = i > featIdx ? featIdx + 1 : featIdx - 1;
        featIdx = i;

        copies.forEach((o, k) => o.classList.toggle('on', k === i));
        dots  .forEach((o, k) => o.classList.toggle('on', k === i));

        // 카드 덱: 지나간 것은 우측 하단으로 빠지고,
        // 대기 중인 것은 뒤에 겹쳐 살짝 보인다.
        panes.forEach((p, k) => {
          p.classList.remove('on', 'gone', 'wait');
          // 방금 넘어간 카드가 맨 위에서 빠져야 자연스럽다.
          // 뒤로 갈수록 낮춰서 겹침 순서를 유지한다.
          if (k < i) { p.classList.add('gone'); p.style.zIndex = String(20 + k); }
          else if (k === i) { p.classList.add('on'); p.style.zIndex = 10; }
          else {
            const d = k - i;
            p.classList.add('wait');
            p.style.setProperty('--dy', `${Math.min(d, 3) * 14}px`);
            p.style.setProperty('--sc', String(1 - Math.min(d, 3) * 0.035));
            p.style.zIndex = String(9 - Math.min(d, 3));
          }
        });
      }

      function featScroll() {
        if (!rail || !panes.length) return;
        showFeat(Math.min(stepOf(rail, panes.length).idx, panes.length - 1));
      }

      /* 근거 패널 */
      /* 근거 데이터. KPI 4개 × 기간 4개 = 16가지가 다 달라야
         "숫자를 누르면 그 숫자가 어디서 왔는지 나온다"가 증명된다. */
      const EV = {
        m: [
          { f: '전자세금계산서 <em>매출</em> 합계<br>+ 현금영수증 <em>발행</em>분<br>+ 신용카드 <em>매출</em>전표<br><br>집계 <em>318</em>건',
            t: '이 금액을 만든 거래처', n: '이번 달 318건을 합친 값입니다',
            r: [['㈜대성물산','42,180,000'],['한빛테크㈜','31,640,000'],['㈜정우엔지니어링','24,905,000'],['그 외 41곳','86,195,000']] },
          { f: '전자세금계산서 <em>매입</em> 합계<br>+ 사업용카드 <em>사용</em>액<br>+ 현금영수증 <em>수취</em>분<br><br>집계 <em>512</em>건',
            t: '무엇에 썼나', n: '이번 달 512건을 항목별로 묶었습니다',
            r: [['원자재 매입','58,310,000'],['외주 용역','27,440,000'],['임차·관리비','12,900,000'],['그 외','22,755,000']] },
          { f: '매출 <em>184,920,000</em><br>− 매입 <em>121,405,000</em><br>− 인건비 <em>14,920,000</em><br><br>확정 전 <em>잠정</em>치',
            t: '어떻게 이 값이 나왔나', n: '이번 달 기준, 더하고 뺀 과정 그대로입니다',
            r: [['매출','184,920,000'],['매입','-121,405,000'],['인건비','-14,920,000'],['잠정 손익','63,515,000']] },
          { f: '매출세액 <em>18,492,000</em><br>− 매입세액 <em>12,140,500</em><br><br>불공제 후보 <em>4</em>건 제외 전',
            t: '아직 안 뺀 불공제 후보', n: '이번 달 4건, 회계사가 확인 중입니다',
            r: [['접대성 경비','1,240,000'],['비영업용 차량','860,000'],['면세 관련 매입','420,000'],['증빙 미비','310,000']] },
        ],
        l: [
          { f: '전자세금계산서 <em>매출</em> 합계<br>+ 현금영수증 <em>발행</em>분<br>+ 신용카드 <em>매출</em>전표<br><br>집계 <em>294</em>건',
            t: '이 금액을 만든 거래처', n: '지난달 294건을 합친 값입니다',
            r: [['㈜대성물산','38,900,000'],['㈜정우엔지니어링','29,120,000'],['한빛테크㈜','26,480,000'],['그 외 38곳','76,840,000']] },
          { f: '전자세금계산서 <em>매입</em> 합계<br>+ 사업용카드 <em>사용</em>액<br>+ 현금영수증 <em>수취</em>분<br><br>집계 <em>487</em>건',
            t: '무엇에 썼나', n: '지난달 487건을 항목별로 묶었습니다',
            r: [['원자재 매입','55,700,000'],['외주 용역','26,880,000'],['임차·관리비','12,900,000'],['그 외','22,740,000']] },
          { f: '매출 <em>171,340,000</em><br>− 매입 <em>118,220,000</em><br>− 인건비 <em>14,920,000</em><br><br>확정 전 <em>잠정</em>치',
            t: '어떻게 이 값이 나왔나', n: '지난달 기준, 더하고 뺀 과정 그대로입니다',
            r: [['매출','171,340,000'],['매입','-118,220,000'],['인건비','-14,920,000'],['잠정 손익','38,200,000']] },
          { f: '매출세액 <em>17,134,000</em><br>− 매입세액 <em>11,822,000</em><br><br>불공제 후보 <em>2</em>건 제외 전',
            t: '아직 안 뺀 불공제 후보', n: '지난달 2건, 회계사가 확인 중입니다',
            r: [['접대성 경비','640,000'],['비영업용 차량','410,000'],['—','—'],['—','—']] },
        ],
        q: [
          { f: '전자세금계산서 <em>매출</em> 합계<br>+ 현금영수증 <em>발행</em>분<br>+ 신용카드 <em>매출</em>전표<br><br>집계 <em>891</em>건',
            t: '이 금액을 만든 거래처', n: '이번 분기 891건을 합친 값입니다',
            r: [['㈜대성물산','118,400,000'],['한빛테크㈜','92,300,000'],['㈜정우엔지니어링','78,600,000'],['그 외 56곳','223,580,000']] },
          { f: '전자세금계산서 <em>매입</em> 합계<br>+ 사업용카드 <em>사용</em>액<br>+ 현금영수증 <em>수취</em>분<br><br>집계 <em>1,438</em>건',
            t: '무엇에 썼나', n: '이번 분기 1,438건을 항목별로 묶었습니다',
            r: [['원자재 매입','167,900,000'],['외주 용역','79,200,000'],['임차·관리비','38,700,000'],['그 외','63,810,000']] },
          { f: '매출 <em>512,880,000</em><br>− 매입 <em>349,610,000</em><br>− 인건비 <em>44,760,000</em><br><br>확정 전 <em>잠정</em>치',
            t: '어떻게 이 값이 나왔나', n: '이번 분기 기준, 더하고 뺀 과정 그대로입니다',
            r: [['매출','512,880,000'],['매입','-349,610,000'],['인건비','-44,760,000'],['잠정 손익','118,510,000']] },
          { f: '매출세액 <em>51,288,000</em><br>− 매입세액 <em>34,961,000</em><br><br>불공제 후보 <em>9</em>건 제외 전',
            t: '아직 안 뺀 불공제 후보', n: '이번 분기 9건, 회계사가 확인 중입니다',
            r: [['접대성 경비','2,910,000'],['비영업용 차량','1,740,000'],['면세 관련 매입','980,000'],['증빙 미비','620,000']] },
        ],
        y: [
          { f: '전자세금계산서 <em>매출</em> 합계<br>+ 현금영수증 <em>발행</em>분<br>+ 신용카드 <em>매출</em>전표<br><br>집계 <em>3,204</em>건',
            t: '이 금액을 만든 거래처', n: '올해 3,204건을 합친 값입니다',
            r: [['㈜대성물산','441,700,000'],['한빛테크㈜','352,900,000'],['㈜정우엔지니어링','287,400,000'],['그 외 73곳','864,220,000']] },
          { f: '전자세금계산서 <em>매입</em> 합계<br>+ 사업용카드 <em>사용</em>액<br>+ 현금영수증 <em>수취</em>분<br><br>집계 <em>5,180</em>건',
            t: '무엇에 썼나', n: '올해 5,180건을 항목별로 묶었습니다',
            r: [['원자재 매입','639,800,000'],['외주 용역','301,400,000'],['임차·관리비','154,800,000'],['그 외','236,880,000']] },
          { f: '매출 <em>1,946,220,000</em><br>− 매입 <em>1,332,880,000</em><br>− 인건비 <em>179,040,000</em><br><br>확정 전 <em>잠정</em>치',
            t: '어떻게 이 값이 나왔나', n: '올해 기준, 더하고 뺀 과정 그대로입니다',
            r: [['매출','1,946,220,000'],['매입','-1,332,880,000'],['인건비','-179,040,000'],['잠정 손익','434,300,000']] },
          { f: '매출세액 <em>194,622,000</em><br>− 매입세액 <em>133,288,000</em><br><br>불공제 후보 <em>27</em>건 제외 전',
            t: '아직 안 뺀 불공제 후보', n: '올해 27건, 회계사가 확인 중입니다',
            r: [['접대성 경비','8,740,000'],['비영업용 차량','5,120,000'],['면세 관련 매입','2,940,000'],['증빙 미비','1,860,000']] },
        ],
      };
      let period = 'm';
      const kpis = [...document.querySelectorAll('.kpi')];
      const form = document.getElementById('f-form');
      const rows = document.getElementById('f-rows');
      const rowTitle = document.getElementById('f-rowtitle');
      const rowNote = document.getElementById('f-rownote');
      let kpiIdx = 0;
      const paint = (i) => {
        if (!form || !rows) return;   // 근거 구간이 없는 페이지
        kpiIdx = i;
        const d = EV[period][i];
        form.innerHTML = d.f;
        if (rowTitle) rowTitle.textContent = d.t;
        if (rowNote) rowNote.textContent = d.n;
        rows.innerHTML = d.r.map(([a,b]) => `<div class="rw"><span>${a}</span><span>${b}</span></div>`).join('');
      };
      kpis.forEach((k, i) => k.addEventListener('click', () => {
        kpis.forEach(o => o.setAttribute('aria-expanded', String(o === k)));
        paint(i);
      }, { signal: sig }));
      paint(0);

      document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
        const p = tab.dataset.p;
        period = p;
        paint(kpiIdx);
        document.querySelectorAll('.kpi .val').forEach(el => {
          if (rm) { el.textContent = el.dataset[p]; return; }
          countUp(el, el.dataset[p], 650);
        });
        document.querySelectorAll('.kpi .cmp').forEach(el => {
          el.style.transition = 'opacity .25s';
          el.style.opacity = 0;
          later(() => { el.textContent = el.dataset[p]; el.style.opacity = 1; }, 130);
        });
      }, { signal: sig }));


      /* 카드가 흩어져 있다가 한 격자로 모인다.
         ui-ux-pro-max 의 GSAP 프리셋 조합:
           · Scroll Reveal / Complex — pin + scrub (섹션을 붙여놓고 스크롤에 물린다)
           · Stagger List / Standard — grid:'auto' 물결 (격자에서 자연스러운 순서)
         Lenis 와 ScrollTrigger 가 같은 스크롤을 보도록 연결한다. */
      // 좁은 화면에서는 흩뿌림을 하지 않는다. 카드가 화면 밖으로 나가 가로 스크롤이 생긴다.
      const wideEnough = innerWidth > 700;
      // CDN 시절엔 window.gsap 을 봤다. 지금은 import 로 들어오므로 그 검사를 뺀다.
      // 안 빼면 이 블록 전체가 건너뛰어져 카드 모이기·비교표·앵커가 죽는다.
      if (!rm && wideEnough) {
        gsap.registerPlugin(ScrollTrigger);

        if (lenis) {
          lenis.on('scroll', ScrollTrigger.update);
          ScrollTrigger.scrollerProxy(document.documentElement, {
            scrollTop(v) { return arguments.length ? lenis.scrollTo(v, { immediate: true }) : window.scrollY; },
          });
        }

        const cards = gsap.utils.toArray('.gc');
        if (cards.length) {
          // 시작 위치를 카드마다 흩뿌린다. 화면 밖으로는 안 나가게 값을 묶는다.
          cards.forEach((c, i) => {
            const col = i % 5, row = Math.floor(i / 5);
            // 제자리에서 조금씩만 흩어진다. 크게 밀면 서로 겹쳐서 한 장처럼 보인다.
            gsap.set(c, {
              xPercent: (col - 2) * 12,
              yPercent: (row - 1) * 16,
              rotate: (i % 2 ? 1 : -1) * (3 + (i % 4)),
              scale: 0.9, opacity: 0.15,
            });
          });

          gsap.timeline({
            scrollTrigger: {
              // sticky 로 이미 붙어 있으므로 pin 은 쓰지 않는다.
              // pin + pinSpacing:false 를 같이 쓰면 뒷 섹션이 끌려 올라와 겹친다.
              trigger: '#gather', start: 'top top', end: 'bottom bottom',
              scrub: 1,
            },
          })
          // 1단계: 흩어진 카드가 제자리를 찾는다
          .to(cards, {
            xPercent: 0, yPercent: 0, rotate: 0, scale: 1, opacity: 1,
            ease: 'power2.out',
            stagger: { each: 0.05, from: 'center', grid: 'auto' },
          })
          // 2단계: 틈이 닫히며 한 판이 된다
          .to('.gather-grid', { gap: 0, ease: 'power2.inOut', duration: 0.5 }, '>-0.1')
          .to(cards, {
            borderRadius: 0, ease: 'power2.inOut', duration: 0.5,
          }, '<')
          ;
        }

        // 이미지·폰트가 늦게 오면 위치가 어긋난다. 다 온 뒤 다시 잰다.
        addEventListener('load', () => ScrollTrigger.refresh(), { once: true, signal: sig });
      }


      /* 브레이크. 각 단계마다 "머무는 구간"을 둔다.
         한 단계는 [머묾 62% + 넘어감 38%] 로 나뉜다.
         머무는 동안은 스크롤해도 화면이 안 바뀐다 — 그래서 하나씩 보고 넘어간다.
         관성으로 두 칸 밀리는 것도 이걸로 막힌다. */
      function stepOf(el, steps, hold = 0.62) {
        const r = el.getBoundingClientRect();
        const span = el.offsetHeight - innerHeight;
        // 숫자 0 을 돌려주면 부르는 쪽에서 .t / .idx 를 읽다 터진다. 모양을 맞춘다.
        if (span <= 0) return { t: 0, idx: 0, within: 0, passing: false };
        const t = Math.min(Math.max(-r.top / span, 0), 0.99999);
        const unit = 1 / steps;
        const idx = Math.floor(t / unit);
        const within = (t - idx * unit) / unit;   // 그 단계 안에서의 진행도 0~1
        // 머무는 구간(hold)을 지나야 다음 단계로 넘어간다
        return { t, idx, within, passing: within > hold };
      }

      /* 스크롤이 멎으면 그 단계의 한가운데로 살짝 당긴다.
         문턱 근처에서 애매하게 걸쳐 있는 걸 막는다. */
      function makeSnap(el, steps) {
        if (rm || !el) return;
        let timer = null;
        addEventListener('scroll', () => {
          clearTimeout(timer);
          timer = later(() => {
            const span = el.offsetHeight - innerHeight;
            if (span <= 0) return;
            const t = -el.getBoundingClientRect().top / span;
            if (t < -0.02 || t > 1.02) return;
            const unit = 1 / steps;
            const idx = Math.min(Math.max(Math.round(t / unit - 0.3), 0), steps - 1);
            const target = el.offsetTop + span * (idx + 0.3) * unit;
            if (Math.abs(target - scrollY) < 4) return;
            if (lenis) lenis.scrollTo(target, { duration: .5, easing: (x) => 1 - Math.pow(1 - x, 3) });
            else scrollTo({ top: target, behavior: 'smooth' });
          }, 150);
        }, { passive: true, signal: sig });
      }
      makeSnap(document.getElementById('why'), slabs.length * 2);
      makeSnap(document.querySelector('.feat-rail'), panes.length);
      /* .stage 에는 스냅을 걸지 않는다.
         히어로에서 카드가 모여 내려오는 구간이 .stage 와 겹치는데,
         스냅이 그 구간에서 스크롤을 첫 단계(약 205px)로 계속 끌어당겨
         스크롤이 아예 안 내려갔다. 대시보드 조각 확대는 스냅 없이도 돈다. */


      /* 숫자가 0부터 올라간다. 값이 바뀔 때마다 다시 센다.
         tabular-nums 라서 자릿수가 흔들려도 칸이 안 밀린다. */
      function countUp(el, to, ms = 900) {
        const target = Number(String(to).replace(/[^\d.-]/g, ''));
        if (!isFinite(target)) { el.textContent = to; return; }
        const suffix = String(to).replace(/[\d,.-]/g, '');
        const t0 = performance.now();
        cancelAnimationFrame(el._raf);
        const tick = (now) => {
          const p = Math.min((now - t0) / ms, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('ko-KR') + suffix;
          if (p < 1) el._raf = requestAnimationFrame(tick);
        };
        el._raf = requestAnimationFrame(tick);
      }

      // 근거 섹션이 처음 보일 때 한 번 센다
      const evidSec = document.getElementById('evid');
      if (evidSec && !rm) {
        const once = new IntersectionObserver((es) => {
          es.forEach(e => {
            if (!e.isIntersecting) return;
            once.disconnect();
            document.querySelectorAll('.kpi .val').forEach(v => countUp(v, v.textContent));
          });
        }, { threshold: .3 });
        obs.push(once);
        once.observe(evidSec);
      }


      /* 섹션 사이 브레이크. 경계를 지날 때 한 번 멎었다 간다.
         붙어 있는 구간(rail)들은 자기 브레이크가 있으니 빼고,
         평범한 섹션들만 경계에서 살짝 잡는다. */
      const plainSecs = [...document.querySelectorAll('main > section, main > .wrap')]
        .filter(el => !el.querySelector('.feat-rail, .stats-rail, .vs-rail, .gather, .pin-inner, .stage'));
      if (!rm && plainSecs.length) {
        let t = null, lastY = scrollY;
        addEventListener('scroll', () => {
          const down = scrollY > lastY;
          lastY = scrollY;
          clearTimeout(t);
          t = later(() => {
            // 화면 위쪽에 걸친 섹션 경계를 찾는다
            for (const el of plainSecs) {
              const top = el.getBoundingClientRect().top;
              if (top > -90 && top < 220) {
                const target = el.offsetTop - 66;   // 헤더 높이만큼 띄운다
                if (Math.abs(target - scrollY) < 4) return;
                if (lenis) lenis.scrollTo(target, { duration: .5, easing: (x) => 1 - Math.pow(1 - x, 3) });
                else scrollTo({ top: target, behavior: 'smooth' });
                return;
              }
            }
          }, 170);
        }, { passive: true, signal: sig });
      }

      // 모든 선언이 끝난 뒤 첫 그리기
      frame();
      addEventListener('load', frame, { once: true, signal: sig });

      /* 뒷정리. 이 순서를 지킨다 — listener 를 먼저 떼고, 그 다음 예약을 지우고,
         마지막에 Lenis 를 없앤다. 반대로 하면 이미 없앤 Lenis 를 부르다 터진다. */
      return () => {
        ac.abort();
        timers.forEach(clearTimeout);
        timers.clear();
        obs.forEach(o => o.disconnect());
        if (rafId) cancelAnimationFrame(rafId);
        if (lenis) {
          lenis.destroy();
          if (window.__lenis === lenis) delete window.__lenis;
        }
      };
    })();


    return () => {
      stop();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
