"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion as useReducedMotion } from "@/lib/use-media";
import Link from "next/link";
import type { ReactNode } from "react";

const MotionLink = motion.create(Link);

interface HeroCtaButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}

export default function HeroCtaButton({
  href,
  children,
  variant = "primary",
}: HeroCtaButtonProps) {
  const reduced = useReducedMotion();

  const baseClasses =
    "group inline-flex items-center justify-center px-10 py-4 text-sm font-medium tracking-wider transition-colors duration-300";

  const variantClasses =
    variant === "primary"
      ? "bg-white text-foreground hover:bg-neutral-200"
      : "border border-neutral-700 hover:border-white";

  if (reduced) {
    return (
      <Link href={href} className={`${baseClasses} ${variantClasses}`}>
        {children}
        {variant === "primary" && (
          <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        )}
      </Link>
    );
  }

  return (
    <MotionLink
      href={href}
      className={`${baseClasses} ${variantClasses}`}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
      {variant === "primary" && (
        <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">
          &rarr;
        </span>
      )}
    </MotionLink>
  );
}
