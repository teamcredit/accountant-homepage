"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";
import { DesktopNav, MobileNav, MegaPanel, useMenuOpen } from "./site-nav";
import SiteSearch from "./site-search";
import ScheduleCube from "./schedule-cube";
import Wordmark from "@/components/brand/wordmark";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  /* 펼침판은 헤더 안에서 열린다. 어느 칸이 열렸는지 헤더가 들고 있어야
     판 위에 마우스가 있는 동안 닫히지 않는다. */
  const menu = useMenuOpen();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });

  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  /* 헤더 모습은 두 가지뿐이다. 배경을 읽지 않는다.
       맨 위        — 막 없음, 흰 글씨. 히어로가 그대로 비친다.
       조금이라도 내리면 — 흰 막, 검은 글씨.

     예전에는 스크롤마다 elementFromPoint 로 헤더 밑을 찍어 밝기를 쟀다.
     재는 점 하나가 영상 판 위끝과 10px 밖에 안 떨어져 한 픽셀 차이로
     흑백이 뒤집혔고, 어긋난 판정이 어두운 막을 흰 구역까지 끌고 갔다.
     지금은 스크롤 값 하나만 본다 — 틀릴 수가 없다.

     맨 위가 흰 쪽(예: /portal)에서는 처음부터 흰 막으로 시작한다.
     그건 쪽이 열릴 때 한 번만 본다. 매 스크롤이 아니다. */
  /* 첫 값은 「어두움」이다. 모든 쪽의 맨 위가 검은 히어로라, 밝은 쪽으로
     시작하면 새로고침할 때마다 흰 띠가 한 프레임 번쩍인다. */
  const [tone, setTone] = useState<"light" | "dark">("dark");

  useEffect(() => {
    /* 이 쪽의 맨 위가 어두운가.
       쪽마다 맨 위 판이 다르다 — 홈은 붙임 무대, 나머지는 히어로.
       판을 미리 붙잡아 두지 않고 잴 때마다 다시 찾는다. 처음 그릴 때
       잡아 두면 그 뒤에 갈아 끼워진 판을 계속 놓치고, 떨어져 나간
       판은 높이가 늘 0 이라 검은 히어로 위에서도 검은 글씨가 됐다. */
    const measure = () => {
      const first = document.querySelector(
        "main .about-stage, main .about-flat, main .page-hero, main section",
      );
      if (!first) return "light" as const;
      const looksDark =
        first.classList.contains("bg-deep") ||
        first.classList.contains("about-stage") ||
        first.classList.contains("about-flat") ||
        !!first.querySelector("video");
      /* 판이 실제로 서 있을 때만 흰 글씨를 쓴다. 손 안에서 /blog · /faq 는
         첫 화면을 접어(높이 0) 두는데, 「있다」고만 세다 보니 흰 바탕에
         흰 로고가 그려졌다. */
      const tall = first.getBoundingClientRect().height > 40;
      return looksDark && tall && window.scrollY < 24 ? ("dark" as const) : ("light" as const);
    };

    const apply = () => {
      const next = measure();
      setTone((prev) => (prev === next ? prev : next));
    };

    /* 높이는 한 번 재고 끝내면 안 된다. 처음 그릴 때는 아직 CSS 가 안
       붙어 0 으로 읽힌다. 본문이 달라질 때마다 다시 잰다. */
    const main = document.querySelector("main");
    const ro = main ? new ResizeObserver(apply) : null;
    if (main && ro) ro.observe(main);

    const id = requestAnimationFrame(apply);
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      ro?.disconnect();
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
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
        /* 펼침판이 열리면 막대와 판이 한 장이어야 한다. 맨 위의 「막 없음」
            상태로는 판이 통째로 비쳐 글이 안 읽힌다 — 열리는 동안은 내려온
            뒤의 모습(흰 막 + 검은 글씨)으로 통일한다. */
        data-tone={mobileOpen || menu.open ? "light" : tone}
        data-mega={menu.open ? "true" : "false"}
        className="site-header glass-bar z-50"
        onPointerLeave={menu.scheduleClose}
      >
        {/* 본문(1600px)과 같은 폭을 쓴다. 1280 으로 가두면 넓은 화면에서
            헤더만 좁아 보인다. 높이도 한 단계 키워 답답함을 던다. */}
        <div
          className="hdr-bar relative max-w-[1600px] mx-auto h-20 flex items-center justify-between"
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
          <div className="hidden min-[960px]:flex items-center gap-8">
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
          <div className="min-[960px]:hidden flex items-center gap-2">
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

      {/* 모바일 메뉴. 화면을 통째로 덮지 않는다 —
          오른쪽 2/3 만 열리고 왼쪽 1/3 은 뒤 화면이 어둡게 비친다.
          그 어두운 자리를 누르면 닫힌다. */}
      <div
        id="mobile-navigation"
        aria-hidden={!mobileOpen}
        aria-label="모바일 메뉴"
        aria-modal={mobileOpen ? true : undefined}
        role={mobileOpen ? "dialog" : undefined}
        onClick={() => setMobileOpen(false)}
        className={`mnav-scrim ${mobileOpen ? "is-open" : ""}`}
      >
        <div className="mnav-sheet" onClick={(e) => e.stopPropagation()}>
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
        {/* 판이 헤더 위를 덮으므로 헤더의 그 단추를 못 누른다.
            닫는 단추는 판 안에 따로 둔다. */}
        <button
          type="button"
          className="mnav-close"
          aria-label="메뉴 닫기"
          onClick={() => setMobileOpen(false)}
        >
          <span aria-hidden />
          <span aria-hidden />
        </button>
        </div>
      </div>
    </>
  );
}
