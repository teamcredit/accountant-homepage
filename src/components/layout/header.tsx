"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { DesktopNav, MobileNav, MegaPanel, useMenuOpen } from "./site-nav";
import SiteSearch from "./site-search";
import ScheduleCube from "./schedule-cube";
import Wordmark from "@/components/brand/wordmark";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  /* 펼침판은 헤더 안에서 열린다. 어느 칸이 열렸는지 헤더가 들고 있어야
     판 위에 마우스가 있는 동안 닫히지 않는다. */
  const menu = useMenuOpen();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });

  /* 헤더 뒤가 흰 본문일 때와 검은 히어로일 때가 다르다.
     흰 유리를 검정 위에 얹으면 회색 판이 되고 글자가 사라진다.
     그래서 헤더 바로 밑에 뭐가 깔려 있는지 매 스크롤마다 집어서
     검정이면 어두운 유리로 통째로 뒤집는다. */
  const headerRef = useRef<HTMLElement>(null);
  /* 첫 값은 「어두움」이다. 모든 페이지의 맨 위는 검은 히어로라
     밝은 유리로 시작하면 새로고침할 때마다 흰 띠가 한 프레임 번쩍인다. */
  const [tone, setTone] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const read = () => {
      const el = headerRef.current;
      if (!el) return;
      const h = el.getBoundingClientRect().height || 80;
      /* 헤더를 잠깐 통과시켜 그 아래 진짜 바닥을 집는다. */
      el.style.pointerEvents = "none";
      const hit = document.elementFromPoint(window.innerWidth / 2, h + 4);
      el.style.pointerEvents = "";
      if (!hit) return;

      /* 위로 올라가며 배경색이 칠해진 첫 조상을 찾는다.
         투명한 요소는 색을 안 가지므로 건너뛴다. */
      let node: Element | null = hit;
      let bg = "";
      while (node && node !== document.documentElement) {
        const c = getComputedStyle(node).backgroundColor;
        const m = c.match(/[\d.]+/g);
        if (m && (m.length < 4 || Number(m[3]) > 0.5)) {
          bg = c;
          break;
        }
        node = node.parentElement;
      }
      const m = bg.match(/[\d.]+/g);
      if (!m) return setTone("light");
      /* 밝기(luma). 절반보다 어두우면 어두운 유리로 간다. */
      const luma =
        (0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2])) / 255;
      setTone(luma < 0.5 ? "dark" : "light");
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [pathname]);

  useEffect(() => {
    const main = document.querySelector("main");

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      main?.setAttribute("inert", "");
      main?.setAttribute("aria-hidden", "true");
    } else {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      main?.removeAttribute("aria-hidden");
    }

    return () => {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      main?.removeAttribute("aria-hidden");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={headerRef}
        /* 모바일 메뉴가 열리면 그 밑은 무조건 흰 판이다. 자동 판정은
           스크롤할 때만 다시 재기 때문에, 검은 히어로에서 메뉴를 열면
           흰 글자가 흰 판 위에 남아 로고와 닫기 단추가 사라졌다. */
        data-tone={mobileOpen ? "light" : tone}
        data-mega={menu.open ? "true" : "false"}
        className="site-header glass-bar z-50"
        onPointerLeave={menu.scheduleClose}
      >
        {/* 본문(1600px)과 같은 폭을 쓴다. 1280 으로 가두면 넓은 화면에서
            헤더만 좁아 보인다. 높이도 한 단계 키워 답답함을 던다. */}
        <div
          className="max-w-[1600px] mx-auto h-20 flex items-center justify-between"
          /* 본문과 같은 여백을 쓴다. clamp 로 따로 잡아 뒀더니 헤더는 40px,
             본문은 29px 이 되어 로고와 글 왼쪽 끝이 11px 어긋나 있었다. */
          style={{ paddingInline: "var(--site-gutter-6)" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="transition-opacity duration-300 hover:opacity-60 flex-shrink-0 flex items-center"
          >
            <Wordmark className="text-[1.35rem] md:text-[1.6rem] text-foreground" />
          </Link>

          {/* Desktop Nav + Pricing + Client Login */}
          <div className="hidden md:flex items-center gap-8">
            <DesktopNav ctl={menu} />
            <div className="flex items-center gap-6">
              {/* 다음 마감일. 넓은 화면에서만 선다.
                  문의 단추보다 앞이다 — 단추가 오른쪽 끝을 지켜야 본문
                  오른쪽 끝과 한 줄로 맞는다. */}
              <ScheduleCube />
              {/* CONTACT 옆 물음표. 누르면 알약 검색창으로 늘어난다. */}
              <SiteSearch />
              {/* 홈(promo)의 .btn .btn-fill 과 같은 생김새.
                  모서리 10px, 코발트, 색만 바뀐다. */}
              <a href="/contact" className="hdr-cta">
                기장 문의하기
              </a>
            </div>
          </div>

          {/* 손가락 화면. 문의 단추가 메뉴 왼쪽에 같이 선다 —
              메뉴를 열지 않고도 바로 갈 수 있어야 한다. */}
          <div className="md:hidden flex items-center gap-2">
            <a href="/contact" className="hdr-cta hdr-cta--sm">
              기장 문의하기
            </a>
          <button
            className="relative w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <div className="relative w-5 h-3.5">
              <span
                className={`absolute left-0 top-0 block w-5 h-[1.5px] bg-foreground transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mobileOpen ? "rotate-45 top-1/2 -translate-y-1/2" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 block w-5 h-[1.5px] bg-foreground transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 block w-5 h-[1.5px] bg-foreground transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mobileOpen ? "-rotate-45 top-1/2 -translate-y-1/2" : ""
                }`}
              />
            </div>
          </button>
          </div>
        </div>
        {/* 펼침판. 헤더가 키를 키워 이 자리를 만든다. */}
        <MegaPanel ctl={menu} />

        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
          style={{ scaleX }}
        />
      </header>

      {/* Mobile Nav - Full Screen Overlay */}
      <div
        id="mobile-navigation"
        aria-hidden={!mobileOpen}
        aria-label="모바일 메뉴"
        aria-modal={mobileOpen ? true : undefined}
        role={mobileOpen ? "dialog" : undefined}
        className={`fixed inset-0 z-40 bg-background transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen
            ? "visible opacity-100 pointer-events-auto"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* 가운데 정렬을 버리고 왼쪽으로 세운다. 하위가 한 칸 들여쓰기로
            붙는데, 가운데 정렬에서는 그 계층이 안 읽힌다. */}
        <div className="mnav-shell">
          {/* 검색은 데스크톱에만 있었다. 손으로 쓰는 사람이 더 많다. */}
          <div className="mnav-search">
            <SiteSearch />
          </div>

          <MobileNav onNavigate={() => setMobileOpen(false)} />

          <a
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="hdr-cta mnav-cta"
          >
            기장 문의하기
          </a>
        </div>
      </div>
    </>
  );
}
