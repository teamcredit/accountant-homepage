"use client";

/* 단계 셋을 한 번에 한 칸씩.
 *
 * 셋을 세로로 이어 붙여 두니 한 페이지가 4,200px 이 됐다. 읽는 사람은
 * 셋 다 읽지 않는다 — 자기가 어느 단계인지 하나만 본다.
 *
 * 위 눈금이 곧 고르는 자리다. 01 · 02 · 03 을 누르면 그 자리에서 아래가
 * 바뀐다. 페이지를 넘기지 않으니 셋을 견줘 보기도 쉽다.
 */

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Persona, Service } from "@/lib/data";

export default function StagePicker({
  personas,
  services,
}: {
  personas: Persona[];
  services: Service[];
}) {
  const [pick, setPick] = useState(0);
  useEffect(() => {
    const sync = () => {
      const index = personas.findIndex(it => `#${it.slug}` === window.location.hash);
      setPick(index < 0 ? 0 : index);
    };
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync); };
  }, [personas]);
  const select = (index: number) => {
    setPick(index);
    window.history.pushState(null, '', `#${personas[index].slug}`);
  };
  const persona = personas[pick];
  const num = String(pick + 1).padStart(2, "0");
  const fitItems = persona.fitServices
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is Service => Boolean(s));

  return (
    <div className="stg">
      {/* 눈금이자 고르는 자리. 선 위의 점 셋. */}
      <ol className="stage-rail stg-rail" role="tablist" aria-label="단계 고르기">
        {personas.map((it, i) => (
          <li key={it.slug} role="presentation">
            <button
              type="button"
              role="tab"
              id={`stage-tab-${it.slug}`}
              tabIndex={i === pick ? 0 : -1}
              aria-selected={i === pick}
              aria-controls="stg-panel"
              className={i === pick ? "is-on" : undefined}
              onClick={() => select(i)}
              onKeyDown={(event) => {
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? personas.length - 1 : event.key === 'ArrowRight' ? (i + 1) % personas.length : event.key === 'ArrowLeft' ? (i - 1 + personas.length) % personas.length : -1;
                if (next < 0) return;
                event.preventDefault();
                select(next);
                document.getElementById(`stage-tab-${personas[next].slug}`)?.focus();
              }}
            >
              <span className="stage-dot" />
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span className="stage-name">{it.title}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* 고른 하나. key 를 바꿔 다시 그리게 두면 들어오는 동작이 매번 다시 돈다. */}
      <div className="stg-panel" id="stg-panel" role="tabpanel" aria-labelledby={`stage-tab-${persona.slug}`} tabIndex={0} key={persona.slug}>
        <div className="stg-left">
          <p className="t-label mb-4">{persona.englishLabel}</p>
          <div className="flex items-baseline gap-4">
            <span
              className="text-5xl md:text-7xl font-bold tracking-tighter text-[#C7D3EE]"
              aria-hidden
            >
              {num}
            </span>
            <h2 className="t-h3">{persona.title}</h2>
          </div>

          {/* 설명은 제목 바로 밑 부제목이다. 오른쪽 목록 위에 두면
              무엇에 대한 설명인지 한 칸 건너 읽어야 한다. */}
          <p className="stg-desc">
            {persona.description.split("|").map((line) => (
              <span key={line}>{line.trim()}</span>
            ))}
          </p>

          {/* 글만 있으면 왼쪽 칸이 비어 보인다.
              단계마다 다른 인물을 한 명씩 세워 자리를 채운다. */}
          <Image
            src={`/images/personas/${persona.slug}.svg`}
            alt=""
            aria-hidden
            width={260}
            height={260}
            className="stg-figure"
          />
        </div>

        <div className="stg-right">
          <div className="mt-8">
            <p className="t-label mb-4">자주 겪는 문제</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {persona.bottlenecks.map((item) => (
                <p
                  key={item}
                  className="t-body-sm text-muted py-1 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="t-label mb-4">먼저 받게 되는 것</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {persona.outputs.map((item) => (
                <p
                  key={item}
                  className="t-body-sm text-muted py-1 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="t-label mb-3">Related Service</p>
            <div className="flex flex-wrap gap-2">
              {fitItems.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center rounded-[10px] px-3 py-1.5 text-xs border border-border hover:border-foreground transition-colors duration-300"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
