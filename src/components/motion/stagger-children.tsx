"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion as useReducedMotion } from "@/lib/use-media";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const containerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: {
      staggerChildren: staggerDelay,
    },
  }),
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export default function StaggerChildren({
  children,
  staggerDelay = 0.08,
  className,
  once = true,
  amount = 0.1,
}: StaggerChildrenProps) {
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const reduced = useReducedMotion();

  if (!hydrated || reduced) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      custom={staggerDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
}
