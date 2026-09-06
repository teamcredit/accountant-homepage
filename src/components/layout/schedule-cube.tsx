"use client";

/* 헤더의 일정 티커.
 *
 * 세무를 맡기려는 사장님이 제일 먼저 궁금해하는 게 다음 마감일이다. 홈에서는
 * 팝업이 한 번 알려 주지만, 팝업은 닫으면 끝이다. 넓은 화면에서는 「기장
 * 문의하기」 옆에 한 건씩 계속 돌려 둔다.
 *
 * 위로 스르륵 올리지 않고 큐브를 굴린다 — 옆으로 밀리거나 위로 흐르는 건
 * 광고 띠처럼 읽히는데, 한 면씩 넘어가면 달력을 넘기는 몸짓이 된다.
 *
 * 남은 날은 브라우저에서 센다. 빌드할 때 계산하면 배포한 날짜로 굳어서
 * 하루만 지나도 틀린 숫자가 화면에 남는다.
 *
 * 누르면 분기 전체가 화면 한가운데에 뜬다. 큐브는 한 번에 한 건만
 * 보여 주니, 다음 것을 보려고 3.8초를 기다리게 둘 수는 없다.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { scheduleDates } from "@/lib/constants";

function daysLeft(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function dday(ymd: string) {
  const n = daysLeft(ymd);
  if (n === 0) return "D-DAY";
  return n > 0 ? `D-${n}` : `D+${-n}`;
}

const dotted = (ymd: string) => ymd.replaceAll("-", ".");

/* 남은 날은 브라우저에서만 셀 수 있다. 서버에서 그리면 배포한 날짜로 굳는다.
   한 번 센 결과를 모듈에 담아 둔다 — 렌더마다 새 배열을 만들면 React 가
   바뀐 줄 알고 계속 다시 그린다. */
let cached: typeof scheduleDates | null = null;
function liveItems() {
  if (!cached) {
    const live = scheduleDates.filter((it) => daysLeft(it.when) >= 0);
    cached = live.length ? live : scheduleDates;
  }
  return cached;
}
/* 오늘 날짜도 같은 이유로 브라우저에서만 잡는다. 「기준일」이 배포한
   날짜로 굳으면 옆의 D-day 와 어긋나, 둘 중 뭐가 맞는지 알 수 없다. */
let todayCache: string | null = null;
function todayYmd() {
  if (!todayCache) {
    const n = new Date();
    const p2 = (v: number) => String(v).padStart(2, "0");
    todayCache = `${n.getFullYear()}-${p2(n.getMonth() + 1)}-${p2(n.getDate())}`;
  }
  return todayCache;
}
const noSubscribe = () => () => {};

export default function ScheduleCube() {
  /* 지난 일정은 뺀다. 다 지났으면 원래 목록을 그대로 쓴다.
     서버에서는 빈 값을 주고, 브라우저가 붙은 뒤에 채운다. */
  const items = useSyncExternalStore(noSubscribe, liveItems, () => null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLElement | null>(null);

  const today = useSyncExternalStore(noSubscribe, todayYmd, () => null);

  /* 열려 있는 동안: 뒤가 안 밀리고, esc 로 닫히고, 탭이 안에 갇힌다. */
  useEffect(() => {
    if (!open) return;
    backRef.current = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
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
      backRef.current?.focus?.();
    };
  }, [open]);


  if (!items || !items.length) return null;

  /* 면은 넷. 목록이 그보다 짧으면 앞에서부터 다시 채운다.
     회전값은 되돌리지 않고 계속 키운다 — 0 으로 되감으면 그 순간 튄다. */
  const faces = [0, 1, 2, 3].map((i) => items[i % items.length]);

  return (
    <div className="sched-cube">
      {/* 화면낭독기에는 굴리지 않고 목록으로 읽힌다. */}
      <ul className="sr-only">
        {items.map((it) => (
          <li key={it.what + it.when}>
            {it.what} {it.when} {dday(it.when)}
          </li>
        ))}
      </ul>

      {/* 자르는 칸과 원근을 나눈다. 한 요소에 overflow 와 perspective 를
          같이 걸면 3D 로 돌아간 면이 안 잘려서, 다음 면이 같이 보였다. */}
      <button
        type="button"
        className="sc-clip"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="이번 분기 주요 일정 전체 보기"
      >
        <span className="sc-stage" aria-hidden>
          {/* 굴리는 건 CSS 키프레임(sc-roll)이 한다. 여기서 transform 을
              넣고 transition 에 맡기니, 값이 바뀌는 순간과 다시 그리는
              순간이 어긋나 글자만 갈리는 것처럼 보였다. */}
          <span className="sc-box">
            {faces.map((it, i) => (
              <span key={i} className="sc-face" style={{ ["--i" as string]: i }}>
                {/* 남은 날이 먼저다. 이름은 그다음이라 오른쪽 끝에 붙인다. */}
                <span className="sc-dd">{dday(it.when)}</span>
                <span className="sc-what">{it.what}</span>
              </span>
            ))}
          </span>
        </span>
      </button>

      {/* 모달은 body 에 붙인다. 헤더 안에 두면 유리 막대가 만든 쌓임 맥락에
          갇혀서, 가림막이 헤더를 못 덮고 그 아래만 어두워진다. */}
      {open && createPortal(
        <div
          className="schm"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="schm-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schm-title"
            ref={panelRef}
          >
            <div className="schm-hd">
              <div>
                <h2 id="schm-title">이번 분기 주요 일정</h2>
                {today && <time dateTime={today}>{dotted(today)} 기준</time>}
              </div>
              <button
                type="button"
                className="schm-x"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor"
                     strokeWidth="1.5" strokeLinecap="round">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            {/* 마감이 가까운 순서다. 제일 위 한 건만 채운 배지로 세운다 —
                여섯 줄이 다 같은 무게면 어디부터 봐야 하는지 안 보인다. */}
            <ol className="schm-list">
              {items.map((it, i) => (
                <li key={it.what + it.when} className={i === 0 ? "is-near" : undefined}>
                  <span className="schm-what">{it.what}</span>
                  <span className="schm-when">{dotted(it.when)}</span>
                  <span className="schm-dd">{dday(it.when)}</span>
                </li>
              ))}
            </ol>

            <p className="schm-note">
              국세청 기준 주요 신고 · 납부 기한입니다. 담당 법인의 신고 의무와
              마감일은 실제와 다를 수 있습니다.
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
