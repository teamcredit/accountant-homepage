/* 서비스 상세를 읽는 동안 따라다니는 띠.
 *
 * 상세 한복판에서 「다른 건 뭐가 있지」가 되면 지금까지는 길이 둘뿐이었다 —
 * 위로 올라가 헤더 메뉴에 마우스를 올리거나, 맨 아래까지 내려가는 것.
 * 3,000px 짜리 페이지에서 둘 다 멀다.
 *
 * 첫 화면(히어로) 안에 들어간다. 밖에 따로 띠로 깔았더니 제목 · 파란
 * 선 · 설명이 333px 안에 눌려서 숨통이 없었다. 히어로를 키우고 그 안에
 * 넣으면 한 장으로 읽힌다.
 *
 * 「서비스로 돌아가기」는 뺐다 — 여섯이 다 서 있는데 되돌아갈 곳을
 * 따로 둘 이유가 없다.
 */

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Service } from "@/lib/data";
import { serviceGroups } from "@/lib/constants";

export default function ServiceBar({
  services,
  slug,
}: {
  services: Service[];
  slug: string;
}) {
  const hereRef = useRef<HTMLSpanElement>(null);

  /* 좁은 화면에서는 여섯 개가 안 들어가 띠 안에서 가로로 민다. 지금 보고
     있는 게 다섯 번째면 화면 밖이라, 「내가 어디」를 못 본다. 띠만 민다 —
     block:"nearest" 를 빼면 페이지 전체가 같이 튄다. */
  useEffect(() => {
    hereRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [slug]);

  return (
    <nav className="svcbar" aria-label="서비스 이동">
      <div className="svcbar-in">
        {/* 묶음은 헤더 메뉴·서비스 목록과 같다. 세 화면이 같은 배열을 본다. */}
        <ul className="svcbar-list">
          {serviceGroups.map((g) => (
            <li key={g.title} className="svcbar-grp">
              <span className="svcbar-glab">{g.title}</span>
              {g.slugs.map((sl) => {
                const s = services.find((x) => x.slug === sl);
                if (!s) return null;
                /* 지금 보고 있는 것은 눌리지 않는다. 제자리 링크는
                   눌러도 아무 일이 없어서 고장으로 읽힌다. */
                return s.slug === slug ? (
                  <span key={sl} ref={hereRef} className="is-here" aria-current="page">
                    {s.title}
                  </span>
                ) : (
                  <Link key={sl} href={`/services/${sl}`}>{s.title}</Link>
                );
              })}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
