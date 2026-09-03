/* 유리를 휘게 하는 변위 지도. 페이지에 한 번만 있으면 된다.

   backdrop-filter: blur() 는 뒤를 뭉갠다 — 뒤가 사라지니 불투명한 판이 된다.
   유리는 뒤가 보이면서 휘어야 한다. 흐리기를 조금만 걸고 이 필터로 민다.

   ── 두 번 틀렸던 것. 다시 하지 말 것 ─────────────────────────

   ① feImage 에 x/y/width/height 를 주면 안 된다.
      서브영역 밖은 투명(R=0,G=0)이고 displacement 가 그걸 지도로 읽어
      화면 전체를 한 방향으로 민다. 재보니 좌·중앙·우 전부 +7px 로 똑같았다.
      가운데가 통째로 밀리면 휜 게 아니라 헤더 안에만 다른 판이 하나 더
      있는 것처럼 보인다.

   ② 값이 가장자리에서 128 로 안 돌아오면 안 된다.
      한쪽 끝만 128 인 그라디언트를 쓰면 띠 전체가 한 방향으로 밀려
      경계에서 뚝 끊긴다. 128 → 최고 → 128 로 갔다 와야 띠 안에서만
      불룩해진다. 그래야 선이 꺾인다.

   ③ 좌우만 밀면 세로선은 안 휜다.
      화면 가운데를 지나는 자오선은 좌우 띠에 닿지 않는다. 세로선이
      꺾이려면 헤더의 아랫입술이 가로로 밀어야 한다. 그래서 아래 띠에
      R(가로) 을 넣는다.

   재 본 값 — 헤더 75px 에서 y=64 까지 0, y=70 에서 -7px, y=75 에서 0. */

/* 지도는 필터 영역 전체를 덮으므로 띠 자리를 영역 기준으로 계산해 둔다.
   가로 영역 -2.5%~102.5% → 요소는 23.8~976.2, 10px 은 6.6 칸.
   세로 영역 -30%~130%  → 요소는 187.5~812.5, 10px 은 83 칸. */
const XL = 23.8, XR = 969.6, XW = 6.6;
const YB = 729, YH = 83.5;

/* 가로 지도 — R 이 좌우로 민다.
   좌우 띠는 가로로 흐르는 것을 휘게 하고, 아래 띠가 세로선을 꺾는다.
   아래 띠를 마지막에 그려 모서리에서 이기게 한다. */
const MAP_X = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" preserveAspectRatio="none"><defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".55" stop-color="rgb(0,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient><linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".45" stop-color="rgb(255,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".3" stop-color="rgb(196,128,128)"/><stop offset=".55" stop-color="rgb(240,128,128)"/><stop offset=".8" stop-color="rgb(190,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient></defs><rect width="1000" height="1000" fill="rgb(128,128,128)"/><rect x="${XL}" width="${XW}" height="1000" fill="url(#l)"/><rect x="${XR}" width="${XW}" height="1000" fill="url(#r)"/><rect y="${YB}" width="1000" height="${YH}" fill="url(#b)"/></svg>`;

/* 세로 지도 — G 가 위아래로 민다. 아래 입술만. 윗변은 화면 밖이라 뺀다.
   가로로 지나는 것도 같이 살짝 꺾이라고 넣는다. */
const MAP_Y = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" preserveAspectRatio="none"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(128,128,128)"/><stop offset=".55" stop-color="rgb(128,205,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient></defs><rect width="1000" height="1000" fill="rgb(128,128,128)"/><rect y="${YB}" width="1000" height="${YH}" fill="url(#b)"/></svg>`;

const uri = (s: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

export default function GlassFilterDefs() {
  return (
    <svg className="glass-filters" width="0" height="0" aria-hidden="true"
         focusable="false" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        {/* 가로는 조금만 넓힌다. 넓힐수록 10px 띠가 지도에서 얇아져 뭉개진다.
            세로는 아래에서 끌어올 그림이 있어야 하므로 넉넉히 둔다. */}
        <filter id="glass-refract" x="-2.5%" y="-30%" width="105%" height="160%"
                colorInterpolationFilters="sRGB">
          <feImage result="gx" preserveAspectRatio="none" href={uri(MAP_X)} />
          <feImage result="gy" preserveAspectRatio="none" href={uri(MAP_Y)} />
          <feColorMatrix in="gx" result="gxr" type="matrix"
            values="1 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0 1" />
          <feColorMatrix in="gy" result="gyg" type="matrix"
            values="0 0 0 0 0   0 1 0 0 0   0 0 0 0 0   0 0 0 0 1" />
          <feComposite in="gxr" in2="gyg" operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0" result="gmap" />
          {/* 띠가 10px 밖에 안 된다. 크게 흐리면 띠가 뭉개져 사라진다. */}
          <feGaussianBlur in="gmap" stdDeviation="0.9" result="gsoft" />
          {/* 최고점이 255 이니 밀리는 양은 18×0.5 = 9px. 띠 안에 든다. */}
          <feDisplacementMap in="SourceGraphic" in2="gsoft" scale="24"
            xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
