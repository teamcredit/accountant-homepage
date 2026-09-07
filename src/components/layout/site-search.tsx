"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * 헤더 검색.
 *
 * 평소엔 물음표 하나짜리 동그라미다. 누르면 그 동그라미가 그대로
 * 왼쪽으로 늘어나 알약(pill) 검색창이 된다. 새 창이 뜨는 게 아니라
 * 있던 단추가 자라는 것처럼 보여야 한다.
 * 돋보기 아이콘은 쓰지 않는다. 물음표가 곧 "뭘 찾으세요"다.
 *
 * 글자를 치면 밑에 자동완성처럼 목록이 깔린다.
 * 목록은 /api/search 에서 한 번만 받아 두고 화면에서 거른다.
 */

interface SearchItem {
  title: string;
  href: string;
  kind: string;
  hint: string;
  terms: string;
}

const PLACEHOLDERS = [
  "부가세 신고 언제까지인가요",
  "법인 전환이 유리한 시점",
  "가지급금 정리",
  "연말정산 환급",
];

export default function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [cursor, setCursor] = useState(0);
  /* 예시 문구는 열 때마다 하나씩 돌려 쓴다. 늘 같은 줄이면 장식처럼 보인다. */
  const [ph, setPh] = useState(PLACEHOLDERS[0]);

  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 목록은 처음 열 때 한 번만 받는다. */
  useEffect(() => {
    if (!open || items.length) return;
    let alive = true;
    fetch("/api/search")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: SearchItem[]) => alive && setItems(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open, items.length]);

  /* 바깥을 누르면 닫는다. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hits = q.trim()
    ? (() => {
        const needle = q.trim().toLowerCase();
        return items
          .map((it) => {
            const title = it.title.toLowerCase();
            /* 제목에 있으면 위로, 본문에만 있으면 아래로. */
            const rank = title.includes(needle)
              ? title.startsWith(needle)
                ? 0
                : 1
              : it.terms.toLowerCase().includes(needle)
                ? 2
                : -1;
            return { it, rank };
          })
          .filter((r) => r.rank >= 0)
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 7)
          .map((r) => r.it);
      })()
    : [];

  /* 찾는 말이 바뀌면 고른 줄을 첫 줄로 되돌린다.
     useEffect 로 하면 한 번 그린 뒤에 또 그린다 — 그 사이 한 프레임 동안
     지워진 목록의 세 번째 줄이 골라진 채로 보인다.
     그리는 중에 바로 되돌리면 그 한 번이 없다. React 가 권하는 방식이다. */
  const [lastQ, setLastQ] = useState(q);
  if (lastQ !== q) {
    setLastQ(q);
    setCursor(0);
  }

  function openBox() {
    setPh(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
    setOpen(true);
    /* 늘어나는 동안 글자가 튀지 않게 조금 기다렸다 커서를 준다. */
    window.setTimeout(() => inputRef.current?.focus(), 260);
  }

  function go(href: string) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!hits.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(hits[cursor].href);
    }
  }

  return (
    <div ref={boxRef} className="site-search relative flex-none" data-open={open || undefined}>
      {/* 동그라미가 알약으로 자란다. 폭 하나만 움직인다. */}
      <div className="site-search-shell">
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={ph}
          aria-label="사이트 검색"
          tabIndex={open ? 0 : -1}
          className="site-search-input"
        />
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openBox())}
          aria-label={open ? "검색 닫기" : "검색 열기"}
          aria-expanded={open}
          className="site-search-mark"
        >
          {open ? (
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="8.6" cy="8.6" r="5.6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12.8 12.8L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && q.trim().length > 0 && (
        <div className="site-search-drop" role="listbox">
          {hits.length === 0 ? (
            <p className="site-search-empty">찾는 글이 없습니다.</p>
          ) : (
            hits.map((it, i) => (
              <Link
                key={it.href}
                href={it.href}
                role="option"
                aria-selected={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                }}
                className={`site-search-row${i === cursor ? " is-on" : ""}`}
              >
                <span className="site-search-kind">{it.kind}</span>
                <span className="site-search-title">{it.title}</span>
                <span className="site-search-hint">{it.hint}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
