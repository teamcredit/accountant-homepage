"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion as useReducedMotion } from "@/lib/use-media";
import type { ReactNode } from "react";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

const clipPaths = {
  up: { hidden: "inset(100% 0 0 0)", visible: "inset(0 0 0 0)" },
  down: { hidden: "inset(0 0 100% 0)", visible: "inset(0 0 0 0)" },
  left: { hidden: "inset(0 100% 0 0)", visible: "inset(0 0 0 0)" },
  right: { hidden: "inset(0 0 0 100%)", visible: "inset(0 0 0 0)" },
};

export default function ImageReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ImageRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ clipPath: clipPaths[direction].hidden }}
      whileInView={{ clipPath: clipPaths[direction].visible }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
