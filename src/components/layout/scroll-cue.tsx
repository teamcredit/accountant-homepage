"use client";

import { useEffect, useState } from "react";

/**
 * 화면 아래를 살짝 흐려 두는 띠.
 *
 * 글이 이 아래로 이어진다는 걸 색이 아니라 초점으로 알린다.
 * 색을 덮으면 흰 페이지와 검은 히어로에서 값을 따로 잡아야 하는데,
 * 흐리기는 뒤가 뭐든 그대로 먹는다.
 *
 * 바닥에 닿으면 끈다. 더 내릴 게 없는데 흐려 두면 그냥 때가 낀 것처럼 보인다.
 */
export default function ScrollCue() {
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const read = () => {
      const gap =
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight;
      setAtEnd(gap < 24);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return (
    <div className="scroll-cue" data-end={atEnd ? "1" : undefined} aria-hidden>
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
