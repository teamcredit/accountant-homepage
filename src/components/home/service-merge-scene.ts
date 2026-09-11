import { gsap } from "gsap";

/** Geometry and lifecycle for the existing service-card scene. */
export function setupServiceMerge(root: HTMLElement) {
    const sceneRoot = root.closest<HTMLElement>(".promo") || root;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...root.querySelectorAll<HTMLElement>(".svm-card")];
    const target = root.querySelector<HTMLElement>(".svm-target");
    // 문구는 대시보드(.stage) 안에 있다 — 커진 네모 위에 떠야 하기 때문
    const label = sceneRoot.querySelector<HTMLElement>(".svm-label");
    if (!cards.length || !target) return;

    /* 좁은 화면에서는 이 연출을 통째로 안 한다.
       CSS 는 이미 1000px 아래에서 .svm 을 display:none 으로 빼 두는데,
       그런데도 아래 스크롤 계산은 계속 돌고 있었다. 감춰진 스택을 재면
       모든 값이 0 이라, 카드가 가야 할 거리도 0 이 되고 그 0 을 기준으로
       .stage 의 visibility 와 opacity 를 켰다 껐다 했다.
       휴대폰에서 빠르게 내릴 때 화면이 튀던 게 이것이다. */
    const narrow = matchMedia("(max-width: 1000px)").matches;

    // 움직임을 줄이는 설정이거나 좁은 화면이면 대시보드는 그냥 보인다.
    if (reduce || narrow) {
      gsap.set(root, { opacity: 1 });
      gsap.set(label, { opacity: 1 });
      const stageEl = sceneRoot.querySelector<HTMLElement>(".stage");
      if (stageEl) { stageEl.style.opacity = "1"; stageEl.style.visibility = ""; }
      return;
    }

    const scene = root.closest('.promo') || root;
    const originalStyles = [...scene.querySelectorAll<HTMLElement>('.svm, .svm *, .stage, .shot, .shot-win, .hero-copy, .hero-hold, .svm-label')].map(el => [el, el.getAttribute('style')] as const);
    const ctx = gsap.context(() => {
      /* 각 카드가 모이는 자리까지 가야 할 거리를 잰다.
         기준은 스택(움직이지 않는 것)이다 — target 은 카드와 함께
         움직이므로 그걸로 재면 거리가 0 이 되어 아무 일도 안 일어난다. */
      /* 눈에 보이는 카드 크기. .svm-card 의 CSS 값과 같아야 한다.
         measure() 가 이 값을 쓰므로 그보다 먼저 정해 둔다. */
      const CARD_W = 420;
      const CARD_H = 158;

      /* CSS 변수는 자식에게 물려준다. 그래서 카드에 변수 하나를 쓰면
         그 안에 든 대시보드 복제본(수백 칸)까지 전부 다시 계산한다.
         값이 그대로면 안 쓴다. 소수점도 잘라서 미세한 값 변화로 헛돌지 않게 한다.
         (재 보니 버벅임의 주범은 아니었다. 그래도 헛일은 안 하는 게 맞다.) */
      const varCache = new WeakMap<HTMLElement, Record<string, string>>();
      const setVar = (el: HTMLElement, name: string, val: string) => {
        let m = varCache.get(el);
        if (!m) { m = {}; varCache.set(el, m); }
        if (m[name] === val) return;
        m[name] = val;
        el.style.setProperty(name, val);
      };
      const r3 = (v: number) => (Math.round(v * 1000) / 1000).toString();

      /* 카드 자리를 잰 그 순간 스택이 어디 있었는지. 스크롤을 내리면 스택이
         위로 밀려 올라가는데, 그만큼 되돌려 줘야 카드가 제자리에 선다.
         "얼마나 밀렸나" 는 이 값과 지금 자리의 차이로만 알 수 있다. */
      let stackTop0 = 0;

      const measure = () => {
        const stackEl = root.querySelector<HTMLElement>(".svm-stack") || root;
        const st = stackEl.getBoundingClientRect();
        stackTop0 = st.top;
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
          /* 세로는 카드 "위쪽 가장자리" 기준으로 잰다.
             카드가 위쪽을 축으로 커지므로 기준을 하나로 맞춰야 어긋나지 않는다.
             눈에 보이는 카드 높이(CARD_H)의 절반만큼 올려 화면 한가운데로 맞춘다. */
          return {
            x: cx - (r.left + r.width / 2),
            y: cy - CARD_H / 2 - r.top,
          };
        });
      };

      const shot = sceneRoot.querySelector<HTMLElement>(".shot");
      const stackEl = root.querySelector<HTMLElement>(".svm-stack");
      /* 한 바퀴 도는 동안 절반은 판의 뒤가 보인다. 그때 서는 면.
         카드와 똑같이 움직이되 180° 돌아가 있어서,
         카드가 등을 보이는 순간에만 이 면이 정면이 된다.
         두 면 다 backface-visibility:hidden 이라 서로 겹치는 구간이 없다. */
      const backEl = root.querySelector<HTMLElement>(".svm-back");
      /* 왼쪽 글. 카드가 다 모이면 물러난다 — 그 뒤는 대시보드 차례다. */
      const copyEl = sceneRoot.querySelector<HTMLElement>(".hero-copy");
      /* 매 프레임 다시 찾을 필요가 없는 것들. 스크롤 한 번에 세 번씩
         DOM 을 뒤지면 그만큼 늦어진다 — 한 번만 찾아 들고 있는다. */
      const holdEl = sceneRoot.querySelector<HTMLElement>(".hero-hold");
      const shotWinEl = shot?.querySelector<HTMLElement>(".shot-win");
      const topCardRef = cards[cards.length - 1];

      /* 맨 위 카드 안에 대시보드를 미리 심는다.
         이게 이 연출의 핵심이다. 예전에는 카드를 지우고 대시보드를 켜는
         "바꿔치기" 였는데, 그 순간 밝기가 튀고 자리가 미세하게 어긋나 떨렸다.
         이제 카드 안에 같은 화면이 처음부터 들어 있어서 바꿀 게 없다.
         돌아오는 동안 그냥 배어 나오기만 한다. */
      const topCardEl = cards[cards.length - 1];
      const peek = topCardEl?.querySelector<HTMLElement>(".svm-peek");
      const dbEl = sceneRoot.querySelector<HTMLElement>(".shot-win > .db");
      if (peek && dbEl && !peek.firstChild) {
        const clone = dbEl.cloneNode(true) as HTMLElement;
        clone.inert = true;
        /* 복제본은 그림일 뿐이다. id 가 겹치면 원본을 찾는 코드가
           엉뚱한 걸 잡는다. 전부 지운다. */
        clone.removeAttribute("id");
        clone.querySelectorAll<HTMLElement>("[id]").forEach((n) => n.removeAttribute("id"));
        clone.setAttribute("aria-hidden", "true");
        peek.appendChild(clone);
      }

      /* 카드는 처음부터 대시보드와 같은 크기로 만들어 두고 축소해서 쓴다.
         스크롤마다 width/height 를 바꾸면 브라우저가 글자를 매번 다시
         배치하느라 가장자리가 떨렸다. 크기는 한 번만 정한다. */
      const sizeCards = () => {
        if (!shot) return null;
        const keep = shot.style.transform;
        shot.style.transform = "none";
        const s0 = shot.getBoundingClientRect();
        shot.style.transform = keep;
        if (!s0.width || !s0.height) return null;
        /* 카드는 CSS 에 적힌 제 크기(420×158) 그대로 둔다.
           대시보드 크기로 만들어 두고 줄여 쓰면, 그 배율이 안쪽 글씨까지
           상속돼 이중으로 작아지고 자리도 계속 어긋난다.
           크기는 CSS 가 정하고, 커지는 일은 scale 하나만 맡는다. */
        cards.forEach((card) => {
          card.style.width = "";
          card.style.height = "";
          card.style.marginLeft = "";
          card.style.marginTop = "";
        });
        /* 카드 안 대시보드는 제 크기(대시보드 원래 크기)로 그린 뒤
           카드 안에 들어가도록 줄인다. 카드가 커지면 이 축소분이 상쇄되어
           마지막엔 아래 대시보드와 똑같은 크기가 된다. */
        if (peek) {
          peek.style.setProperty("--peek-w", `${Math.round(s0.width)}px`);
          peek.style.setProperty("--peek-h", `${Math.round(s0.height)}px`);
          /* 가로·세로를 다른 비율로 줄이면 대시보드가 찌그러진다.
             카드(420×158)와 대시보드(1440×780)는 비율이 달라서,
             각각 맞추면 세로가 가로보다 훨씬 심하게 눌린다 —
             그 상태로 카드가 커지면 눌린 글자가 그대로 확대돼 깨져 보인다.
             그래서 한 배율(가로 기준)로만 줄인다. 넘치는 아래쪽은 잘라낸다. */
          const s = CARD_W / s0.width;
          peek.style.setProperty("--peek-s0", String(s));
        }
        /* 뒷면은 카드 밖(스택 바로 밑)에 있다 — 카드 안에 넣으면
           overflow:hidden 때문에 3D 가 납작해진다.
           그래서 맨 위 카드가 원래 앉아 있는 자리를 그대로 베껴 준다.
           transform 은 매 프레임 카드와 똑같이 넣으므로 여기서는 자리만 맞춘다. */
        if (backEl && topCardEl) {
          backEl.style.left = `${topCardEl.offsetLeft}px`;
          backEl.style.top = `${topCardEl.offsetTop}px`;
        }
        return s0;
      };
      /* 크기를 먼저 정하고 나서 자리를 잰다.
         순서가 반대면 커지기 전 자리로 재서, 카드가 거의 안 움직인다. */
      let base = sizeCards();
      let moves = measure();
      let stickTop: number | null = null;

      /* 전부 스크롤이 몬다. 저절로 돌아가는 부분은 없다. */
      const onScroll = () => {
        if (!shot || !stackEl) return;

        /* 이 구간을 다 지났으면 손을 뗀다.
           남은 값(카드 잔상, 흐린 대시보드)이 페이지 끝까지 따라다니면
           스크롤을 아무리 내려도 안 사라지는 잔상이 된다. */
        if (scrollY > innerHeight * 2.2) {
          if (root.dataset.svmDone) return;
          root.dataset.svmDone = "1";
          gsap.set(cards, { opacity: 0 });
          gsap.set(target, { opacity: 0 });
          gsap.set(label, { opacity: 0 });
          if (backEl) gsap.set(backEl, { opacity: 0, display: "none" });
          if (stackEl) { stackEl.style.perspective = ""; stackEl.style.transformStyle = ""; }
          if (copyEl) gsap.set(copyEl, { opacity: 1, y: 0 });
          const st0 = shot.parentElement;
          if (st0) { st0.style.opacity = "1"; st0.style.visibility = ""; }
          if (shot.dataset.svmFit) {
            delete shot.dataset.svmFit;
            shot.style.transform = "none";
          }
          return;
        }
        delete root.dataset.svmDone;

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
        const ease = (v: number) => v * v * (3 - 2 * v);
        const seg = (a: number, b: number) => Math.min(Math.max((p - a) / (b - a), 0), 1);

        /* ── 구간을 딱 세 토막으로 나눈다 ──────────────
           예전에는 "모이는 것" 과 "도는 것" 이 같은 지점(0.34)에서
           시작해 통째로 겹쳐 있었다. 그래서 다 모이기도 전에 돌기 시작하고,
           정작 한 장으로 겹친 순간에는 회전이 이미 끝나 있었다.

             0.00 ~ 0.30   모인다 (여섯 장이 한 자리로)
             0.30 ~ 0.38   멈춘다 — 한 장이 된 걸 눈으로 확인하는 틈
             0.38 ~ 0.72   그제서야 돌면서 커진다
             0.72          정면으로 서고 대시보드로 넘어간다 */
        const MERGE_END = 0.30;
        const DWELL_END = 0.36;
        /* 도는 일과 커지는 일을 나눈다.
           같이 하면 판이 이미 세 배로 커진 채 돌아서 화면 밖으로 쓸려 나간다 —
           무엇이 도는지 안 보이고 흰 얼룩만 지나간다.
           작을 때 한 바퀴 다 돌고, 정면으로 선 뒤에 커진다. */
        const SPIN_END = 0.56;
        const TURN_END = 0.72;

        // ── 1) 모인다. 다 모일 때까지 화면을 붙잡는다 ──


        /* 붙잡혀 있는 동안에도 왼쪽 글이 조금씩 올라간다.
           완전히 멈춰 있으면 스크롤이 먹통인 것처럼 느껴진다.
           카드가 모이는 만큼만 살짝 — 다 모이면 120px 올라가 있다. */
        if (holdEl) setVar(holdEl, "--svm-lift", `${Math.round(seg(0, MERGE_END) * 120)}px`);

        /* ── 2) 모인 한 장이 화면 한가운데에 붙어 따라오며 커진다 ──
           스크롤을 내려도 카드는 늘 화면 세로 한가운데에 있다.
           그동안 가로로는 대시보드 자리로 옮겨가고, 크기는 대시보드만큼
           커진다. 그래서 "이 카드가 곧 저 화면이 된다" 가 읽힌다. */
        const down = ease(seg(SPIN_END, TURN_END));

        const st = stackEl.getBoundingClientRect();

        /* 대시보드 크기를 잰다. 우리가 카드 안에 앉히려고 변형해 둔 상태라
           그대로 재면 그 값이 다시 목표가 되어 카드가 안 커진다.
           변형을 잠깐 지우고 원래 크기를 잰 뒤 되돌린다. */
        /* 대시보드의 "변형 없는 원래 자리" 를 재야 한다.
           promo-motion 이 여기에 기울임을 걸어 두므로 잠깐 껐다 켠다. */
        const keepTf = shot.style.transform;
        shot.style.transform = "none";
        const s = shot.getBoundingClientRect();
        shot.style.transform = keepTf;

        /* 모이는 자리. 가로는 스택의 12% 지점, 세로는 늘 화면 한가운데다.
           스택은 스크롤을 따라 움직이므로, 세로만큼은 매 프레임 화면 기준으로
           다시 재야 카드가 중앙에 붙어 있는다.

           세로는 카드 "위쪽 가장자리" 가 어디 설지로 잰다 — 커지는 축과
           기준이 같아야 한다. 보이는 카드 높이(CARD_H)의 절반만큼 위로
           올려야 눈에는 화면 한가운데에 있는 것으로 보인다. */
        const fromX = st.left + st.width * 0.12;
        const fromY = innerHeight / 2 - CARD_H / 2;

        /* 스택은 스크롤을 따라 위로 올라간다(0 → -341px).
           그만큼 되돌려 줘야 카드가 화면에서 제자리에 선다.
           이걸 빼먹으면 스크롤할 때마다 카드가 같이 밀려 떨려 보인다. */
        /* 카드는 스택 안에 있으므로 스택이 스크롤을 따라 올라간 만큼 상쇄한다.
           "잰 순간의 스택 자리" 와 "지금 자리" 의 차이가 곧 밀린 거리다.

           예전엔 스택의 세로 한가운데를 화면 한가운데와 비교해서 구했는데,
           그러면 창 높이에 따라 오차가 그대로 남는다(창 높이 900 에서는
           우연히 0 이라 안 보였고, 1280 에서는 191px 어긋났다).
           그래서 카드가 다 커진 뒤 대시보드로 넘어갈 때 화면이 한 번 튀었다. */
        const centerFix = stackTop0 - st.top;

        /* 목표는 대시보드가 "붙어서 멈춰 설" 그 자리다.
           - 화면 한가운데를 노리면, 커지는 동안 중심은 고정이어도
             위쪽 가장자리가 위로 밀려나 스크롤마다 떨려 보인다.
           - 지금 대시보드 위치를 그대로 쓰면, 그게 스크롤을 따라
             움직이는 중이라 더 흔들린다.
           대시보드는 sticky 로 헤더 밑에 붙는다. 그 붙는 자리를 계산해 쓴다. */
        /* sticky 로 붙는 자리는 CSS 에 적힌 고정값이다. 매 프레임 물어보면
           그때마다 브라우저가 레이아웃을 다시 계산한다(강제 리플로우).
           한 번 재서 들고 있다가 창 크기가 바뀔 때만 다시 잰다. */
        if (stickTop == null) stickTop = parseFloat(getComputedStyle(shot).top) || 0;
        const toX = s.left + s.width / 2;
        /* 카드는 이제 위쪽 가장자리를 축으로 커진다(transform-origin 50% 0).
           그래서 목표도 "위쪽 가장자리가 설 자리" 로 잡는다.
           예전처럼 중심 기준으로 잡으면 카드가 제 높이의 절반만큼 위로
           올라가 화면 밖으로 잘려 나간다. */
        /* 다만 넘기는 순간 대시보드가 아직 sticky 로 붙지 않았을 수 있다.
           그때는 대시보드가 화면 아래쪽에 있는데, 카드만 붙는 자리에 서 있으면
           둘이 어긋나 위쪽에 빈 칸이 생긴다.
           그래서 "대시보드가 지금 실제로 있는 자리" 와 "다 붙었을 때 자리" 중
           아래쪽을 쓴다 — 카드는 늘 대시보드와 같은 자리에 선다. */
        const toY = Math.max(stickTop, s.top);

        /* 가로와 세로에 서로 다른 곡선을 준다.
           같은 속도로 가면 대각선이 자로 그은 듯 뻣뻣하다.
           가로는 먼저 빠지고(easeOut), 세로는 늦게 따라붙어(easeIn→Out)
           호를 그리며 안착한다. */
        const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
        const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
        /* 가로는 커지는 내내 부드럽게 옮겨간다.
           세로는 모이는 동안(0~0.34) 끝내고, 커질 때는 이미 제자리다 —
           커지면서 세로로도 움직이면 스크롤마다 위아래로 떨려 보인다. */
        const dxRaw = seg(SPIN_END, TURN_END);
        const dx = (toX - fromX) * easeOut(dxRaw);
        /* 세로도 커지는 내내 따라간다. 모이는 동안(0~0.34)에 끝내 버리면
           그 뒤 대시보드가 sticky 로 붙으며 자리를 옮길 때 카드가 못 따라가
           넘기는 순간 위쪽에 빈 칸이 생긴다. */
        /* 세로 이동은 모이기가 끝난 뒤에 시작한다.
           모이는 중(m)에 겹쳐서 움직이면 두 곡선이 서로 다른 속도로 더해져
           이음매에서 카드가 살짝 되튄다. 구간을 나눠 두면 한 방향으로만 간다. */
        const dy = (toY - fromY) * easeInOut(seg(SPIN_END, TURN_END));

        /* 도는 동안 한 번 아래로 처졌다가 제자리로 올라온다.
           목표 지점까지 직선으로만 가면 "돌면서 내려간다" 가 아니라
           "돌기만 하는 판" 으로 보인다. 회전의 한가운데(등을 보일 때)
           가장 깊이 내려가 있다가, 정면으로 서면서 딱 제자리에 앉는다. */
        const dropArc = Math.sin(ease(seg(DWELL_END, SPIN_END)) * Math.PI) * 150;

        /* 회전이 끝나면 3D 를 끈다.
           브라우저는 원근이 걸린 판을 "한 장의 그림" 으로 미리 구워 둔 뒤
           그걸 늘려서 보여준다. 작을 때 구운 그림이라, 세 배로 커지면
           글씨가 뭉개진다 — 사진을 확대한 것과 똑같다.
           돌기가 끝난 뒤엔 각도가 전부 0 이라 3D 가 필요 없다.
           그때부터 평면으로 바꾸면 브라우저가 매 크기마다 다시 그려서
           끝까지 또렷하다. */
        const flat = p >= SPIN_END;
        if (stackEl) {
          stackEl.style.perspective = flat ? "none" : "";
          stackEl.style.transformStyle = flat ? "flat" : "";
        }

        /* 회전 진행도. 카드 루프 안에서 쓰는 shape() 와 같은 곡선이다 —
           부풀림과 뒷면이 카드와 어긋나면 안 되므로 값을 하나만 쓴다. */
        const shapeT = (v: number) => v * v * (3 - 2 * v);
        const shape = shapeT;


        /* 대시보드 크기까지 커진다.
           scale 로 늘리면 그림자와 테두리까지 같이 늘어나 계단처럼 깨진다.
           실제 폭·높이를 바꿔서 그림자·테두리는 원래 굵기를 지킨다.

           크기를 줄여 잡으면(예: 화면 폭의 86%) 카드가 사라진 뒤 대시보드가
           제 크기로 커지면서 화면이 한 번 튄다. 대시보드 크기 그대로 맞춘다. */
        /* 카드는 이미 대시보드 크기다. 처음엔 작게 줄여 뒀다가 100% 로 편다.
           크기를 바꾸는 게 아니라 배율만 바꾸므로 글자 재배치가 없다 —
           예전에 가장자리가 떨리던 원인이 여기였다. */
        if (!base || Math.abs(base.width - s.width) > 1) base = sizeCards() || base;
        const toW = s.width;
        const toH = s.height;
        /* 카드는 제 크기(420×158)에서 시작해 대시보드 크기까지 커진다.
           대시보드는 가로로 길고 카드는 납작해서 비율이 다르므로
           가로·세로 배율을 따로 잡는다. */
        const scaleX = 1 + (toW / CARD_W - 1) * down;
        const scaleY = 1 + (toH / CARD_H - 1) * down;

        /* 안쪽 글씨는 카드가 커지는 만큼 역으로 줄여, 눈에는 늘 같은 크기다.
           같이 늘어나면 글자가 뭉개져 보인다. */
        const inkSX = 1 / scaleX;
        const inkSY = 1 / scaleY;
        /* 판을 세로로 되돌린 만큼 글자는 다시 맞춰야 찌그러지지 않는다. */
        const inkFix = inkSX / inkSY;

        /* 진짜 대시보드가 나타나는 그 순간 카드는 딱 사라진다.
           서서히 지우면 두 장이 겹쳐 보이는 구간이 생긴다.

           넘기는 지점은 카드가 다 돌아 정면으로 선 그 순간(0.60)이다.
           조금이라도 뒤로 미루면, 아직 미세하게 돌아가 있는 카드 위로
           진짜 대시보드가 겹쳐 글자가 두 겹으로 보인다. */
        const SWAP_AT = TURN_END;
        const cardFade = p >= SWAP_AT ? 0 : 1;
        // 커지는 동안 안쪽 글씨는 같이 늘어나면 깨져 보인다. 먼저 지워진다.
        const inkFade = 1 - seg(DWELL_END, DWELL_END + 0.04);

        /* 카드 안 대시보드가 배어 나온다.
           돌기 시작하는 그 순간부터 바로 드러나고, 회전이 절반쯤 갔을 때
           이미 다 찬다. 늦게 띄우면 한참을 빈 흰 판이 도는 것만 보여
           "무엇이 오고 있는지" 가 안 읽힌다.
           보여줄 게 대시보드니까, 도는 내내 그게 보여야 한다. */
        const peekIn = seg(DWELL_END, DWELL_END + 0.05);
        if (peek) {
          const peekOp = r3(peekIn);
          if (peek.style.opacity !== peekOp) peek.style.opacity = peekOp;
          /* 카드 안 대시보드는 찌그러지면 안 되므로 가로·세로 같은 배율로 줄인다.
             그런데 카드가 세로로 더 많이 눌려 있어서, 그대로 두면 아래가 잘려
             빈 칸이 보인다. 카드가 커질수록 그 눌림이 풀리므로
             대시보드도 같은 만큼 되돌려 준다 — 끝에는 딱 제 크기가 된다. */
          const s0v = parseFloat(peek.style.getPropertyValue("--peek-s0")) || 1;
          /* 그림은 늘 비율을 지킨다(가로·세로 같은 배율) — 찌그러지면 글자가 깨진다.
             대신 카드가 세로로 눌려 있는 만큼 그림을 미리 세로로 늘려 두고,
             그걸 카드의 눌림이 상쇄해 화면에서는 정상 비율로 보이게 한다.
             카드가 커지면서 눌림이 풀리면 그림도 자연히 제 크기가 된다. */
          setVar(peek, "--peek-sx", r3(s0v));
          setVar(peek, "--peek-sy", r3(s0v * (scaleX / scaleY)));

          /* 도는 동안 안쪽 타일이 둥글게 부풀어 판 위로 떠오른다.
             지금은 목업이지 진짜 화면이 아니다 — 그러니 물건처럼 보여도 된다.
             정면으로 서는 순간(회전 끝) 0 이 되어 아래 대시보드와 똑같아진다.
             안 그러면 넘기는 순간 모서리 굵기가 달라 두 장인 게 들통난다. */
          /* 도는 동안 한껏 부풀었다가, 커지기 시작하면 스르르 가라앉는다.
             정면으로 서서 대시보드가 될 때는 0 이어야 한다 —
             부풀림이 남아 있으면 아래 대시보드와 모서리 굵기가 달라 두 장인 게 들통난다. */
          setVar(peek, "--puff", r3(1 - down));
        }

        /* 카드는 위쪽 가운데를 축으로 커진다(transform-origin 50% 0).
           가운데를 축으로 잡으면 커지는 만큼 위쪽이 위로 밀려나
           스크롤마다 떨려 보인다. 위를 붙잡아 두면 아래로만 자란다.
           크기를 배율로 바꾸므로 예전처럼 자리를 되돌릴 보정값이 필요 없다. */
        const cx = 0;
        const cy = 0;

        /* 커질수록 대시보드의 생김새를 닮아간다.
           모서리와 그림자가 카드 그대로면 커졌을 때 어색하다. */
        const radius = 12 + (14 - 12) * down;
        const shadowY = 12 + (24 - 12) * down;
        const shadowBlur = 30 + (60 - 30) * down;

        /* 커지기 시작하면 맨 위 한 장만 남긴다.
           6장이 겹친 채 커지면 테두리가 여러 겹으로 비쳐 지저분하다. */
        /* 아래 다섯 장은 "멈춤" 구간 안에서 완전히 지운다.
           돌기 시작한 뒤까지 남아 있으면, 대시보드 뒤에 빈 흰 판이
           유령처럼 따라다니며 비친다. 한 장이 된 걸 보여주는 그 틈에
           조용히 사라져야, 돌기 시작할 땐 이미 한 장뿐이다. */
        const stackFade = 1 - seg(MERGE_END, DWELL_END);

        cards.forEach((card, i) => {
          const isTop = i === cards.length - 1;

          /* ── 1) 모이는 동안은 납작하다 ──────────────
             종이가 책상 위를 미끄러져 한 자리로 오는 것뿐이다.
             여기서 3D 로 돌면 뭘 봐야 할지 흩어진다.
             장마다 조금씩 늦게 도착한다 — 다 같이 오면 한 덩어리로 보인다. */
          /* 장마다 조금씩 늦게 출발하되, 도착은 다 같이 한다.
             예전에는 도착도 제각각이라 "다 모인 순간" 이 흐려졌다 —
             마지막 장이 한참 뒤에 와서 회전이 이미 시작된 뒤였다.
             출발만 어긋나게 두면 여섯 장인 게 읽히면서도 끝은 또렷하다. */
          const lag = ((cards.length - 1 - i) / cards.length) * 0.16;
          const raw = seg(lag, MERGE_END);

          /* 되튕기는 움직임(오버슈트)은 넣지 않는다.
             제자리를 지나쳤다 돌아오면 스크롤을 내리는 중에 카드가 잠깐
             위로 거슬러 올라가는데, 그게 화면에서는 떨림으로 보인다.
             스크롤은 한 방향으로만 가므로 카드도 한 방향으로만 가야 한다. */
          const mine = ease(raw);

          /* ── 2) 다 모인 뒤에야 3D 가 시작된다 ──────────
             한 장으로 겹쳐진 그 순간부터 돌기 시작한다.
             모이는 동안(turn=0)은 완전히 납작하다 — 각도가 전부 0 이다.
             돌아 나왔다가(중간) 다시 정면으로 선다(끝) — 정면이 곧 대시보드다.

             각도는 "돌았다가 되돌아오는" 산 모양이다.
             turn 0 → 0, 0.5 에서 최대, 1 → 0. */
          const turnRaw = seg(DWELL_END, SPIN_END);

          /* 애플이 고급스러운 진짜 이유는 각도가 아니라 "구간마다 속도가 다른 것"이다.
             실제 애플 페이지를 재보면, 스크롤의 앞 절반에서 움직임의 87% 를 끝내고
             나머지 13% 를 남은 절반에 쓴다 — 끝이 앞보다 7 배 느리다.
             그래서 마지막에 제품이 "스르르 멈춰 서는" 느낌이 난다.

             여기서도 같은 비율을 쓴다.
               앞 절반(0~0.5) : 열렸다가 되돌아오는 움직임의 87% 를 해치운다
               뒤 절반(0.5~1) : 남은 13% 를 천천히 —  정면에 사뿐히 안착한다 */
          /* 예전 곡선은 앞 절반에서 87% 를 끝내는 것이었다.
             그건 조금 열렸다 닫히는 움직임에는 맞았지만, 한 바퀴에는 안 맞는다 —
             스크롤을 조금만 내려도 이미 270° 를 지나가 버려서
             판이 휙 돌고 나서 남은 각도를 기어간다.
             한 바퀴는 고르게 돌아야 한 바퀴로 읽힌다. 시작과 끝만 부드럽게 한다. */
          const prog = shape(turnRaw);

          /* 열렸다가(prog 0.42 부근 최대) 다시 정면으로 닫힌다. */
          const swing = Math.sin(prog * Math.PI);

          /* 한 바퀴(360°) 돈다. 예전엔 46° 까지만 열었다가 되돌아왔는데,
             그건 "잠깐 기울인 종이" 로 보였다. 끝까지 돌려야 판에 앞뒤가
             있다는 게 읽히고, 다 돌아 정면으로 서는 순간이 곧 대시보드다.

             뒷면이 보이는 구간(90°~270°)에는 .svm-back 이 대신 선다.
             거기엔 글씨가 없다 — 뒷면에 정보가 있으면 읽으려다 회전을 놓친다. */
          const ry = -360 * prog;
          /* 세로로도 살짝 눕는다. 가로로만 돌면 회전축이 자로 그은 선처럼
             뻣뻣하다. 중간에 가장 많이 눕고 끝에서 다시 반듯해진다. */
          const rx = 10 * swing;

          /* 던져질 때 살짝 비스듬하다가 자리에 앉으며 반듯해진다.
             모이는 동안에만 준다 — 회전 구간까지 남으면 두 기울기가 겹쳐
             무엇 때문에 기울었는지 안 읽힌다.
             장마다 방향을 엇갈리게 해서 아무렇게나 놓인 서류처럼 보이게 한다. */
          const tossTilt = (i % 2 === 0 ? -1 : 1) * 7 * (1 - raw);
          const rz = -2.4 * swing + tossTilt;
          /* 도는 동안 앞으로 튀어나온다. 뒤로 물리면 원근에 눌려 작아지는데,
             그건 멀어지는 것이지 도는 게 아니다. 앞으로 나와야 손에 잡힐 듯 보인다. */
          const tz = 90 * swing;

          /* 돌아간 만큼 옆면(두께)이 드러난다. 정면·뒷면이면 0 이다.
             각도를 그대로 쓰면 한 바퀴 도는 동안 두께가 72px 까지 벌어져
             판이 아니라 벽돌이 된다. 옆으로 얼마나 기울었는지(sin)로 잡는다. */

          const side = Math.abs(Math.sin((ry * Math.PI) / 180));
          setVar(card, "--edge", r3(side * 9));

          /* 표면을 훑는 빛. 판이 기울수록 강해지고, 각도에 따라 자리가 옮겨간다.
             빛이 지나가야 유리처럼 보인다 — 이게 애플 느낌의 핵심이다.
             맨 위 한 장에만 준다. 여섯 장이 다 번쩍이면 싸구려로 보인다. */
          if (isTop) {
            /* 빛의 자리는 "지금 실제로 돌아간 각도" 에서 나온다.
               진행도로 대충 밀면 판은 가만있는데 빛만 흐르는 순간이 생겨
               스티커에 하이라이트를 그려 넣은 것처럼 보인다.
               면이 기울면 반사각이 그만큼 옮겨가므로, 각도에 그대로 물린다. */
            setVar(card, "--gloss-x", `${r3(50 + Math.sin((ry * Math.PI) / 180) * 90)}%`);
            /* 세기도 각도를 따른다. 정면일 때 0 — 마주 볼 땐 반사가 안 보인다. */
            setVar(card, "--gloss", r3(side * 0.85));
          } else {
            setVar(card, "--gloss", "0");
          }
          /* 판을 미리 구워 두게 만드는 세 가지를 같이 끈다.
             하나라도 남으면 브라우저는 여전히 그림을 늘려서 보여준다. */
          card.style.transformStyle = flat ? "flat" : "";
          card.style.backfaceVisibility = flat ? "visible" : "";
          card.style.willChange = flat ? "auto" : "";

          setVar(card, "--ink-sx", r3(inkSX));
          setVar(card, "--ink-sy", r3(inkSY));
          setVar(card, "--ink-fix", r3(inkFix));

          gsap.set(card, {
            x: moves[i].x * mine + dx + cx,
            /* 세로는 "지금 있는 자리 → 가야 할 자리" 를 매 프레임 그대로 잰다.
               여러 보정값을 겹쳐 더하면 스크롤마다 조금씩 어긋나 떨린다.
               스택이 스크롤을 따라 올라가는 만큼(centerFix) 늘 상쇄한다. */
            y: moves[i].y * mine + centerFix + dy + cy + dropArc,
            scaleX,
            scaleY,
            rotateX: flat ? 0 : rx,
            /* 360° 는 0° 와 같은 자리다. 평면으로 바꿔도 그림은 그대로다. */
            rotateY: flat ? 0 : ry,
            rotateZ: flat ? 0 : rz,
            z: flat ? 0 : tz,
            force3D: !flat,
            /* 커지는 축은 위쪽 가장자리다(그래야 제자리에 선 채로 자란다).
               돌아가는 축도 같아야 한다 — 축이 둘이면 도는 동안 자리가
               어긋나 떨린다. 위를 붙잡고 돌아서 아래쪽이 앞으로 나온다. */
            transformOrigin: "50% 0%",
            /* 원근을 스크롤에 묶는다. 고정하면 화면이 판을 멀리서 지켜보는
               느낌이라 뻣뻣하다. 판이 돌 때 시점이 가까워졌다가(원근이 강해짐)
               정면으로 설 때 다시 멀어지면, 카메라가 다가갔다 물러나는 것처럼
               보여 스크롤과 한 몸으로 움직인다. */
            transformPerspective: flat ? 0 : 1900 - swing * 500,
            /* 모서리는 배율만큼 나눠 둬야 화면에서 늘 같은 굵기로 보인다.
               가로·세로 배율이 다르므로 둘의 중간을 쓴다. */
            borderRadius: radius / ((scaleX + scaleY) / 2),
            /* 그림자는 빛과 짝이다. 판이 앞으로 나올수록(swing) 바닥에서 떠오르니
               그림자도 같이 깊어지고 넓게 퍼진다. 그래야 공중에 뜬 게 읽힌다.
               가까운 그림자 한 장 + 멀리 퍼지는 그림자 한 장을 겹친다. */
            /* 그림자도 배율만큼 나눠 둔다.
               안 나누면 카드가 3 배 커질 때 그림자도 3 배로 번져,
               화면 절반을 덮는 검은 얼룩이 된다.
               나눠 두면 커져도 늘 같은 굵기의 그림자를 유지한다. */
            boxShadow: (() => {
              const k = (scaleX + scaleY) / 2;
              const y = (shadowY + swing * 18) / k;
              const blur = (shadowBlur + swing * 40) / k;
              const spread = (20 + down * 14) / k;
              const near = (2 + swing * 6) / k;
              const nearBlur = (8 + swing * 12) / k;
              return (
                `0 ${y}px ${blur}px -${spread}px rgba(15,23,42,${0.28 + swing * 0.07}), ` +
                `0 ${near}px ${nearBlur}px -${6 / k}px rgba(15,23,42,${0.05 + swing * 0.05})`
              );
            })(),
            opacity: cardFade * (isTop ? 1 : stackFade),
          });
          const ink = card.querySelector<HTMLElement>(".svm-ink");
          if (ink) gsap.set(ink, { opacity: inkFade });

          /* 뒷면을 맨 위 카드와 똑같이 움직인다.
             판 하나가 도는 것처럼 보이려면 자리·크기·기울기가 전부 같아야 한다.
             다른 점은 180° 더 돌아가 있다는 것뿐 — 그래서 카드가 등을 보일 때
             이 면이 정면으로 선다. 둘 다 뒷면을 감추므로 겹치는 구간이 없다. */
          if (isTop && backEl) {
            gsap.set(backEl, {
              /* 평면으로 바뀐 뒤에도 남아 있으면 대시보드 뒤에 흰 판이 비친다. */
              display: flat ? "none" : "grid",
              x: moves[i].x * mine + dx + cx,
              y: moves[i].y * mine + centerFix + dy + cy + dropArc,
              scaleX, scaleY,
              rotateX: rx,
              rotateY: ry + 180,
              rotateZ: rz,
              z: tz,
              transformOrigin: "50% 0%",
              transformPerspective: 1900 - swing * 500,
              borderRadius: radius / ((scaleX + scaleY) / 2),
              /* 카드가 살아 있는 동안에만 뒤가 있다. 회전이 끝나면 같이 꺼진다. */
              opacity: cardFade,
            });
          }
        });
        /* 왼쪽 글은 지우지 않는다. 그냥 스크롤을 따라 위로 올라가 화면을 뜬다.
           사라지게 하면 "글이 증발했다" 로 읽혀서, 읽던 사람이 방금 본 게
           어디 갔나 하고 되돌아간다. 종이가 위로 넘어가듯 밀려 올라가면
           같은 페이지를 계속 읽고 있는 것으로 읽힌다.

           올라가는 일은 붙잡기(sticky)가 풀리면 저절로 된다. 그래서 여기서는
           아무것도 안 한다 — 투명도와 세로 위치를 원래대로 되돌려 놓기만 하고,
           올라가는 건 스크롤에 맡긴다. */
        if (copyEl) gsap.set(copyEl, { opacity: 1, y: 0 });

        /* 모이는 자리 표시는 카드가 다 모이기 전까지만 쓴다.
           커지는 동안 같이 두면 카드와 미세하게 어긋나 테두리가 겹쳐 보인다. */
        gsap.set(target, { opacity: 0 });

        /* ── 3) 빈 흰 네모 한가운데에 문구가 뜬다 ──────
           카드가 대시보드 크기가 되고 안쪽 글씨가 지워진 그 순간,
           그 흰 네모 안에 문구만 뜬다. 사라진 뒤에 대시보드가 나온다.
           문구는 화면에 붙어 있으므로 카드가 있는 화면 한가운데로 맞춘다. */
        /* 문구는 흰 카드 한가운데에 온다.
           카드는 위쪽을 붙잡고 아래로 자라므로, 그 실제 중앙을 매번 잰다. */
        /* 카드가 꺼지기 한 틱 전(0.56)에 문구가 이미 떠 있다.
           카드가 사라진 뒤에 띄우면 그 사이에 빈 화면이 한 번 생겨
           흐름이 끊긴다. 넘겨받을 것이 먼저 대기하고 있어야 한다.
           카드는 위쪽을 붙잡고 아래로 자라므로, 그 실제 중앙을 매번 잰다. */
        /* 카드 위치를 다시 재지 않는다 — 방금 우리가 넣은 값이라 이미 안다.
           재려면 브라우저가 레이아웃을 다시 계산해야 하고, 그게 프레임마다
           걸리면 스크롤이 걸리적거린다.
           카드 위 가장자리 = 원래 자리(fromY) + 이번 프레임에 더한 세로 이동. */
        const lastI = cards.length - 1;
        const cardTopNow =
          st.top + topCardRef.offsetTop +
          (moves[lastI].y + centerFix + dy + cy + dropArc);
        const labelY = cardTopNow + (CARD_H * scaleY) / 2 - innerHeight * 0.5;
        /* 문구는 바꿔치기가 끝난 뒤에 나온다(0.72 부터).
           예전엔 카드가 아직 밝을 때 미리 떠서, 글자가 숫자 위에 겹쳤다.
           그래서 글자 뒤에 흰 띠를 깔아야 읽혔다.
           지금은 화면이 먼저 연해지고 그다음 글자가 뜨므로 띠가 필요 없다. */
        gsap.set(label, {
          opacity: seg(TURN_END, TURN_END + 0.05) * (1 - seg(0.90, 0.96)),
          y: labelY,
        });

        /* ── 4) 대시보드가 드러난다 ──────────────────
           문구가 뜨는 동안엔 아직 안 보인다. 문구가 물러나면서 서서히 나타난다.
           다 드러난 뒤부터는 원래 있던 대시보드 애니메이션이 이어받는다.

           대시보드의 transform 은 promo-motion 이 잡고 있다. 겹쳐 쓰면 서로
           덮어써서 깜빡인다. 그래서 여기서는 감싸는 .stage 의 투명도만 만진다. */
        /* 카드 안에서 대시보드 그림이 점점 진해진다(0.40~0.62).
           제자리에 닿는 그 순간(0.62) 진짜 대시보드가 나타나고
           카드는 서서히가 아니라 딱 사라진다 — 바꿔치기다.
           같은 자리 같은 크기라 티가 안 난다. */
        const SWAP = TURN_END;
        const swapped = p >= SWAP;

        const stageEl = shot.parentElement;
        if (stageEl) {
          /* 바꿔치기 전에는 아예 감춘다. sticky 라 제자리에 붙기 전까지
             스크롤을 따라 흘러오는데, 그게 "레이어 두 장" 으로 보였다. */
          stageEl.style.visibility = swapped ? "" : "hidden";

          /* 투명도는 0 아니면 1, 두 값만 쓴다.
             예전엔 스크롤에 따라 0.1~1 사이를 계속 오갔는데, 그게 배경이
             밝아졌다 어두워졌다 하던 원인이었다.
             카드 안에 이미 같은 대시보드가 들어 있어서 딱 끊어도 티가 안 난다.
             문구 뒤에서 화면을 연하게 하는 일은 .shot-win.zoom 이 맡는다. */
          stageEl.style.opacity = swapped ? "1" : "0";
        }

        /* 문구가 떠 있는 동안 뒤 대시보드를 연하게 한다.
           아래 조각 설명(「통장까지 붙어서…」)이 뜰 때와 같은 정도(.1)로 맞춘다 —
           같은 화면에서 가려지는 정도가 다르면 두 장면이 따로 논다.
           밝기가 스르르 오가면 배경이 출렁여 보이므로, .zoom 과 똑같이
           CSS transition 에 맡기고 여기서는 켜고 끄기만 한다. */
        /* 인라인 스타일로 투명도를 넣으면, 뒤이어 조각 확대(.zoom)가
           같은 값을 CSS 로 잡을 때 서로 덮어써 깜빡인다.
           그래서 .zoom 과 똑같이 클래스 하나만 켜고 끈다. */
        if (shotWinEl) {
          /* 연해지는 건 글자보다 먼저 시작한다(0.66). 대시보드가 나타나는
             순간에 이미 연해져 있어야, 밝은 화면이 한 번 번쩍이지 않는다.
             .stage 는 그 전까지 감춰져 있으므로 연해지는 과정은 안 보인다. */
          const labelUp = p >= TURN_END - 0.06 && seg(0.90, 0.96) < 0.98;
          shotWinEl.classList.toggle("dim", labelUp);
        }

        /* 대시보드는 건드리지 않는다.
           카드에 맞추려고 매 프레임 옮기면(translate -473 → -105) 그 자체가
           "따로 노는 레이어" 로 보여 떨린다.
           대신 카드가 대시보드를 덮는 흰 판 노릇을 한다 —
           카드가 커질수록 덮개가 걷히며 대시보드가 드러난다. */
        if (shot.dataset.svmFit) {
          delete shot.dataset.svmFit;
          shot.style.transform = "none";
        }
      };
      /* ── 그리는 시각을 스크롤 이벤트가 아니라 화면 그리는 박자에 맞춴다 ──
         전에는 native scroll 이벤트로 돌았다. 브라우저는 빠르게 굴릴 때
         이 이벤트를 몰아서 한 번만 주거나 그리는 시각과 어긋나게 준다.
         그래서 카드는 한 프레임 늦은 자리에 그려지고, 다음 프레임에 두 칸을
         한꺼번에 따라잡는다 — 그게 「빨리 내리면 튄다」의 정체다.

         같은 페이지의 기능 구간(.feat-rail)이 안정적인 이유가 이거다.
         그쪽은 Lenis 의 rAF 안에서 돈다. 여기도 같은 박자로 맞춘다.
         값이 안 바뀌었으면 아무것도 안 한다 — 헛도는 비용은 없다. */
      let lastY = -1;
      let rafId = 0;
      const tick = () => {
        rafId = requestAnimationFrame(tick);
        if (scrollY === lastY) return;
        lastY = scrollY;
        onScroll();
      };
      gsap.set(root, { opacity: 1 });
      onScroll();                       // 첫 화면 상태를 바로 그린다
      rafId = requestAnimationFrame(tick);

      /* 창 크기가 바뀌면 거리와 카드 크기를 다시 잰다.
         단, 가로가 그대로면 다시 재지 않는다. 휴대폰은 주소창이 접히고
         펴질 때마다 세로만 바뀐 resize 를 쏘는데, 그때 measure() 가
         「스크롤한 뒤의 자리」를 새 기준으로 잡아 버려서 카드가 그만큼
         한 번에 뛰었다. 가로가 바뀔 때만 다시 잰다. */
      let lastW = innerWidth;
      const onResize = () => {
        if (innerWidth === lastW) return;
        lastW = innerWidth;
        stickTop = null;
        base = sizeCards() || base;
        moves = measure();
        lastY = -1;
        onScroll();
      };
      addEventListener("resize", onResize);

      return () => {
        removeEventListener("resize", onResize);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, root);

    return () => {
      ctx.revert();
      originalStyles.forEach(([el, style]) => { if (style === null) el.removeAttribute('style'); else el.setAttribute('style', style); });
      scene.querySelectorAll<HTMLElement>('[data-svm-fit]').forEach(el => delete el.dataset.svmFit);
    };
}
