"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import type { Service } from "@/lib/data";

interface StickyScrollServicesProps {
  services: Service[];
}

export default function StickyScrollServices({
  services,
}: StickyScrollServicesProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showSticky = isDesktop && !reduced;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!showSticky) return;
    const index = Math.min(
      Math.floor(latest * services.length),
      services.length - 1
    );
    setActiveIndex(index);
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      style={showSticky ? { minHeight: `${services.length * 80}vh` } : undefined}
    >
      {!showSticky ? (
        /* Mobile / reduced-motion: stacked layout */
        <div className="space-y-0">
          {services.map((service, index) => {
            const num = String(index + 1).padStart(2, "0");
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group block border-t border-border last:border-b"
              >
                <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
                  <div className="md:col-span-5">
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl md:text-7xl font-bold tracking-tighter text-[#C7D3EE] group-hover:text-foreground transition-colors duration-500" aria-hidden>
                        {num}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {service.title}
                      </h2>
                    </div>
                  </div>
                  <div className="md:col-span-6 md:col-start-7">
                    <p className="text-muted leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="t-label mb-3">
                          주요 범위
                        </p>
                        <div className="space-y-2">
                          {service.details.slice(0, 4).map((detail) => (
                            <p
                              key={detail}
                              className="text-sm text-subtle py-1 flex items-start gap-2"
                            >
                              <span className="w-1 h-1 rounded-full bg-subtle mt-2 flex-shrink-0" />
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="t-label mb-3">
                          산출물
                        </p>
                        <div className="space-y-2">
                          {service.deliverables.slice(0, 4).map((item) => (
                            <p
                              key={item}
                              className="text-sm text-subtle py-1 flex items-start gap-2"
                            >
                              <span className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="mt-6 inline-flex items-center text-xs font-medium tracking-wider text-muted group-hover:text-foreground transition-colors duration-300">
                      {service.cta}
                      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Desktop: sticky scroll layout */
        <div className="sticky top-0 h-screen flex items-center">
          <div className="max-w-[1600px] mx-auto px-6 w-full grid grid-cols-12 gap-16">
            {/* Left — sticky title */}
            <div className="col-span-5 flex flex-col justify-center">
              {/* Progress bar */}
              <div className="flex gap-2 mb-8">
                {services.map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 w-8 transition-colors duration-300 ${
                      i <= activeIndex ? "bg-foreground" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <span className="text-8xl font-bold tracking-tighter text-[#C7D3EE]" aria-hidden>
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">
                    {services[activeIndex].title}
                  </h2>
                  <div className="mt-4 h-0.5 w-16 bg-accent" />
                </motion.div>
              </AnimatePresence>

              {/* Scroll hint */}
              <p className="mt-8 text-xs text-subtle tracking-wider uppercase">
                {activeIndex + 1} / {services.length} · Scroll to explore
              </p>
            </div>

            {/* Right — scrolling content */}
            <div className="col-span-7 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <p className="text-lg text-muted leading-relaxed mb-8">
                    {services[activeIndex].description}
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="t-label mb-4">
                        주요 범위
                      </p>
                      <div className="space-y-3">
                        {services[activeIndex].details.slice(0, 4).map((detail) => (
                          <p
                            key={detail}
                            className="text-sm text-subtle py-1.5 flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-subtle mt-2 flex-shrink-0" />
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="t-label mb-4">
                        산출물
                      </p>
                      <div className="space-y-3">
                        {services[activeIndex].deliverables.slice(0, 4).map((item) => (
                          <p
                            key={item}
                            className="text-sm text-subtle py-1.5 flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/services/${services[activeIndex].slug}`}
                    className="group mt-8 inline-flex items-center text-sm font-medium tracking-wider hover-underline"
                  >
                    {services[activeIndex].cta}
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
