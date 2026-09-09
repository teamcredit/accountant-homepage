/* 비교표 왼쪽 항목의 표식 다섯.
 *
 * 다섯 줄이 글자만 있으면 표가 아니라 문단으로 읽힌다. 각 줄이 무엇을
 * 비교하는지 표식 하나로 먼저 잡아 준다.
 *
 * 선 하나 굵기로만 그린다 — 채우면 왼쪽 열이 오른쪽 답보다 무거워진다.
 */

const PATHS: Record<string, React.ReactNode> = {
  /* 관점 — 어디를 보고 있는가 */
  view: (
    <>
      <path d="M1.6 8s2.4-4.4 6.4-4.4S14.4 8 14.4 8s-2.4 4.4-6.4 4.4S1.6 8 1.6 8Z" />
      <circle cx="8" cy="8" r="1.9" />
    </>
  ),
  /* 누가 답하나 — 사람 */
  who: (
    <>
      <circle cx="8" cy="5.6" r="2.4" />
      <path d="M3.4 13.2a4.6 4.6 0 0 1 9.2 0" />
    </>
  ),
  /* 자료 처리 도구 — 칩 */
  tech: (
    <>
      <rect x="4.6" y="4.6" width="6.8" height="6.8" rx="1.2" />
      <path d="M6.8 2.4v2.2M9.2 2.4v2.2M6.8 11.4v2.2M9.2 11.4v2.2M2.4 6.8h2.2M2.4 9.2h2.2M11.4 6.8h2.2M11.4 9.2h2.2" />
    </>
  ),
  /* 회사 자료 확인 — 화면 안의 표 */
  board: (
    <>
      <rect x="2.2" y="3" width="11.6" height="9" rx="1.2" />
      <path d="M2.2 5.8h11.6M6.4 5.8V12" />
      <path d="M8.4 9.6h3.4M8.4 7.8h3.4" />
    </>
  ),
  /* 소통 방식 — 오가는 말 */
  talk: (
    <>
      <path d="M2.2 4.4a1.2 1.2 0 0 1 1.2-1.2h6.2a1.2 1.2 0 0 1 1.2 1.2v3.2a1.2 1.2 0 0 1-1.2 1.2H5.4L3 10.6V8.8a1.2 1.2 0 0 1-.8-1.2Z" />
      <path d="M12.4 6.2h.2a1.2 1.2 0 0 1 1.2 1.2v3.2a1.2 1.2 0 0 1-.8 1.2v1.8l-2-1.6" />
    </>
  ),
};

export default function VsIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="vs-i"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
