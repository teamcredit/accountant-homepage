/* 유리를 휘게 하는 변위 지도. 페이지에 한 번만 있으면 된다.

   backdrop-filter: blur() 는 뒤를 뭉갠다 — 뒤가 사라지니 불투명한 판이 된다.
   유리는 뒤가 보이면서 휘어야 한다. 흐리기를 조금만 걸고 이 필터로 민다.

   ── 두 번 틀렸던 것. 다시 하지 말 것 ─────────────────────────

   ① feImage 에 x/y/width/height 를 주면 안 된다.
      서브영역 밖은 투명(R=0,G=0)이고 displacement 가 그걸 지도로 읽어
      화면 전체를 한 방향으로 민다. 재보니 좌·중앙·우 전부 +7px 로 똑같았다.
      가운데가 통째로 밀리면 휜 게 아니라 헤더 안에만 다른 판이 하나 더
      있는 것처럼 보인다.

   ② 좌우 띠는 가장자리에서 128 로 돌아와야 한다.
      좌우 띠는 화면 안쪽으로 계속 이어진다. 한쪽 끝만 128 이면 띠 오른쪽
      전부가 한 방향으로 밀린다 — 페이지가 통째로 옆으로 간다.
      그래서 좌우는 128 → 최고 → 128 로 갔다 온다.

      아랫입술은 반대다. 여기서는 돌아오면 안 된다.
      돌아오면 글이 유리 밑에서 한 번 불룩했다가 제자리로 튕겨 나온다 —
      물방울이지 유리가 아니다. 유리는 뒤엣것을 밀어 놓고 그대로 둔다.
      아래로는 유리가 끝나서(backdrop-filter 는 판 밖을 안 그린다) 밀린
      채로 끊긴다. 그 끊긴 자리가 유리의 모서리로 읽힌다.

   ③ 좌우만 밀면 세로선은 안 휜다.
      화면 가운데를 지나는 자오선은 좌우 띠에 닿지 않는다. 세로선이
      꺾이려면 헤더의 아랫입술이 가로로 밀어야 한다. 그래서 아래 띠에
      R(가로) 을 넣는다.

   ── 세기 대신 길이 ───────────────────────────────────────
   같은 4px 을 밀어도, 10px 안에서 다 밀면 1px 갈 때마다 0.4px 씩 꺾인다.
   20px 에 나눠 걸면 0.2px 이다. 눈에 걸리는 건 밀린 양이 아니라 이 기울기라,
   띠를 두 배로 늘리고 세기는 70% 로 내렸다.
   전: 10px 띠에 6.2px (0.62 px/px) → 후: 20px 띠에 4.4px (0.26 px/px).

   재 본 값 — 헤더 75px 에서 y=55 까지 0, y=72 부터 아래로 -4.4px 유지. */

/* 지도는 필터 영역 전체를 덮으므로 띠 자리를 영역 기준으로 계산해 둔다.
   가로 영역 -2.5%~102.5% → 요소는 23.8~976.2, 20px 은 13.2 칸.
   세로 영역 -30%~130%  → 요소는 187.5~812.5, 20px 은 167 칸.
   아랫입술은 언제나 812.5(판의 아랫변)에서 끝난다 — 거기가 유리 모서리다. */
const XL = 23.8, XR = 963.0, XW = 13.2;
const YB = 645.5, YH = 167;

/* 가로 지도 — R 이 좌우로 민다.
   좌우 띠는 가로로 흐르는 것을 휘게 하고, 아래 띠가 세로선을 꺾는다.
   아래 띠를 마지막에 그려 모서리에서 이기게 한다. */
const MAP_X = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" preserveAspectRatio="none"><defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".55" stop-color="rgb(0,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient><linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".45" stop-color="rgb(255,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".3" stop-color="rgb(165,128,128)"/><stop offset=".65" stop-color="rgb(212,128,128)"/><stop offset=".88" stop-color="rgb(240,128,128)"/><stop offset="1" stop-color="rgb(240,128,128)"/></linearGradient></defs><rect width="1000" height="1000" fill="rgb(128,128,128)"/><rect x="${XL}" width="${XW}" height="1000" fill="url(#l)"/><rect x="${XR}" width="${XW}" height="1000" fill="url(#r)"/><rect y="${YB}" width="1000" height="${YH}" fill="url(#b)"/></svg>`;

/* 세로 지도 — G 가 위아래로 민다. 아래 입술만. 윗변은 화면 밖이라 뺀다.
   가로로 지나는 것도 같이 살짝 꺾이라고 넣는다. */
const MAP_Y = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" preserveAspectRatio="none"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".5" stop-color="rgb(128,170,128)"/><stop offset=".85" stop-color="rgb(128,205,128)"/><stop offset="1" stop-color="rgb(128,205,128)"/></linearGradient></defs><rect width="1000" height="1000" fill="rgb(128,128,128)"/><rect y="${YB}" width="1000" height="${YH}" fill="url(#b)"/></svg>`;

const uri = (s: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

/* 같은 지도로 세기만 다르게. scale 이 곧 밀리는 픽셀 수다. */
function Refract({ id, scale }: { id: string; scale: number }) {
  return (
    /* 가로는 조금만 넓힌다. 넓힐수록 띠가 지도에서 얇아져 뭉개진다.
       세로는 아래에서 끌어올 그림이 있어야 하므로 넉넉히 둔다. */
    <filter id={id} x="-2.5%" y="-30%" width="105%" height="160%"
            colorInterpolationFilters="sRGB">
      <feImage result="gx" preserveAspectRatio="none" href={uri(MAP_X)} />
      <feImage result="gy" preserveAspectRatio="none" href={uri(MAP_Y)} />
      <feColorMatrix in="gx" result="gxr" type="matrix"
        values="1 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0 1" />
      <feColorMatrix in="gy" result="gyg" type="matrix"
        values="0 0 0 0 0   0 1 0 0 0   0 0 0 0 0   0 0 0 0 1" />
      <feComposite in="gxr" in2="gyg" operator="arithmetic"
        k1="0" k2="1" k3="1" k4="0" result="gmap" />
      {/* 띠가 20px 이다. 크게 흐리면 띠가 뭉개져 사라진다. */}
      <feGaussianBlur in="gmap" stdDeviation="0.9" result="gsoft" />
      <feDisplacementMap in="SourceGraphic" in2="gsoft" scale={scale}
        xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

export default function GlassFilterDefs() {
  return (
    <svg className="glass-filters" width="0" height="0" aria-hidden="true"
         focusable="false" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        {/* 밀리는 양 = scale × (지도값/255 − 0.5). 지도 꼭대기가 240 이라
            scale 10 이면 4.4px 이다. 14(6.2px)에서 70% 로 내렸다.
            띠도 10px → 20px 이라, 1px 갈 때마다 꺾이는 양은 0.62 → 0.26px 이다. */}
        <Refract id="glass-refract" scale={10} />
        {/* 휴대폰용. 화면이 좁아 헤더 바로 밑에 글이 붙어 지나간다.
            1.5px 만 민다 — 있는 줄은 알겠고 읽는 데는 걸리지 않는 정도. */}
        <Refract id="glass-refract-soft" scale={3.5} />
      </defs>
    </svg>
  );
}
