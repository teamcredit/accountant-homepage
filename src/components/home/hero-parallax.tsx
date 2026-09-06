"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface HeroParallaxProps {
  backgroundContent: ReactNode;
  children: ReactNode;
}

export default function HeroParallax({
  backgroundContent,
  children,
}: HeroParallaxProps) {
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Use window scroll directly — no target ref needed
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);
  const contentY = useTransform(scrollY, [0, 800], [0, -80]);
  const contentOpacity = useTransform(scrollY, [0, 800], [1, 0.15]);

  const disabled = reduced || isMobile;

  return (
    <section className="relative bg-deep text-white min-h-screen flex items-center overflow-hidden">
      {/* Background layer */}
      {disabled ? (
        <>{backgroundContent}</>
      ) : (
        <motion.div
          className="absolute inset-0"
          style={{ y: backgroundY }}
        >
          {backgroundContent}
        </motion.div>
      )}

      {/* Content layer */}
      {disabled ? (
        <>{children}</>
      ) : (
        <motion.div
          className="relative z-10 w-full"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          {children}
        </motion.div>
      )}

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent z-10" />
    </section>
  );
}
