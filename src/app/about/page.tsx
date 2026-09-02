import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig, heroImages } from "@/lib/constants";
import { AnimateOnScroll, LineReveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "ABOUT",
  description:
    "박민상 공인회계사가 직접 운영하는 부티크 세무·재무 자문. 세무 기장부터 재무 자문까지 한번에",
  alternates: {
    canonical: "/about",
  },
};

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function AboutPage() {
  return (
    <>
      {/* ─── § 1. Hero ─── */}
      <section className="py-32 md:py-44 bg-foreground text-white relative overflow-hidden">
        {heroImages.about && (
          <>
            <Image
              src={heroImages.about}
              alt=""
              fill
              preload
              sizes="100vw"
              className="object-cover object-center animate-ken-burns-left"
              style={{ filter: "saturate(0.55) brightness(0.6) contrast(1.05)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/75 pointer-events-none" />
          </>
        )}

        <div className="hidden md:block absolute top-0 bottom-0 right-[12%] w-px bg-white/10" />

        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <AnimateOnScroll variant="fadeIn">
            <p className="text-xs tracking-[0.4em] text-neutral-500 mb-10 uppercase">
              About
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <h1
              className="text-7xl md:text-[9rem] lg:text-[9rem] font-semibold leading-[0.9] tracking-tight"
              style={serif}
            >
              Meridian.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeIn" delay={0.3}>
            <p className="mt-6 text-sm md:text-base tracking-[0.35em] text-neutral-400 uppercase">
              Prime Meridian
            </p>
          </AnimateOnScroll>

          <div className="mt-10">
            <LineReveal className="h-px w-24 bg-accent-bright" delay={0.4} />
          </div>

          <AnimateOnScroll variant="fadeUp" delay={0.5}>
            <div className="mt-10 max-w-2xl text-lg md:text-xl text-neutral-300 leading-[1.85]">
              <p className="mt-5">
                메리디안은 기준점을 제시해드립니다.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── § 2. 자오선 메타포 (Brand Statement) ─── */}
      <section className="py-28 md:py-40 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <AnimateOnScroll variant="fadeUp">
            <p className="t-eyebrow t-eyebrow-c mb-12">
              The Meridian
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <p
              className="t-h2 text-center text-foreground"
              style={{ wordBreak: "keep-all" }}
            >
              본초자오선<span className="text-accent">.</span>
              <br />
              <span className="t-subtitle" style={serif}>
                Prime Meridian
              </span>
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.2}>
            <div className="mt-16 max-w-2xl mx-auto text-center space-y-7">
              <p
                className="t-body"
                style={{ wordBreak: "keep-all" }}
              >
               
                영국 그리니치 천문대를 지나는 <strong className="text-foreground">경도 0°선</strong>.
                <br /> 
                세계의 시간은 여기서 출발합니다.
                <br /> 
                런던도, 서울도, 뉴욕도 이 한 선에 시각을 맞춥니다.
              </p>

              <div className="h-px w-12 bg-accent mx-auto" />

              <p
                className="t-body"
                style={{ wordBreak: "keep-all" }}
              >
                사업의 모든 결정에도 <strong className="text-foreground">기준선</strong>이 필요합니다.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.3}>
            <p
              className="t-h3 mt-16 text-center text-foreground max-w-2xl mx-auto"
              style={{ wordBreak: "keep-all" }}
            >
              <span className="text-accent">메리디안이 </span>그 기준선이 되어드리겠습니다.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── § 4. 메리디안의 약속 ─── */}
      <section className="py-24 md:py-36 bg-background border-t border-border">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* 왼쪽은 왜, 오른쪽은 약속 두 줄. 나란히 두면 문제와 답이 한눈에 붙는다. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <AnimateOnScroll variant="fadeUp">
            <p className="t-eyebrow mb-8">
              Our Promise
            </p>
            <h2
              className="t-h2 max-w-3xl"
              style={{ wordBreak: "keep-all" }}
            >
              메리디안의 약속<span className="green-dot">.</span>
            </h2>
            <div className="mt-8 h-px w-12 bg-accent" />
            <div
              className="t-lede-sm mt-10 space-y-6"
              style={{ wordBreak: "keep-all" }}
            >
              <ul className="t-body space-y-2 pl-4 border-l-2 border-border text-muted italic">
                <li>&ldquo;세무사·회계사와 연락이 닿지 않고 직원과만 소통한다.&rdquo;</li>
                <li>&ldquo;서류 요청이나 질의 사항에 회신이 지나치게 늦거나, 자주 내용이 틀려 내용을 믿기 어렵다.&rdquo;</li>
                <li>&ldquo;직원의 응대가 불친절하다.&rdquo;</li>
              </ul>
              <p>사업주분들이 세무대리인과 관련해 흔히하시는 이야기입니다.</p>
              <p>기준이 되어주어야할 세무대리인이 오히려 사업주의 고민거리가 되는 현실.</p>
              <p className="text-foreground font-medium">
                메리디안은 그 구조 자체를 다르게 두기로 했습니다.
              </p>
            </div>
          </AnimateOnScroll>

          {/* 메리디안이 제안드리는 기준점(메리디안의 약속) */}
          <div className="grid grid-cols-1 gap-px bg-border border border-border">
            {[
              {
                num: "01",
                title: "메리디안은 천천히 가겠습니다.",
                body:
                  "욕심내지 않겠습니다. 빠르게 성장하기보다는, 고객과 직원 모두가 만족할 수 있는 속도로 성장하겠습니다.",
              },
              {
                num: "02",
                title: "회계사가 직접 책임 지겠습니다.",
                body:
                  "직접 소통하겠습니다. 직원에게 책임을 전가하지 않겠습니다. ",
              },
            ].map((item) => (
              <div key={item.num} className="bg-background p-10 md:p-12">
                <p className="t-label mb-6">
                  약속 {item.num}
                </p>
                <h3
                  className="t-h3 text-foreground"
                  style={{ wordBreak: "keep-all" }}
                >
                  {item.title}
                </h3>
                <div className="mt-6 h-px w-10 bg-accent" />
                <p
                  className="t-body-lg mt-6"
                  style={{ wordBreak: "keep-all" }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          </div>

          {/* 어떻게 지키는가 */}
          <div className="mt-24 md:mt-32">
            <AnimateOnScroll variant="fadeUp">
              <p className="t-eyebrow mb-8">
                How we keep it
              </p>
              <h3
                className="t-h2 max-w-3xl"
                style={{ wordBreak: "keep-all" }}
              >
                메리디안이 기준점을 지켜가는 방식<span className="green-dot">.</span>
              </h3>
              <div className="mt-8 h-px w-12 bg-accent" />
            </AnimateOnScroll>

            <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
              {[
                {
                  num: "01",
                  title: "메리디안은 직원이 더 많이 생각할 수 있는 환경을 만듭니다.",
                  body:
                    "고객과의 소통에 더 많은 시간을 할애할 수 있도록, 단순·반복 작업은 자체 개발 솔루션으로 자동화·체계화합니다.",
                },
                {
                  num: "02",
                  title: "염가경쟁을 하지 않습니다",
                  body:
                    "염가 수임은 정당한 대가를 지불해주시는 고객분들께서 받으셔야 할 서비스 품질을 떨어뜨립니다. 정당한 대가로 업무를 수임하고 지속가능하게 운영하는 것은 메리디안과 함께하는 고객님 그리고 직원과의 약속입니다.",
                },
                {
                  num: "03",
                  title: "회계사가 많이 일합니다",
                  body:
                    "적게 일하고 많이 벌겠다는 욕심을 버리고, 직접 발로 뛰고 더 많이 고민합니다.",
                },
              ].map((item) => (
                <div key={item.num} className="bg-background p-10 md:p-12">
                  <p className="t-label mb-6">
                    {item.num}
                  </p>
                  <h4
                    className="t-h4 text-foreground"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {item.title}
                  </h4>
                  <div className="mt-6 h-px w-10 bg-accent" />
                  <p
                    className="t-body mt-6"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── § 5. 차별화 비교표 ─── */}
      <section className="py-28 md:py-40 bg-foreground text-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <AnimateOnScroll variant="fadeUp">
            <p className="t-eyebrow t-eyebrow-d mb-8">
              Comparison
            </p>
            <h2
              className="t-h2 max-w-3xl"
              style={{ wordBreak: "keep-all" }}
            >
              누구와 준비하느냐에 따라
              <br />
              결과는 달라집니다.
            </h2>
            <div className="mt-10 h-px w-16 bg-accent-bright" />
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.15}>
            <div className="mt-16 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="t-label t-label-d py-5 pr-6 w-1/3"></th>
                    <th className="t-label t-label-d py-5 px-6 w-1/3">
                      저가 기장 사무소
                    </th>
                    <th className="t-label py-5 px-6 w-1/3 text-white">
                      Meridian
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
                      <td className="py-6 px-6 text-white font-medium">{row.meridian}</td>
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
        <section className="py-24 md:py-32 bg-background border-t border-border">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <AnimateOnScroll variant="fadeUp">
                <p className="t-eyebrow mb-4">
                  Affiliation
                </p>
                <div className="mt-6 h-px w-16 bg-accent" />
              </AnimateOnScroll>
              <AnimateOnScroll variant="fadeUp" delay={0.15}>
                <div className="space-y-6 text-strong leading-[1.85]">
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
