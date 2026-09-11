"use client";

/**
 * 홈 스크롤 동작. 원본은 hometax-promo/index.html 의 인라인 <script> 였다.
 * 화면을 그리지 않는다 — DOM 에 붙어서 스크롤에 맞춰 클래스만 바꾼다.
 * 그래서 반환은 null 이다.
 *
 * 헤더 stuck 처리는 여기서 뺐다. 공통 Header 컴포넌트가 한다.
 */

import { useEffect } from "react";
import { useMedia } from "@/lib/use-media";
import { useLenis } from "lenis/react";
import { setupPromoScenes } from "./promo-scenes";

export default function PromoMotion() {
  const lenis = useLenis();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const wide = useMedia("(min-width: 701px)");
  useEffect(() => {
    // 원본 스크립트는 즉시실행 함수다. 그 안에서 이벤트를 붙이고 끝난다.
    const root = document.querySelector<HTMLElement>('main .promo');
    if (root) return setupPromoScenes(root, lenis);
  }, [lenis, reduced, wide]);

  return null;
}
