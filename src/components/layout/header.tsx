"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { navLinks, siteConfig } from "@/lib/constants";
import SiteSearch from "./site-search";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });

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
        className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
      >
        {/* 본문(1600px)과 같은 폭을 쓴다. 1280 으로 가두면 넓은 화면에서
            헤더만 좁아 보인다. 높이도 한 단계 키워 답답함을 던다. */}
        <div
          className="max-w-[1600px] mx-auto h-20 flex items-center justify-between"
          /* 본문(.wrap)과 같은 좌우 여백. 어긋나면 로고와 본문 글이 안 맞는다. */
          style={{ paddingInline: "clamp(20px, 4vw, 40px)" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="transition-opacity duration-300 hover:opacity-60 flex-shrink-0 flex items-center gap-2"
          >
            <img src="/meridian-logo.png" alt="" className="h-7 w-7 md:h-8 md:w-8" />
            <span className="text-[1.35rem] md:text-[1.6rem] font-bold tracking-tight leading-none text-foreground">
              Meridian<span className="green-dot">.</span>
            </span>
          </Link>

          {/* Desktop Nav + Pricing + Client Login */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-10">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    /* 지금 어디에 있는지가 첫눈에 보여야 한다.
                       글씨를 브랜드 파랑으로 바꾸고 밑줄을 켜 둔 채로 고정한다. */
                    className={`relative text-[0.8125rem] font-medium tracking-[0.08em] transition-colors duration-300 hover-underline ${
                      isActive
                        ? "text-accent font-semibold nav-on"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-6">
              {/* CONTACT 옆 물음표. 누르면 알약 검색창으로 늘어난다. */}
              <SiteSearch />
              {/* 홈(promo)의 .btn .btn-fill 과 같은 생김새.
                  모서리 10px, 코발트, 색만 바뀐다. */}
              <a
                href={siteConfig.clientPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hdr-cta"
              >
                대시보드 시작하기
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
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
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className={`text-2xl font-light tracking-[0.12em] transition-all duration-200 ${
                  mobileOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                } ${isActive ? "text-accent font-normal" : "text-muted hover:text-foreground"}`}
                style={{
                  transitionDelay: mobileOpen ? `${index * 15 + 20}ms` : "0ms",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div
            className={`mt-6 flex items-center gap-3 transition-all duration-200 ${
              mobileOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: mobileOpen
                ? `${navLinks.length * 15 + 20}ms`
                : "0ms",
            }}
          >
            <a
              href={siteConfig.clientPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="hdr-cta"
            >
              대시보드 시작하기
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
