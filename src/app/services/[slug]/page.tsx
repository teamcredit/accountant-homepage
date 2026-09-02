import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/data";
import { AnimateOnScroll, StaggerChildren, LineReveal } from "@/components/motion";
import { StaggerItem } from "@/components/motion/stagger-item";

interface Props {
  params: Promise<{ slug: string }>;
}

const sampleArtifactsBySlug: Partial<
  Record<
    string,
    {
      title: string;
      subtitle: string;
      samples: Array<{ title: string; description: string }>;
    }
  >
> = {
  "tax-bookkeeping": {
    title: "산출물 활용 예시",
    subtitle: "장부는 입력으로 끝나지 않습니다. 월 마감 기준과 보고 체계까지 같이 잡아야 다음 달이 밀리지 않습니다.",
    samples: [
      {
        title: "월별 마감 일정표",
        description: "자료 요청일, 마감일, 검토일을 한 줄로 정리해 결산 지연을 줄입니다.",
      },
      {
        title: "계정 처리 기준 메모",
        description: "대표 급여, 법인카드, 반복 거래 처리 기준을 정리해 누락과 오분류를 줄입니다.",
      },
      {
        title: "주요 변동 리포트",
        description: "전월 대비 변동 항목을 한 장으로 추려, 대표가 한눈에 봅니다.",
      },
    ],
  },
  "tax-adjustment": {
    title: "산출물 활용 예시",
    subtitle: "신고 직전에 몰아서 맞추면 근거가 남지 않습니다. 검토 메모와 기준을 같이 남겨두면, 다음 해 신고가 그 위에서 출발합니다.",
    samples: [
      {
        title: "조정 항목 검토 메모",
        description: "핵심 조정 포인트와 판단 근거를 정리해 신고 직전 혼선을 줄입니다.",
      },
      {
        title: "공제 · 감면 검토표",
        description: "적용 가능 항목과 제외 항목을 나눠 소명 가능한 범위만 반영합니다.",
      },
      {
        title: "제출 기준 체크",
        description: "어떤 자료를 어떤 기준으로 남길지 미리 정리해 후속 대응을 준비합니다.",
      },
    ],
  },
  "tax-advisory": {
    title: "산출물 활용 예시",
    subtitle: "회의실에서 끝나면 다음 단계로 못 넘어갑니다. 비교표와 실행 순서를 문서로 남겨두면, 결정이 흔들려도 돌아갈 자리가 있습니다.",
    samples: [
      {
        title: "시나리오별 세부담 비교표",
        description: "방안별 세부담과 차이를 표로 비교해, 대표가 보고 선택합니다.",
      },
      {
        title: "권고안 메모",
        description: "추천 구조, 전제 조건, 유의사항을 짧은 메모로 남깁니다.",
      },
      {
        title: "실행 순서안",
        description: "결정 이후 어떤 순서로 신고와 후속 절차를 밟을지 묶어둡니다.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const currentIndex = services.findIndex((s) => s.slug === slug);
  const service = services[currentIndex];
  if (!service) notFound();
  const sampleArtifacts = sampleArtifactsBySlug[slug];

  const num = String(currentIndex + 1).padStart(2, "0");

  // Related services (exclude current, take up to 3)
  const related = services
    .filter((s) => s.slug !== slug)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="py-32 md:py-44 bg-foreground text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[14rem] font-bold leading-none tracking-tighter select-none">
            {num}
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <AnimateOnScroll variant="fadeIn">
            <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-10">
              <Link href="/" className="hover:text-neutral-300 transition-colors">
                HOME
              </Link>
              <span>/</span>
              <Link href="/services" className="hover:text-neutral-300 transition-colors">
                SERVICE
              </Link>
              <span>/</span>
              <span className="text-neutral-300">{service.title}</span>
            </nav>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <div className="flex items-baseline gap-5">
              <span className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-700">
                {num}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                {service.title}
              </h1>
            </div>
          </AnimateOnScroll>
          <div className="mt-6">
            <LineReveal className="h-0.5 w-20 bg-accent-bright" delay={0.3} />
          </div>
          <AnimateOnScroll variant="fadeUp" delay={0.4}>
            <p className="mt-8 text-lg text-neutral-400 max-w-xl leading-relaxed">
              {service.description}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content + Side Nav */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Side Navigation */}
            <aside className="lg:col-span-3">
              <AnimateOnScroll variant="fadeUp">
                <div className="lg:sticky lg:top-32">
                  <p className="t-eyebrow mb-4">
                    Services
                  </p>
                  <nav className="space-y-0 border-l border-border">
                    {services.map((s, i) => {
                      const isActive = s.slug === slug;
                      return (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className={`block pl-5 py-3 text-sm transition-all duration-200 border-l-2 -ml-px ${
                            isActive
                              ? "border-l-foreground text-foreground font-medium"
                              : "border-l-transparent text-muted hover:text-foreground hover:border-l-neutral-300"
                          }`}
                        >
                          <span className="text-xs text-subtle mr-2">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {s.title}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </AnimateOnScroll>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-20">
              {/* I. Service Details */}
              <AnimateOnScroll variant="fadeUp">
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="t-label">
                    I.
                  </span>
                  <h2 className="t-h3">
                    서비스 상세
                  </h2>
                </div>
              </AnimateOnScroll>
              <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.details.map((detail, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-5 p-6 md:p-8 border border-border hover:border-foreground transition-colors duration-300 group">
                      <span className="text-sm font-bold text-subtle group-hover:text-foreground transition-colors flex-shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-base leading-relaxed">{detail}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>

              {/* II. Deliverables */}
              {service.deliverables && service.deliverables.length > 0 && (
                <AnimateOnScroll variant="fadeUp">
                  <div className="flex items-baseline gap-4 mb-10">
                    <span className="t-label">
                      II.
                    </span>
                    <h2 className="t-h3">
                      산출물
                    </h2>
                    <span className="text-xs text-subtle ml-2">
                      Deliverables
                    </span>
                  </div>
                  <div className="border border-border">
                    {service.deliverables.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-5 p-5 md:p-6 border-b border-border last:border-b-0"
                      >
                        <span className="font-mono text-xs text-subtle mt-1 flex-shrink-0 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </AnimateOnScroll>
              )}

              {sampleArtifacts && (
                <AnimateOnScroll variant="fadeUp">
                  <div className="flex items-baseline gap-4 mb-10">
                    <span className="t-label">
                      III.
                    </span>
                    <h2 className="t-h3">
                      {sampleArtifacts.title}
                    </h2>
                  </div>
                  <p className="text-base text-muted leading-relaxed mb-8">
                    {sampleArtifacts.subtitle}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sampleArtifacts.samples.map((sample, index) => (
                      <div key={sample.title} className="border border-border bg-card p-6 md:p-7">
                        <p className="t-label">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="t-h4 mt-4">
                          {sample.title}
                        </h3>
                        <p className="mt-3 text-sm text-muted leading-relaxed">
                          {sample.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </AnimateOnScroll>
              )}

              {/* III/IV. Applicable Scenarios */}
              {service.applicableScenarios &&
                service.applicableScenarios.length > 0 && (
                  <AnimateOnScroll variant="fadeUp">
                    <div className="flex items-baseline gap-4 mb-10">
                      <span className="t-label">
                        {sampleArtifacts ? "IV." : "III."}
                      </span>
                      <h2 className="t-h3">
                        적용 케이스
                      </h2>
                      <span className="text-xs text-subtle ml-2">
                        Typical Scenarios
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {service.applicableScenarios.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-4 py-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 flex-shrink-0" />
                          <p className="text-base text-muted leading-relaxed">
                            {item}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </AnimateOnScroll>
                )}

              {/* CTA Box */}
              <AnimateOnScroll variant="fadeUp">
                <div className="p-10 md:p-12 bg-foreground text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h3 className="t-h4">
                        {service.title} 케이스를 상담하시려면
                      </h3>
                      <p className="mt-2 text-neutral-400 text-sm leading-relaxed">
                        지금 상황과 필요한 산출물을 짧게 보내주시면, 이 케이스에 들어맞는지부터 회신드립니다.
                      </p>
                    </div>
                    <Link
                      href={`/contact?type=${encodeURIComponent(service.title)}&output=${encodeURIComponent(
                        service.deliverables[0] ?? "적용 범위 검토"
                      )}`}
                      className="group inline-flex items-center justify-center btn-blue rounded-[10px] px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 flex-shrink-0"
                    >
                      문의하기
                      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Related Services */}
              <div>
                <AnimateOnScroll variant="fadeUp">
                  <h3 className="t-h4 mb-8">
                    다른 전문 영역
                  </h3>
                </AnimateOnScroll>
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map((s) => (
                    <StaggerItem key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="group block p-6 border border-border hover:border-foreground transition-colors duration-300"
                      >
                        <span className="t-label">
                          {String(
                            services.findIndex((sv) => sv.slug === s.slug) + 1
                          ).padStart(2, "0")}
                        </span>
                        <h4 className="mt-3 font-bold">{s.title}</h4>
                        <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                        <span className="mt-4 inline-flex items-center text-xs text-muted group-hover:text-foreground transition-colors">
                          보기 &rarr;
                        </span>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
