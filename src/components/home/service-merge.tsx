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

import { useEffect, useRef, type ReactNode } from "react";
import { useMedia } from "@/lib/use-media";
import { setupServiceMerge } from "./service-merge-scene";

/* 카드마다 제목 앞에 붙는 표시.
   선 하나 굵기로만 그린 단색이다. 색도 채움도 없다 —
   여섯 장이 겹쳐서 한 장이 될 때 색이 있으면 얼룩으로 남는다.
   그림이 뜻을 대신하는 게 아니라, 제목을 찾기 쉽게 표를 다는 것뿐이다. */
const ICONS: Record<string, ReactNode> = {
  /* 장부: 줄 그은 종이 */
  "tax-bookkeeping": (
    <><rect x="3.5" y="2.5" width="17" height="19" rx="2.5" /><path d="M7.5 7.5h9M7.5 12h9M7.5 16.5h5" /></>
  ),
  /* 조정: 값을 맞추는 눈금 */
  "tax-adjustment": (
    <><path d="M4 7.5h16M4 16.5h16" /><circle cx="9" cy="7.5" r="2.5" /><circle cx="15" cy="16.5" r="2.5" /></>
  ),
  /* 자문: 미리 막아 두는 방패 */
  "tax-advisory": (
    <><path d="M12 2.5l7.5 3v6c0 4.5-3 8.4-7.5 10-4.5-1.6-7.5-5.5-7.5-10v-6z" /></>
  ),
  /* 평가: 무게를 다는 저울 */
  "valuation": (
    <><path d="M12 3v18M6 6.5h12M4 18h6l-3-8zM14 18h6l-3-8z" /></>
  ),
  /* 거래: 오가는 두 방향 */
  "transaction-advisory": (
    <><path d="M3.5 8.5h13m-3.5-3.5 3.5 3.5-3.5 3.5M20.5 15.5h-13m3.5 3.5-3.5-3.5 3.5-3.5" /></>
  ),
  /* 감사: 확인하고 표시한 서류 */
  "audit-advisory": (
    <><path d="M8 3.5H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-14a2 2 0 0 0-2-2h-2" /><rect x="8" y="2" width="8" height="3.5" rx="1.2" /><path d="M8.5 13.5l2.5 2.5 4.5-5" /></>
  ),
};

export default function ServiceMerge({ items }: { items: { slug: string; title: string }[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const staticScene = useMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)");

  useEffect(() => {
    const root = rootRef.current;
    if (root) return setupServiceMerge(root);
  }, [staticScene]);

  return (
    <div className="svm" ref={rootRef} aria-hidden="true">
      <div className="svm-stack">
        {/* 모이는 자리. 다 모이면 테두리가 드러난다. */}
        <div className="svm-target" aria-hidden="true" />
        {/* 한 바퀴 도는 동안 절반은 판의 뒤가 보인다. 그때 서는 면이다.
            카드 안에 넣으면 잘려서 납작해지므로 형제로 둔다. */}
        <div className="svm-back" aria-hidden="true"><i /></div>
        {items.map((s, i) => (
          <div className={`svm-card svm-p${i + 1}`} key={s.slug}>
            {/* 맨 위 한 장에만 대시보드 복제본이 들어간다.
                아래 대시보드(.db)를 그대로 베껴 넣는다 — 실행 중에 채운다. */}
            <div className="svm-peek" />
            <div className="svm-ink">
              <span className="svm-t">
                <svg className="svm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[s.slug]}
                </svg>
                <span>{s.title}</span>
              </span>
              <span className="svm-rows"><i /><i /><i /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
