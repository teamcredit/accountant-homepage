/* 서비스 아이콘 여섯 개.
 *
 * 이름은 data.ts 의 icon 값이 그대로 쓴다(ledger · calculator · shield ·
 * scale · handshake · clipboard). 값은 원래 있었는데 그릴 게 없어서
 * 화면에 한 번도 안 나왔다.
 *
 * 선 하나 굵기로만 그린다. 채우면 아이콘이 글보다 무거워져서, 여섯 개가
 * 나란히 설 때 목록이 아니라 버튼 판으로 읽힌다.
 */

const PATHS: Record<string, React.ReactNode> = {
  /* 장부 — 펼친 책과 그 위의 줄 */
  ledger: (
    <>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 15.5Z" />
      <path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />
      <path d="M5.5 8h3M15.5 8h3M5.5 11h3M15.5 11h3" />
    </>
  ),
  /* 조정 — 계산기 자판 */
  calculator: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M7.5 7h9" />
      <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
    </>
  ),
  /* 자문 — 먼저 막아 두는 방패 */
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6Z" />
      <path d="M9.3 12.2 11.2 14l3.5-3.6" />
    </>
  ),
  /* 가치평가 — 양팔 저울 */
  scale: (
    <>
      <path d="M12 4v16M7 20h10" />
      <path d="M4 8h16M8 8 5 14h6ZM16 8l-3 6h6Z" />
    </>
  ),
  /* 거래 자문 — 마주 오는 두 방향 */
  handshake: (
    <>
      <path d="M3 12h5l2-2 2 2 2-2 2 2h5" />
      <path d="M6 9 3 12l3 3M18 9l3 3-3 3" />
    </>
  ),
  /* 경리 아웃소싱 — 증빙을 모아 둔 묶음 */
  folder: (
    <>
      <path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.4h7.8a1.5 1.5 0 0 1 1.5 1.5v8.6a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3 17.5z" />
      <path d="M7.5 12h9M7.5 15h6" />
    </>
  ),
  /* 감사 대응 — 확인한 서류 */
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 12.5 11 14.5l4-4" />
    </>
  ),
};

export default function ServiceIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const d = PATHS[name] ?? PATHS.ledger;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d}
    </svg>
  );
}
