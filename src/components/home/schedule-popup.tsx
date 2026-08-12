// @ts-nocheck
/* eslint-disable */
"use client";

/**
 * 이번 분기 주요 일정. 페이지에 들어오면 팝업으로 뜬다.
 *
 * 세무를 맡기려는 사장님이 제일 먼저 궁금해하는 게 다음 마감일이다.
 * 그래서 먼저 보여주되, "24시간 다시 보지 않기"로 매번 막지 않는다.
 *
 * 닫아도 히어로에 남는 작은 버튼으로 언제든 다시 열 수 있다.
 */

import { useEffect, useRef, useState } from "react";

const KEY = "meridian.sched.hideUntil";

export default function SchedulePopup({ items, asOf, trigger }) {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const panelRef = useRef(null);
  const lastFocus = useRef(null);

  // 처음 들어오면 뜬다. 24시간 안 보기를 눌렀으면 안 뜬다.
  useEffect(() => {
    let hidden = false;
    try {
      const until = Number(localStorage.getItem(KEY) || 0);
      hidden = until > Date.now();
    } catch {
      // 로컬 저장이 막힌 브라우저(시크릿 모드 등). 그냥 띄운다.
    }
    if (hidden) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  // 히어로의 "일정 보기" 버튼으로도 열린다
  useEffect(() => {
    if (!trigger) return;
    const btn = document.getElementById(trigger);
    if (!btn) return;
    const onClick = () => setOpen(true);
    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
  }, [trigger]);

  // 열려 있는 동안: 뒤 스크롤을 막고, esc 로 닫고, 초점을 안에 가둔다.
  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (!f?.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.querySelector("button")?.focus());

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    if (dontShow) {
      try {
        localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
      } catch {}
    }
    setOpen(false);
    lastFocus.current?.focus?.();
  }

  if (!open) return null;

  return (
    <div className="schp" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        className="schp-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schp-title"
        ref={panelRef}
      >
        <div className="schp-hd">
          <div>
            <h2 id="schp-title">이번 분기 주요 일정</h2>
            <time dateTime="2026-08-10">as of {asOf}</time>
          </div>
          <button type="button" className="schp-x" onClick={close} aria-label="닫기">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <ol className="schp-list">
          {items.map((it, i) => (
            <li key={i} className={i === 0 ? "near" : undefined}>
              <span className="what">{it.what}</span>
              <span className="dday">{it.dday}</span>
              <span className="when">{it.when}</span>
            </li>
          ))}
        </ol>

        <p className="schp-note">
          <span className="s">국세청 기준 주요 신고·납부 기한.</span>
          <span className="s">담당 법인의 신고 의무 및 마감일은</span>
          <span className="s">실제와 상이할 수 있습니다.</span>
        </p>

        <div className="schp-ft">
          <label className="schp-chk">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            <span>24시간 동안 보지 않기</span>
          </label>
          <button type="button" className="btn btn-fill schp-close" onClick={close}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
