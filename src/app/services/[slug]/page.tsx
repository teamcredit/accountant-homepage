import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/data";
import { AnimateOnScroll, LineReveal } from "@/components/motion";
import HeroVideo from "@/components/layout/hero-video";
import ServiceBar from "@/components/services/service-bar";
import { getAllPosts } from "@/lib/posts";
import DeliverableIcon from "@/components/services/deliverable-icon";

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

/* 「DCF 모델 (Excel 워크북, 가정 변경 가능 구조)」처럼 괄호가 붙은 이름을
   이름과 설명으로 가른다. 괄호가 없으면 이름 하나로 그대로 둔다. */
function splitName(label: string) {
  const at = label.indexOf(" (");
  if (at < 0) return { name: label, note: "" };
  return { name: label.slice(0, at), note: label.slice(at + 1) };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const currentIndex = services.findIndex((s) => s.slug === slug);
  const service = services[currentIndex];
  if (!service) notFound();
  const sampleArtifacts = sampleArtifactsBySlug[slug];

  /* 이 서비스와 맞물리는 글 셋. 갈래만 맞추고 최신순으로 자른다 —
     글 목록을 서비스마다 손으로 붙이면 글이 늘 때마다 여기를 고쳐야 한다. */
  const related = service.postTopics?.length
    ? getAllPosts()
        .filter((post) => service.postTopics!.includes(post.category))
        .slice(0, 3)
    : [];

  const num = String(currentIndex + 1).padStart(2, "0");


  return (
    <>
      {/* Hero */}
      <section className="page-hero page-hero--svc page-hero--tall bg-deep text-white relative overflow-hidden">
        {/* 히어로 배경 영상. 사이트 전체가 같은 소재를 쓴다. */}
        <HeroVideo opacity={0.38} />
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[14rem] font-bold leading-none tracking-tighter select-none">
            {num}
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          {/* 「홈 / 서비스 / 세무 조정」 한 줄은 뺐다. 히어로 바로 밑에
              형제 여섯이 다 서 있는 이동 띠가 같은 일을 한다. */}

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
            {/* 어절 중간에서 끊지 않는다. 「따져야 하 / 는 이슈를」로 갈라져 있었다. */}
            <p className="svc-desc">{service.description}</p>
          </AnimateOnScroll>

          {/* 형제 여섯. 첫 화면 안에 같이 넣는다 — 밖에 띠로 깔았더니
              제목 · 선 · 설명이 333px 안에 눌려 숨통이 없었다. */}
          <AnimateOnScroll variant="fadeUp" delay={0.55}>
            <ServiceBar services={services} slug={slug} />
          </AnimateOnScroll>
        </div>
      </section>


      {/* ── 위계 ────────────────────────────────────
          셋을 같은 제목·같은 카드로 세워 두니 무엇이 본체이고 무엇이
          곁가지인지 안 보였다. 게다가 순서가 거꾸로였다 —
          「내 상황인가」가 맨 뒤에 있었다.

          읽는 순서대로, 무게를 셋으로 나눈다.
            들머리  이런 때  → 띠 하나. 번호 없음. 훑고 지나가는 곳
            본체    하는 일  → 번호 붙은 큰 제목 + 카드
            결론    드리는 것 → 짙은 판 전체 폭. 이 페이지에서 제일 무겁다
            각주    근거 법령 → 제일 작게

          번호는 본체와 결론에만 붙인다. 번호가 붙었다는 것 자체가
          「이 둘이 핵심」이라는 표시가 된다. */}

      {/* 들머리 — 이런 때 */}
      {service.applicableScenarios?.length > 0 && (
        <section className="svc-when">
          <div className="max-w-[1600px] mx-auto px-6">
            <AnimateOnScroll variant="fadeUp">
              <p className="svc-when-lab">이런 때 필요합니다</p>
              <ul className="svc-when-list">
                {service.applicableScenarios.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* 본체 — 하는 일 */}
      <section className="svc-body">
        <div className="max-w-[1600px] mx-auto px-6">
          <AnimateOnScroll variant="fadeUp">
            <div className="svc-head svc-head--lead">
              <h2 className="svc-h">하는 일</h2>
              <span className="svc-en">What we do</span>
            </div>
            <ul className="svc-cards">
              {service.details.map((detail, i) => (
                <li key={i} className="svc-card">
                  <span className="svc-chip">{String(i + 1).padStart(2, "0")}</span>
                  <p>{detail}</p>
                </li>
              ))}
            </ul>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 결론 — 드리는 것.
          손에 남는 물건이라 페이지에서 제일 무거워야 한다. 짙은 판을
          페이지 폭으로 깔아 「하는 일」과 격을 벌린다. */}
      {service.deliverables?.length > 0 && (
        <section className="svc-give">
          <div className="max-w-[1600px] mx-auto px-6">
            <AnimateOnScroll variant="fadeUp">
              <div className="svc-head svc-head--lead svc-head--on">
                <h2 className="svc-h">드리는 것</h2>
                <span className="svc-en">Deliverables</span>
              </div>
              {/* 손에 남는 물건이라 하나씩 세워 둔다. 두 기둥에 눕히면
                  「하는 일」과 같은 목록으로 읽혀서, 받는 것인지 하는
                  것인지 구분이 안 됐다. 다섯에서 여섯이 한 줄에 선다. */}
              <ul className="svc-give-cards">
                {service.deliverables.map((item, i) => (
                  <li key={i}>
                    <DeliverableIcon label={item} />
                    {/* 괄호 안은 이름이 아니라 설명이다. 한 줄에 이어 붙이면
                        「가정 변경 가능 / 구조)」처럼 닫는 괄호만 떨어진다. */}
                    <p>
                      <span className="svc-give-name">{splitName(item).name}</span>
                      {splitName(item).note && (
                        <span className="svc-give-note">{splitName(item).note}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      <section className="svc-body svc-body--tail">
        <div className="max-w-[1600px] mx-auto px-6">

          {/* 산출물 활용 예시 — 자료가 있는 서비스만 */}
          {sampleArtifacts && (
            <AnimateOnScroll variant="fadeUp">
              <div className="svc-head svc-head--lead">
                <h2 className="svc-h">{sampleArtifacts.title}</h2>
              </div>
              <p className="svc-lede">{sampleArtifacts.subtitle}</p>
              <div className="svc-samples">
                {sampleArtifacts.samples.map((sample, index) => (
                  <div key={sample.title} className="svc-sample">
                    <span className="svc-i">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{sample.title}</h3>
                    <p>{sample.description}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          )}
          {/* 각주 — 근거 법령.
              data.ts 에 서비스마다 서너 줄씩 들어 있는데 지금까지 화면에
              한 번도 안 나왔다. 세무에서 근거 조문은 신뢰의 핵심이지만,
              읽으러 오는 글은 아니라 제일 작게 둔다. */}
          {service.regulations && service.regulations.length > 0 && (
            <AnimateOnScroll variant="fadeUp">
              <div className="svc-head svc-head--sub">
                <h2 className="svc-h">근거 법령</h2>
                <span className="svc-en">Statutes</span>
              </div>
              <ul className="svc-laws">
                {service.regulations.map((item) => (
                  <li key={item}>
                    <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor"
                         strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v12M3.5 5h9" />
                      <path d="M3.5 5 1.8 9h3.4zM12.5 5 10.8 9h3.4z" />
                      <path d="M5 14h6" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          )}

        {/* 관련 인사이트. 서비스 설명은 「무엇을 하는가」까지고, 실제 사안이
            어떻게 굴러가는지는 글이 보여 준다. 없으면 이 칸은 안 선다. */}
        {related.length > 0 && (
          <div className="svc-read">
              <AnimateOnScroll variant="fadeUp">
                <div className="svc-head">
                  <h2 className="svc-h">관련 인사이트</h2>
                  <span className="svc-en">Insights</span>
                </div>
                <ul className="svc-read-list">
                  {related.map((post) => (
                    <li key={post.slug}>
                      <Link href={`/blog/${post.slug}`}>
                        <span className="svc-read-cat">{post.category}</span>
                        <span className="svc-read-title">{post.title}</span>
                        <span className="svc-read-date">{post.date}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/blog" className="svc-read-all">
                  인사이트 전체 보기 <span aria-hidden>&rarr;</span>
                </Link>
              </AnimateOnScroll>
          </div>
        )}

        </div>
      </section>

      <section className="svc-ask">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="svc-ask-in">
            <p className="svc-ask-lab">Contact</p>
            <h3>{service.title} 케이스를 상담하시려면</h3>
            <p className="svc-ask-p">
              지금 상황과 필요한 산출물을 짧게 보내주시면, 이 케이스에 들어맞는지부터 회신드립니다.
            </p>
            <div className="svc-ask-cta">
              <Link
                href={`/contact?type=${encodeURIComponent(service.title)}&output=${encodeURIComponent(
                  service.deliverables[0] ?? "적용 범위 검토"
                )}`}
                className="svc-ask-btn"
              >
                문의하기 <span aria-hidden>&rarr;</span>
              </Link>
              <Link href="/contact" className="svc-ask-btn svc-ask-btn--line">
                전화로 문의
              </Link>
            </div>
            <p className="svc-ask-note">상담은 무료입니다.</p>
          </div>
        </div>
      </section>

      {/* 맨 아래 있던 「다른 서비스」 여섯 줄은 뺐다. 위 띠가 같은 목록을
          내내 들고 다녀서, 남겨 두면 한 페이지에 여섯 이름이 두 번 선다. */}

    </>
  );
}
