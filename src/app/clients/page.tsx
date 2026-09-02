import type { Metadata } from "next";
import Link from "next/link";
import { personas, services } from "@/lib/data";
import { AnimateOnScroll, LineReveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "WHO",
  description:
    "설립 직후부터 성장기, 중요한 결정 직전까지. 단계별로 필요한 세무 서비스를 정리합니다.",
  alternates: {
    canonical: "/clients",
  },
};

export default function WhoPage() {
  return (
    <>
      <section className="py-32 md:py-44 bg-foreground text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[16rem] font-bold leading-none tracking-tighter select-none">
            WHO
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <AnimateOnScroll variant="fadeIn">
            <p className="text-xs tracking-[0.4em] text-neutral-500 mb-6 uppercase">
              Who
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.05] max-w-4xl">
              대표의 단계마다
              <br />
              필요한 일이 다릅니다
            </h1>
          </AnimateOnScroll>
          <div className="mt-6">
            <LineReveal className="h-0.5 w-20 bg-accent-bright" delay={0.3} />
          </div>
          <AnimateOnScroll variant="fadeUp" delay={0.4}>
            <p className="mt-8 text-lg text-neutral-400 max-w-3xl leading-relaxed">
              설립 직후엔 기장 기준을 세웁니다. 성장기엔 신고와 조정을 다시 잡습니다.
              큰 결정 앞에선 세부담부터 비교합니다.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="space-y-0">
            {personas.map((persona, index) => {
              const isEven = index % 2 === 0;
              const num = String(index + 1).padStart(2, "0");
              const fitItems = persona.fitServices
                .map((slug) => services.find((service) => service.slug === slug))
                .filter((service): service is NonNullable<typeof service> => Boolean(service));

              return (
                <AnimateOnScroll key={persona.slug} variant="fadeUp">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 py-16 md:py-24 border-t border-border last:border-b items-start">
                    <div
                      className={`md:col-span-5 ${
                        isEven ? "md:col-start-1" : "md:col-start-8 md:row-start-1"
                      }`}
                    >
                      <p className="t-label mb-4">
                        {persona.englishLabel}
                      </p>
                      <div className="flex items-baseline gap-4">
                        <span className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-200">
                          {num}
                        </span>
                        <h2 className="t-h3">
                          {persona.title}
                        </h2>
                      </div>

                      {/* 글만 있으면 왼쪽 칸이 비어 보인다.
                          단계별로 다른 인물을 한 명씩 세워 자리를 채운다. */}
                      <img
                        src={`/images/personas/${persona.slug}.svg`}
                        alt=""
                        aria-hidden
                        className="mt-10 hidden md:block w-full max-w-[260px] select-none"
                      />
                    </div>

                    <div
                      className={`md:col-span-6 ${
                        isEven ? "md:col-start-7" : "md:col-start-1 md:row-start-1"
                      }`}
                    >
                      <p className="t-desc">
                        {persona.description}
                      </p>

                      <div className="mt-8">
                        <p className="t-label mb-4">
                          자주 겪는 문제
                        </p>
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
                        <p className="t-label mb-4">
                          먼저 받게 되는 것
                        </p>
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
                        <p className="t-label mb-3">
                          Related Practice
                        </p>
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
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <AnimateOnScroll variant="fadeIn">
        <section className="py-24 md:py-32 bg-foreground text-white">
          <div className="max-w-[1600px] mx-auto px-6 text-center">
            <AnimateOnScroll variant="fadeUp">
              <p className="t-eyebrow t-eyebrow-d t-eyebrow-c mb-6">
                Contact
              </p>
              <h2 className="t-h2 max-w-3xl mx-auto">
                지금 어디가 막혔습니까
                <br />
                그 자리부터 보겠습니다
              </h2>
              <p className="t-desc t-desc-d mt-6 max-w-2xl mx-auto">
                매출 규모와 기존 기장 여부, 가장 급한 이슈 한 줄이면 충분합니다.
              </p>
              <Link
                href="/contact"
                className="group mt-10 inline-flex items-center btn-blue rounded-[10px] px-10 py-4 text-sm font-medium tracking-wider transition-all duration-300 hover:tracking-widest"
              >
                문의하기
                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}
