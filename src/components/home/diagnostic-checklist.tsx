"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const checklist = [
  {
    id: "closing",
    title: "월별 결산 일정이 정해져 있습니까",
    description: "누가 언제 자료를 주고, 언제 숫자를 확인하는지 정해져 있어야 마감이 밀리지 않습니다.",
  },
  {
    id: "ledger",
    title: "기장 기준과 계정 처리 원칙이 있습니까",
    description: "대표 급여, 법인카드, 비용 처리 기준이 없으면 기장 누락과 오분류가 반복됩니다.",
  },
  {
    id: "tax",
    title: "신고 전에 검토 메모가 남습니까",
    description: "조정 항목, 공제 · 감면 적용 여부, 제출 기준을 미리 정리해야 신고 직전 혼선이 줄어듭니다.",
  },
  {
    id: "evidence",
    title: "소명 대응 기준이 있습니까",
    description: "자료를 요청받았을 때 어떤 근거로 설명할지 기준이 없으면 대응이 늦어집니다.",
  },
  {
    id: "comparison",
    title: "중요한 결정 전에 비교표를 만듭니까",
    description: "지분 이동, 승계, 자산 이전은 실행 전에 세부담과 순서를 표로 비교해야 합니다.",
  },
  {
    id: "owner",
    title: "대표가 매달 같은 형식의 숫자를 받습니까",
    description: "월별 리포트 형식이 일정해야 숫자를 비교하고 바로 의사결정에 쓸 수 있습니다.",
  },
];

type StatusMap = Record<string, boolean>;

export default function DiagnosticChecklist() {
  const [statusMap, setStatusMap] = useState<StatusMap>(
    Object.fromEntries(checklist.map((item) => [item.id, false]))
  );

  const completed = useMemo(
    () => checklist.filter((item) => statusMap[item.id]).length,
    [statusMap]
  );
  const unresolved = checklist.length - completed;

  const summary = useMemo(() => {
    if (unresolved >= 4) {
      return {
        headline: "기장 기준과 보고 체계를 먼저 정리해야 하는 상태입니다.",
        body: "월 마감 일정, 자료 요청 루틴, 계정 처리 기준부터 잡아야 이후 신고와 자문이 덜 흔들립니다.",
      };
    }

    if (unresolved >= 2) {
      return {
        headline: "운영 체계는 일부 있으나, 조정과 자문 연결 기준이 약합니다.",
        body: "신고 검토 메모와 비교표를 추가하면 대표가 숫자를 믿고 결정하기 쉬워집니다.",
      };
    }

    return {
      headline: "기본 운영 체계는 갖춰져 있습니다.",
      body: "이제는 주요 의사결정 전에 비교표와 검토 메모를 만드는 자문 단계로 넘어갈 수 있습니다.",
    };
  }, [unresolved]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12">
      <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklist.map((item, index) => {
          const checked = statusMap[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setStatusMap((current) => ({
                  ...current,
                  [item.id]: !current[item.id],
                }))
              }
              className={`text-left rounded-[10px] border p-6 md:p-7 transition-all duration-300 ${
                checked
                  ? "border-foreground bg-white"
                  : "border-border bg-card hover:border-neutral-400"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="t-label">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] tracking-[0.2em] uppercase ${
                    checked
                      ? "btn-blue"
                      : "bg-white text-muted border border-border"
                  }`}
                >
                  {checked ? "정리됨" : "미정리"}
                </span>
              </div>
              <h3 className="t-h4 mt-5">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="xl:col-span-4">
        <div className="border border-foreground bg-foreground text-white p-8 md:p-10 xl:sticky xl:top-32">
          <p className="t-label t-label-d">
            Diagnostic Summary
          </p>
          <h3 className="t-h2 mt-4">
            {unresolved}/6 항목이
            <br />
            미정리 상태입니다
          </h3>
          <p className="mt-6 text-base text-neutral-300 leading-relaxed">
            {summary.headline}
          </p>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
            {summary.body}
          </p>
          <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
            <p className="t-label t-label-d">
              추천 다음 단계
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              현재 병목과 필요한 결과물을 문의 폼에 그대로 보내주시면, 어디서부터 기장 · 조정 · 자문을 연결할지 먼저 정리합니다.
            </p>
          </div>
          <Link
            href={`/contact?type=${encodeURIComponent("전체 진단")}&bottleneck=${encodeURIComponent(
              `${unresolved}/6 항목 미정리`
            )}&output=${encodeURIComponent("운영 진단 및 우선순위 메모")}`}
            className="group mt-10 inline-flex items-center btn-blue rounded-[10px] px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300"
          >
            진단 결과 보내기
            <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
