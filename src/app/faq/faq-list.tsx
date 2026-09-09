"use client";

/* 문답 목록. 하나만 펴 둔다 — 여덟 개를 다 펴면 화면 세 개가 되고,
   그러면 목록이 아니라 문서가 된다. */

import { useState } from "react";
import type { FaqItem } from "@/lib/faq";

export default function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="ins-faq">
      {items.map((item, i) => (
        <li key={item.q} className={open === i ? "is-open" : undefined}>
          <button
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="ins-faq-q">{item.q}</span>
            <span className="ins-faq-mark" aria-hidden />
          </button>
          {open === i && <p className="ins-faq-a">{item.a}</p>}
        </li>
      ))}
    </ul>
  );
}
