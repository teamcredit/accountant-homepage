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

/* 남은 날은 볼 때마다 센다. 미리 적어두면 하루만 지나도 틀린다.
   자정 기준으로 자르므로 "오늘 마감"은 D-DAY 로 나온다. */
function daysLeft(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / 86400000);
}

function ddayLabel(ymd) {
  const n = daysLeft(ymd);
  if (n === 0) return "D-DAY";
  return n > 0 ? `D-${n}` : `D+${-n}`;
}

const dotted = (ymd) => ymd.replaceAll("-", ".");

/* 히어로에 남는 작은 버튼. 마감이 제일 가까운 한 건을 보여준다.
   서버에서 그리면 배포 시점 날짜로 굳으므로, 브라우저에서 한 번 더 센다. */
export function ScheduleButton({ items }) {
  const [label, setLabel] = useState(null);

  useEffect(() => {
    const next = [...items].sort((a, b) => daysLeft(a.when) - daysLeft(b.when))
      .find((it) => daysLeft(it.when) >= 0) ?? items[0];
    if (next) setLabel(`${next.what.replace(/ .*$/, "")} ${ddayLabel(next.when)}`);
  }, [items]);

  return (
    <button type="button" id="schedOpen" className="sched-open">
      <span className="lb">이번 분기 주요 일정</span>
      {/* 계산 전에는 비워 둔다. 잘못된 숫자가 한 프레임이라도 보이면 안 된다. */}
      <span className="dd"><span>{label ?? "\u00a0"}</span></span>
    </button>
  );
}

export default function SchedulePopup({ items, trigger }) {
  const [open, setOpen] = useState(false);
  /* 기준일도 고정하지 않는다. 붙박아 두면 "as of" 가 D-day 와 어긋난다. */
  const [today, setToday] = useState("");
  useEffect(() => {
    const n = new Date();
    const p2 = (v) => String(v).padStart(2, "0");
    setToday(`${n.getFullYear()}-${p2(n.getMonth() + 1)}-${p2(n.getDate())}`);
  }, []);
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
            <time dateTime={today}>as of {dotted(today)}</time>
          </div>
          <button type="button" className="schp-x" onClick={close} aria-label="닫기">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <ol className="schp-list">
          {items.map((it, i) => (
            <li key={i} className={i === 0 ? "near" : undefined}>
              <span className="what">{it.what}</span>
              <span className="dday">{ddayLabel(it.when)}</span>
              <span className="when">{dotted(it.when)}</span>
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
