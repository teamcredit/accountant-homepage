import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { AnimateOnScroll } from "@/components/motion";
import AboutOpening from "@/components/about/about-opening";
import PromiseStage from "@/components/about/promise-stage";
import KeepList from "@/components/about/keep-list";
import Wordmark from "@/components/brand/wordmark";

export const metadata: Metadata = {
  title: "ABOUT",
  description:
    "박민상 공인회계사가 직접 운영하는 부티크 세무·재무 자문. 세무 기장부터 재무 자문까지 한번에",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ─── § 1. 첫 화면 ───
          다른 페이지처럼 검정 히어로를 얹지 않는다. 스크롤 세 장면이
          그대로 히어로다. 헤더 뒤까지 검정이 올라가도록 위로 당겨 둔다. */}
      <AboutOpening />

      {/* ─── § 4. 메리디안의 약속 ───
          전부 가운데 정렬이다. 히어로의 0° 선이 화면 한가운데를 지나가니
          그 아래도 같은 축을 쓴다. */}
      <section className="py-24 md:py-36 bg-background border-t border-border text-center">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* 대화가 한 마디씩 오르고, 다 듣고 나면 좌우로 날아가 사라진다.
              비워진 그 자리에 약속 두 개가 천천히 올라온다. 한 무대다.
              제목도 무대 안에 함께 붙는다 — 화면이 붙어 있는 동안 제목만
              위로 흘러 나가면 무슨 이야기인지 알 수 없다. */}
          <PromiseStage
            head={
              <>
                <p className="t-eyebrow mb-8">Our Promise</p>
                <h2
                  className="t-h2 max-w-3xl mx-auto"
                  style={{ wordBreak: "keep-all" }}
                >
                  메리디안의 약속<span className="green-dot">.</span>
                </h2>
                <div className="mt-8 h-px w-12 bg-accent mx-auto" />
                <p
                  className="t-lede-sm mt-10 max-w-2xl mx-auto"
                  style={{ wordBreak: "keep-all" }}
                >
                  사업주분들이 세무대리인과 관련해 흔히 하시는 이야기입니다.
                </p>
              </>
            }
          />

          {/* 어떻게 지키는가 */}
          <div className="mt-24 md:mt-32">
            <AnimateOnScroll variant="fadeUp">
              <p className="t-eyebrow mb-8">
                How we keep it
              </p>
              <h3
                className="t-h2 max-w-3xl mx-auto"
                style={{ wordBreak: "keep-all" }}
              >
                메리디안이 기준점을 지켜가는 방식<span className="green-dot">.</span>
              </h3>
              <div className="mt-8 h-px w-12 bg-accent mx-auto" />
            </AnimateOnScroll>

            <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
              <KeepList />
            </div>
          </div>
        </div>
      </section>

      {/* ─── § 5. 차별화 비교표 ─── */}
      <section className="py-28 md:py-40 bg-foreground text-white text-center">
        <div className="max-w-[1600px] mx-auto px-6">
          <AnimateOnScroll variant="fadeUp">
            <p className="t-eyebrow t-eyebrow-d mb-8">
              Comparison
            </p>
            <h2
              className="t-h2 max-w-3xl mx-auto"
              style={{ wordBreak: "keep-all" }}
            >
              누구와 준비하느냐에 따라
              <br />
              결과는 달라집니다.
            </h2>
            <div className="mt-10 h-px w-16 bg-accent-bright mx-auto" />
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.15}>
            <div className="mt-16 overflow-x-auto max-w-4xl mx-auto text-left">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="t-label t-label-d py-5 pr-6 w-1/3"></th>
                    <th className="t-label t-label-d py-5 px-6 w-1/3">
                      저가 기장 사무소
                    </th>
                    <th className="py-5 px-6 w-1/3 text-white">
                      <Wordmark className="text-[1.3rem]" />
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm md:text-base">
                  {[
                    {
                      label: "관점",
                      low: "가격 경쟁력 중심",
                      meridian: "대표 본업의 시간 확보",
                    },
                    {
                      label: "누가 답하나",
                      low: "사무 직원",
                      meridian: "공인회계사 직접",
                    },
                    {
                      label: "기술 활용",
                      low: "수기 · 단순 전산",
                      meridian: "내부 AI · 업무 맞춤 자동화",
                    },
                    {
                      label: "소통 방식",
                      low: "담당자 연결 지연",
                      meridian: "회계사 직접 답신",
                    },
                  ].map((row, i) => (
                    <tr key={row.label} className={i < 4 ? "border-b border-neutral-800" : ""}>
                      <td className="py-6 pr-6 font-medium text-white">{row.label}</td>
                      <td className="py-6 px-6 text-neutral-400">{row.low}</td>
                      <td className="py-6 px-6 text-white font-semibold text-[1.05rem]">{row.meridian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── § 6. Affiliation ─── */}
      <AnimateOnScroll variant="fadeIn">
        <section className="py-24 md:py-32 bg-background border-t border-border text-center">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <AnimateOnScroll variant="fadeUp">
                <p className="t-eyebrow mb-4">
                  Affiliation
                </p>
                <div className="mt-6 h-px w-16 bg-accent mx-auto" />
              </AnimateOnScroll>
              <AnimateOnScroll variant="fadeUp" delay={0.15}>
                <div className="mt-12 space-y-6 text-strong leading-[1.85]">
                  <p>
                    <strong className="text-foreground">메리디안 어드바이저리</strong>는
                    박민상 공인회계사가 운영하는 개인 자문 브랜드이며, 별도의 법인이 아닙니다.
                  </p>
                  <p>
                    박민상 공인회계사는{" "}
                    <strong className="text-foreground">동성회계법인</strong> 소속이며, 메리디안 어드바이저리를 통해 수임하는 모든 업무는 동성회계법인과의 계약에 따라 수행됩니다.
                  </p>
                  <div className="pt-6 mt-6 border-t border-border space-y-1">
                    <p className="t-label">
                      Direct Contact
                    </p>
                    <p className="text-foreground">
                      Kakao.{" "}
                      <a
                        href={siteConfig.kakaoChannelUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:text-accent transition-colors underline-offset-2 hover:underline"
                      >
                        카카오톡 채널
                      </a>
                    </p>
                    <p className="text-foreground">Email. {siteConfig.email}</p>
                    <p className="text-muted text-sm pt-1">
                      {siteConfig.location}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}
