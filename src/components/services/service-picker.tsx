"use client";

/* 서비스 고르기.
 *
 * 왼쪽은 여섯 줄, 오른쪽은 고른 하나. 예전에는 이름 여섯 줄만 세워 두고
 * 오른쪽을 비워 뒀는데, 이름만으로는 뭐 하는 건지 알 수 없어서 여섯 번 다
 * 눌러 봐야 했다.
 *
 * 페이지를 넘기지 않고 그 자리에서 바꿔 본다. 정하고 나서 「자세히 보기」로
 * 상세로 간다 — 그래서 여기서는 한 문단까지만 보여 주고 멈춘다.
 *
 * 묶음은 헤더 메뉴와 같다. 전에는 메뉴만 「정기 / 사안별」로 갈라 놓고
 * 여기는 01~06 한 줄이라, 같은 여섯 개가 두 화면에서 다르게 묶였다.
 */

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Service } from "@/lib/data";
import { serviceGroups } from "@/lib/constants";
import ServiceIcon from "./service-icon";

export default function ServicePicker({ services }: { services: Service[] }) {
  const [pick, setPick] = useState(0);
  const cur = services[pick];

  return (
    <div className="spick">
      {/* 왼쪽 — 두 묶음 여섯 줄.
          번호는 묶음을 건너뛰지 않고 01 부터 06 까지 이어 붙인다.
          상세 히어로의 큰 번호와 같은 값이라, 끊으면 어긋난다. */}
      <ul className="spick-list" aria-label="서비스 고르기">
        {serviceGroups.map((g) => (
          <li key={g.title} className="spick-grp">
            <p className="spick-glab">{g.title}</p>
            <ul>
              {g.slugs.map((slug) => {
                const i = services.findIndex((x) => x.slug === slug);
                const s = services[i];
                if (!s) return null;
                return (
                  <li key={slug}>
                    {/* 올리면 오른쪽이 바뀌고, 누르면 그 페이지로 간다.
                        단추로 두니 눌러도 판만 바뀌어서, 「자세히 보기」를
                        한 번 더 찾아 눌러야 했다. */}
                    <Link
                      href={`/services/${slug}`}
                      className={`spick-item ${i === pick ? "is-on" : ""}`}
                      aria-current={i === pick ? "true" : undefined}
                      onMouseEnter={() => setPick(i)}
                      onFocus={() => setPick(i)}
                    >
                      <ServiceIcon name={s.icon} className="spick-icon" />
                      <span className="spick-no">{String(i + 1).padStart(2, "0")}</span>
                      <span className="spick-title">{s.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {/* 오른쪽 — 고른 하나 */}
      <div className="spick-panel" id="spick-panel">
        {/* 왼쪽 정사각 사진. 판 안쪽으로 꽉 채운다 — 여백을 두면 붙여 놓은
            썸네일이 되고, 꽉 채워야 판의 한쪽 면이 된다. */}
        <div className="spick-shot">
          <Image
            key={cur.slug}
            src={`/images/pick/${cur.slug}.webp`}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 34vw"
            className="object-cover"
          />
        </div>

        <div className="spick-body">
        <ServiceIcon name={cur.icon} className="spick-big" />
        <h3>{cur.title}</h3>
        <p className="spick-desc">{cur.description}</p>

        <ul className="spick-tags">
          {cur.details.slice(0, 4).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>

        <Link href={`/services/${cur.slug}`} className="spick-go">
          자세히 보기 <span aria-hidden>&rarr;</span>
        </Link>
        </div>
      </div>
    </div>
  );
}
