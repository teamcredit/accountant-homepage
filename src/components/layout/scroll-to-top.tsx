"use client";

/* 새로고침하면 맨 위에서 시작한다.
 *
 * 브라우저는 기본으로 새로고침 전 자리를 되살린다(scrollRestoration = "auto").
 * 이 사이트는 첫 화면이 스크롤로 굴러가는 연출이라, 되살아난 자리가
 * 장면 한복판이면 지구본도 대화도 중간부터 시작한다 — 무엇을 보고 있는
 * 건지 알 수 없다.
 *
 * 되살리기를 끄고, 붙자마자 한 번 위로 올린다.
 */

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    /* 주소에 #앵커가 있으면 그리로 가야 한다. 그때는 건드리지 않는다. */
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, []);

  return null;
}
