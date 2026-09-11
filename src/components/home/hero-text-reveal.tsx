"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion as useReducedMotion } from "@/lib/use-media";

interface HeroTextRevealProps {
  text: string;
  as?: "h1" | "div";
  className?: string;
  style?: React.CSSProperties;
}

export default function HeroTextReveal({
  text,
  as = "h1",
  className,
  style,
}: HeroTextRevealProps) {
  const reduced = useReducedMotion();
  const Component = as;

  if (reduced) {
    return (
      <Component className={className} style={style}>
        {text}
      </Component>
    );
  }

  return (
    <Component className={className} style={style} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Component>
  );
}
