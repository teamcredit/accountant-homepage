"use client";

import { useState } from "react";

export default function CopyUrlButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-xs font-bold text-muted transition-colors hover:border-foreground hover:text-foreground"
      aria-label={copied ? "URL 복사 완료" : "URL 복사"}
    >
      {copied ? "✓" : "URL"}
    </button>
  );
}
