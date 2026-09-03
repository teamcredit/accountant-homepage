/* 본초자오선 섹션 뒤에 까는 지구본.
   로고와 같은 문법이다 — 위도 격자는 없고 경도선(자오선)만 두른다.

   경도 0°선은 따로 그린 선이 아니라 돌아가는 경도선 18줄 중 한 줄이다.
   같이 돌기 때문에 정면일 때는 원, 옆을 볼 때는 곧은 세로선이 된다.
   세로선이 되는 그 순간이 로고와 같은 모양이다.

   three.js 를 안 쓴다. 경도선 하나가 눕힌 원 한 개고 회전은 브라우저가 한다. */

const RINGS = 18; // 10°마다 한 줄
const PRIME = 0; // 이 줄이 경도 0°선

export default function MeridianGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`mglobe ${className}`} aria-hidden>
      <div className="mglobe-tilt">
        {/* 구의 윤곽. 이건 같이 돌면 안 된다. */}
        <svg className="mglobe-limb" viewBox="0 0 220 220">
          <defs>
            {/* userSpaceOnUse 로 둔다. 옆에서 볼 때 원이 세로선으로 눌리는데,
                기본(objectBoundingBox) 좌표계면 폭 0 이 돼서 색이 무너진다. */}
            <linearGradient
              id="mglobe-grad"
              gradientUnits="userSpaceOnUse"
              x1="110"
              y1="11"
              x2="110"
              y2="209"
            >
              <stop offset="0%" stopColor="#B9C8FF" stopOpacity="0.2" />
              <stop offset="24%" stopColor="#4470FF" />
              <stop offset="50%" stopColor="#2B5BFF" />
              <stop offset="76%" stopColor="#4470FF" />
              <stop offset="100%" stopColor="#B9C8FF" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r="99" />
        </svg>

        <div className="mglobe-spin">
          {Array.from({ length: RINGS }, (_, i) => (
            <div
              key={i}
              className={i === PRIME ? "mglobe-ring is-prime" : "mglobe-ring"}
              style={{ transform: `rotateY(${(180 / RINGS) * i}deg)` }}
            >
              <svg viewBox="0 0 220 220">
                {i === PRIME && <circle className="mglobe-halo" cx="110" cy="110" r="99" />}
                <circle cx="110" cy="110" r="99" />
                {/* 빛 한 조각이 이 줄만 타고 돈다. */}
                {i === PRIME && <circle className="mglobe-glint" cx="110" cy="110" r="99" />}
              </svg>
            </div>
          ))}
        </div>

        {/* 0°선이 정확히 옆을 볼 때 켜지는 세로선.
            평면은 옆에서 보면 두께가 0 이라 화면에서 사라진다. 그 순간에만
            같은 자리에 이 선을 켜서 이어붙인다. 로고와 같은 모양이 되는
            순간이 여기다. */}
        <svg className="mglobe-edge" viewBox="0 0 220 220">
          <line x1="110" y1="11" x2="110" y2="209" />
        </svg>
      </div>
    </div>
  );
}
