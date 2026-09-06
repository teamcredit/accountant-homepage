import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { members } from "@/lib/data";
import { siteConfig } from "@/lib/constants";
import { AnimateOnScroll, LineReveal } from "@/components/motion";
import HeroVideo from "@/components/layout/hero-video";
import KeepList from "@/components/about/keep-list";
import MeridianGlobe from "@/components/about/meridian-globe";
import Wordmark from "@/components/brand/wordmark";

/* ─────────────────────────────────────────────────────────────
   회사 소개.

   짜임은 넷이다 — 어디서 시작했나(이름) · 누가 맡나(사람) · 어떻게 하나
   (방식) · 어디에 있나(사무소). 그다음 맺음. 읽는 사람이 회사 소개에서
   찾는 순서 그대로다.

   글은 새로 쓰지 않는다. 사이트 안에 이미 있던 것을 모아 한 장으로 눌러
   담는다. 첫 화면은 다른 하위 페이지와 같은 틀을 쓴다 — 자오선 연출은
   홈에 하나만 둔다.
   ───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "ABOUT",
  description: siteConfig.description,
  alternates: {
    canonical: "/about",
  },
};


export default function AboutPage() {
  const lead = members.find((m) => !m.placeholder);

  return (
    <>
      {/* ─── 첫 화면 ─── */}
      <section className="page-hero bg-deep text-white relative overflow-hidden">
        <HeroVideo opacity={0.38} />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[16rem] font-bold leading-none tracking-tighter select-none">
            ABOUT
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <AnimateOnScroll variant="fadeIn">
            <p className="text-xs tracking-[0.4em] text-on-deep-muted mb-6 uppercase">
              About
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            {/* 히어로 연출의 마지막 문장을 그대로 제목으로 세운다. */}
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tighter max-w-4xl leading-[1.15]"
              style={{ wordBreak: "keep-all" }}
            >
              <span className="text-accent-bright">메리디안</span>이 그 기준선이
              되어드리겠습니다.
            </h1>
          </AnimateOnScroll>
          <div className="mt-6">
            <LineReveal className="h-0.5 w-20 bg-accent-bright" delay={0.3} />
          </div>
          <AnimateOnScroll variant="fadeUp" delay={0.4}>
            <p
              className="mt-8 text-lg text-neutral-400 max-w-xl leading-relaxed"
              style={{ wordBreak: "keep-all" }}
            >
              매일의 기장부터 세무조정, 세무자문, 가치평가까지 회계사가 직접
              맡습니다.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── ① 이름 ───
          글 왼쪽, 지구본 오른쪽. 홈 첫 화면에 도는 그 지구본이다 —
          이름의 뜻을 글로만 적으면 그냥 사전 풀이가 된다. */}
      <section id="name" className="abt-sec scroll-mt-32">
        <div className="abt-in abt-in--split">
          <AnimateOnScroll variant="fadeUp">
            <div className="abt-side">
              <p className="abt-eyebrow">Prime Meridian</p>
              <h2 className="abt-h">
                본초자오선<span className="green-dot">.</span>
              </h2>
              <div className="abt-body">
                {/* 앞은 사실, 뒤는 그래서 우리가 하는 말이다. 뒤가 결론이라
                    앞보다 커야 순서대로 읽힌다. */}
                <p className="abt-fact">
                  <span className="s">영국 그리니치 천문대를 지나는 <strong>경도 0°선</strong>.</span>
                  <span className="s">세계의 시간은 여기서 출발합니다.</span>
                  <span className="s">런던도, 서울도, 뉴욕도 이 한 선에 시각을 맞춥니다.</span>
                </p>
                <p className="abt-claim">
                  사업의 모든 결정에도 <strong>기준선</strong>이 필요합니다.
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="abt-globe">
            <MeridianGlobe />
          </div>
        </div>
      </section>

      <div className="abt-rule" />

      {/* ─── ② 맡는 사람 ───
          사진 위에 검은 그라데이션을 덮고 그 위에 약속 한 줄. 사람 소개가
          아니라 「우리가 기준선이 된다」를 말하는 자리다.
          이력 전체는 /members 가 맡는다. */}
      {lead && (
        <section id="partner" className="abt-sec abt-sec--who scroll-mt-32">
          <div className="abt-in">
            <AnimateOnScroll variant="fadeUp">
              <figure className="who-hero">
                <Image
                  src={lead.image ?? "/images/founder.webp"}
                  alt={`${lead.name} ${lead.role}`}
                  width={1440}
                  height={900}
                  className="who-hero-img"
                  priority={false}
                />
                <figcaption className="who-hero-cap">
                  <p className="abt-eyebrow">People</p>
                  <h2 className="who-hero-h">
                    <span className="text-accent-bright">메리디안</span>이 그 기준선이
                    되어드리겠습니다<span className="green-dot">.</span>
                  </h2>
                </figcaption>
              </figure>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" delay={0.12}>
              <div className="who-under">
                <div className="who-say">
                  {/* 줄은 지정한 자리에서 끊는다. 앞줄이 주장이고 뒷줄이
                      그 근거라, 한 줄로 흘리면 둘이 뭉개진다. */}
                  <p>
                    <span className="s">
                      장부 한 줄을 어떻게 적느냐가 <strong>다음 결정의 근거</strong>가 됩니다.
                    </span>
                    <span className="s">
                      계정 분류 하나, 증빙 하나도 그 무게로 다룹니다.
                    </span>
                  </p>
                  <p>
                    <span className="s">
                      그래서 <strong>장부가 곧 자료</strong>입니다.
                    </span>
                    <span className="s">
                      대표가 다음 결정을 내릴 때 펼쳐 보는 자료.
                    </span>
                  </p>
                  <Link href="/members" className="abt-more">
                    전문 분야와 경력 보기 <span aria-hidden>&rarr;</span>
                  </Link>
                </div>

                {lead.practiceAreas && lead.practiceAreas.length > 0 && (
                  <div className="who-areas">
                    <p className="abt-eyebrow">Practice areas</p>
                    <ul>
                      {lead.practiceAreas.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      <div className="abt-rule" />

      {/* ─── ③ 지켜가는 방식 ───
          약속은 홈이 원본(무대 연출), 그 약속을 어떻게 지키는지는 여기가
          원본이다. */}
      <section id="keep" className="abt-sec abt-sec--soft scroll-mt-32">
        <div className="abt-in abt-in--left">
          <AnimateOnScroll variant="fadeUp">
            <p className="abt-eyebrow">How we keep it</p>
            <h2 className="abt-h">
              메리디안이 일하는 방식<span className="green-dot">.</span>
            </h2>
          </AnimateOnScroll>
          <div className="mt-14">
            <KeepList />
          </div>
        </div>
      </section>

      {/* ─── ④ 사무소 정보 ───
          제목 왼쪽 · 내용 오른쪽. 예전 배치를 그대로 쓴다. */}
      <section id="office" className="abt-sec scroll-mt-32">
        <div className="abt-in abt-in--split">
          <AnimateOnScroll variant="fadeUp">
            <div className="abt-side">
              <p className="abt-eyebrow">Office</p>
              <h2 className="abt-h">
                사무소 정보<span className="green-dot">.</span>
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.12}>
            <div className="abt-office">
              {/* 네 마디로 끊어 읽는다. 한 문단으로 흘리면 어디까지가
                  소속이고 어디부터가 안내인지 안 갈린다. */}
              <p className="abt-affil">
                <Wordmark className="text-[1.15rem] align-[-0.15em]" mark={false} />
                <span className="s">— 박민상 공인회계사는 동성회계법인 소속이며,</span>
                <span className="s">본 사이트는 자문 · 인사이트 활동을 소개하기 위한 개인 브랜드 공간입니다.</span>
                <span className="s">회계감사 · 세무 기장 · 세무 조정 · 세무 신고 등 법정 업무는</span>
                <span className="s">모두 동성회계법인 명의로 정식 수행됩니다.</span>
              </p>

              <dl className="abt-facts">
                <div>
                  <dt>Kakao</dt>
                  <dd>
                    <a
                      href={siteConfig.kakaoChannelUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      카카오톡 채널
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{siteConfig.email}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{siteConfig.location}</dd>
                </div>
                <div>
                  <dt>Founder</dt>
                  <dd>{siteConfig.founder}</dd>
                </div>
              </dl>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── 맺음. 서비스 상세와 같은 짜임을 쓴다. ─── */}
      <section className="svc-ask">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="svc-ask-in">
            <p className="svc-ask-lab">Contact</p>
            <h3>사업의 시작부터 다음 결정까지, 메리디안이 함께합니다</h3>
            <p className="svc-ask-p">
              지금 상황과 필요한 산출물을 짧게 보내주시면, 이 케이스에 들어맞는지부터 회신드립니다.
            </p>
            <div className="svc-ask-cta">
              <Link href="/contact" className="svc-ask-btn">
                기장 이관 상담하기 <span aria-hidden>&rarr;</span>
              </Link>
              <Link href="/contact" className="svc-ask-btn svc-ask-btn--line">
                전화로 문의
              </Link>
            </div>
            <p className="svc-ask-note">상담은 무료입니다.</p>
          </div>
        </div>
      </section>
    </>
  );
}
