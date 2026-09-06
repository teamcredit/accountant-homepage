/* 「드리는 것」 한 장마다 붙는 표식.
 *
 * 받는 물건이 무엇인지는 이름에 다 적혀 있다 — 신고서 · 검토표 · 메모 ·
 * 리포트 · 일정표 · 자료. 이름에서 골라 그린다. 목록을 따로 두지 않는
 * 이유는, 서비스가 늘 때마다 그 목록을 같이 고쳐야 해서다.
 *
 * 선 하나 굵기로만 그린다. 채우면 여섯 장이 나란히 설 때 아이콘이
 * 글보다 무거워져서 판이 아이콘 모음으로 읽힌다.
 */

type Kind = "file" | "check" | "memo" | "chart" | "calendar" | "folder";

function pick(label: string): Kind {
  if (/일정|기한|마감/.test(label)) return "calendar";
  if (/리포트|분석|추이|비교표/.test(label)) return "chart";
  if (/메모|의견서|기준/.test(label)) return "memo";
  if (/검토표|체크|점검|확인/.test(label)) return "check";
  if (/자료|명세|목록|리스트/.test(label)) return "folder";
  return "file";
}

const PATHS: Record<Kind, React.ReactNode> = {
  /* 신고서 · 서류 */
  file: (
    <>
      <path d="M6 2.5h6l4 4v11H6z" />
      <path d="M12 2.5v4h4M8.6 10.5h6M8.6 13.5h4" />
    </>
  ),
  /* 검토표 — 확인한 서류 */
  check: (
    <>
      <path d="M6 2.5h6l4 4v11H6z" />
      <path d="M12 2.5v4h4" />
      <path d="M8.8 12.4 10.4 14l3.2-3.4" />
    </>
  ),
  /* 메모 — 접힌 쪽지 */
  memo: (
    <>
      <path d="M5.5 3h11v9.5L12 17H5.5z" />
      <path d="M16.5 12.5H12V17M8.5 7h6M8.5 10h4" />
    </>
  ),
  /* 리포트 — 막대 */
  chart: (
    <>
      <rect x="4.5" y="3.5" width="15" height="14" rx="1.6" />
      <path d="M8.5 13.5v-3M12 13.5v-6M15.5 13.5v-4" />
    </>
  ),
  /* 일정표 */
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="13" rx="1.6" />
      <path d="M4 9.2h16M8.5 3.2v3.4M15.5 3.2v3.4" />
      <path d="M8.4 13h1.4M13.8 13h1.4" />
    </>
  ),
  /* 자료 묶음 */
  folder: (
    <>
      <path d="M3.5 6.4a1.4 1.4 0 0 1 1.4-1.4h3.4l1.7 2h8.1a1.4 1.4 0 0 1 1.4 1.4v8.8a1.4 1.4 0 0 1-1.4 1.4H4.9a1.4 1.4 0 0 1-1.4-1.4Z" />
    </>
  ),
};

export default function DeliverableIcon({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="svc-give-i"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[pick(label)]}
    </svg>
  );
}
