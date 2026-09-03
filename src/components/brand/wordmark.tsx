/* 사이트에 하나뿐인 로고. 헤더도 어바웃 히어로도 이걸 쓴다.
   따로 그려 두면 한쪽만 고쳐져서 어긋난다.

   표식은 png 대신 SVG 로 그린다. png 는 128px 라 어바웃 히어로처럼 크게
   쓰면 뭉갠다. 경도선은 폭이 다른 타원 여러 개고, 가운데 한 줄만 파랗다 —
   지구본 섹션과 같은 문법이다. */

const LONGITUDES = [7, 20, 33, 44]; // 가운데에서 바깥으로, 타원의 반지름

export function MeridianMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {LONGITUDES.map((rx) => (
        <ellipse
          key={rx}
          cx="50"
          cy="50"
          rx={rx}
          ry="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.55"
        />
      ))}
      {/* 경도 0°선. 이 한 줄만 포인트 컬러다. */}
      <line x1="50" y1="4" x2="50" y2="96" stroke="var(--color-accent)" strokeWidth="3" />
    </svg>
  );
}

/* size 는 글자 크기다. 표식은 거기에 맞춰 따라 커진다.

   mark={false} 는 표식을 빼고 글자만 쓴다. 뒤에 지구본이 이미 돌고 있는
   자리에서는 표식이 같은 그림을 두 번 그리는 셈이라 뺀다. */
export default function Wordmark({
  className = "",
  markClassName = "",
  textClassName = "",
  mark = true,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  mark?: boolean;
}) {
  return (
    <span className={`brand-lockup ${className}`}>
      {mark && <MeridianMark className={`brand-mark ${markClassName}`} />}
      <span className={`brand-word ${textClassName}`}>
        Meridian<span className="green-dot">.</span>
      </span>
    </span>
  );
}
