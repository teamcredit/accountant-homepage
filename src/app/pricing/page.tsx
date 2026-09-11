import type { Metadata } from "next";
import PricingCalculator from "@/components/pricing/calculator";
import { AnimateOnScroll, LineReveal } from "@/components/motion";
import HeroVideo from "@/components/layout/hero-video";

export const metadata: Metadata = {
  title: "예상 수임료 계산",
  robots: { index: false, follow: true },
  description:
    "법인·개인사업자 예상 수임료를 6개의 질문으로 계산합니다. 업종, 매출, 직원 수 입력만으로 월 기장료와 연 신고/조정료를 즉시 안내합니다.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero bg-deep text-white relative overflow-hidden">
        {/* 히어로 배경 영상. 사이트 전체가 같은 소재를 쓴다. */}
        <HeroVideo opacity={0.38} />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[16rem] font-bold leading-none tracking-tighter select-none">
            PRICING
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <AnimateOnScroll variant="fadeIn">
            <p className="text-xs tracking-[0.4em] text-on-deep-muted mb-6 uppercase">
              Estimate
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              예상 수임료 계산
            </h1>
          </AnimateOnScroll>
          <div className="mt-6">
            <LineReveal className="h-0.5 w-20 bg-accent-bright" delay={0.3} />
          </div>
          <AnimateOnScroll variant="fadeUp" delay={0.4}>
            <p className="mt-8 text-lg text-neutral-400 max-w-xl leading-relaxed">
              업종 · 매출 · 직원 수 세 가지면, 월 기장료와 연 신고료가 바로 나옵니다.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fadeUp" delay={0.6}>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="t-label t-label-d px-3 py-1.5 border border-neutral-700">
                6개 질문
              </span>
              <span className="t-label t-label-d px-3 py-1.5 border border-neutral-700">
                업종 검색
              </span>
              <span className="t-label t-label-d px-3 py-1.5 border border-neutral-700">
                입력 즉시 반영
              </span>
              <span className="t-label t-label-d px-3 py-1.5 border border-neutral-700">
                URL로 공유
              </span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto px-6">
          <PricingCalculator />
        </div>
      </section>

    </>
  );
}
