import Link from "next/link";
import type { Metadata } from "next";
import { services } from "@/lib/data";

/* 하는 일 카드 줄바꿈. 마침표·쉼표 자리에서만 끊는다.
   data.ts 의 description 은 서비스 상세 페이지도 같이 쓰므로 건드리지 않는다. */
const SVC_LINES: Record<string, string[]> = {
  "tax-bookkeeping": [
    "월별 장부를 정리하고, 부가세·원천세 신고 일정을 운영합니다.",
    "매달 같은 기준으로 숫자가 떨어집니다. 대표가 그 자리에서 보고 판단합니다.",
  ],
  "tax-adjustment": [
    "법인세·소득세 신고 전에 조정 항목을 정리하고,",
    "공제·감면 적용 여부를 검토합니다.",
    "근거는 문서로 남깁니다. 신고 후 소명 요청이 와도 그 자리에서 꺼낼 수 있도록.",
  ],
  "tax-advisory": [
    "지분 이동, 승계, 자산 이전, 특수관계자 거래처럼 실행 전에",
    "세금을 먼저 따져야 하는 이슈를 다룹니다.",
    "방안별 세부담을 표로 두고 비교합니다. 대표는 그 표를 보고 결정합니다.",
  ],
  "valuation": [
    "비상장주식, 투자유치, 승계, 합병 비율 판단에 필요한 평가를 다룹니다.",
    "세법 기준과 거래 기준은 다릅니다.",
    "둘을 구분해, 누가 봐도 같은 결론이 나오는 보고서로 남깁니다.",
  ],
  "transaction-advisory": [
    "매수·매도 실사에서 우발부채와 정상화 조정을 찾고,",
    "거래 구조별 세무·회계 함의를 정리합니다.",
    "딜 전에 짚어둘 항목과 협상에서 부딪힐 쟁점을 문서로 묶어둡니다.",
  ],
  "audit-advisory": [
    "감사인이 확인할 회계처리, 결산 자료, 내부통제 이슈를 미리 점검합니다.",
    "자료 준비 기준을 잡아 감사 과정의 반복 질의를 줄입니다.",
  ],
};

import { siteConfig } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";
import PromoMotion from "@/components/home/promo-motion";
import SchedulePopup from "@/components/home/schedule-popup";
import AboutOpening from "@/components/about/about-opening";
import PromiseStage from "@/components/about/promise-stage";
import KeepList from "@/components/about/keep-list";
import PrincipalUnfold from "@/components/home/principal-unfold";
import DashboardPeek from "@/components/home/dashboard-peek";
import Wordmark from "@/components/brand/wordmark";

/* 이번 분기 주요 일정. 들어오면 팝업으로 뜬다.
   D-day 는 적지 않는다. 적어두면 하루만 지나도 틀린 숫자가 화면에 남는다.
   날짜만 두고, 남은 날은 볼 때마다 계산한다. */
const SCHEDULE_DATES = [
  { what: "원천세 납부", when: "2026-09-10" },
  { what: "원천세 납부", when: "2026-10-10" },
  { what: "부가세 2기 예정신고", when: "2026-10-25" },
  { what: "부가세 2기 확정신고", when: "2027-01-25" },
];
import "./promo.css";

export const metadata: Metadata = {
  title: "기준이 되는 세무회계",
  description:
    "메리디안은 회계사가 직접 책임집니다. 자주 듣는 이야기와 저희가 드리는 약속, 그리고 회사 전용 세무 대시보드까지.",
};

/* 홈. 대시보드 이야기는 /portal 로 옮겼다 — 여기서는 배너 하나로만 건넨다.
   순서: 히어로(지구본) → 약속 → 자주 듣는 이야기 → 선언문 →
        대시보드 배너 → 하는 일 → 대표 회계사 → 인사이트 → 상담 */
export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="promo">
      <PromoMotion />
      <SchedulePopup items={SCHEDULE_DATES} trigger="schedOpen" />

      {/* 우측 앵커. 선과 빈 원. 원하는 데만 보고 갈 수 있게. */}
      <nav className="anchor" id="anchor" aria-label="구역 바로가기">
        <a href="#top" data-sec="top"><span className="lb">메리디안</span><span className="cir"></span></a>
        <a href="#promise" data-sec="promise"><span className="lb">약속</span><span className="cir"></span></a>
        <a href="#creed" data-sec="creed"><span className="lb">우리의 생각</span><span className="cir"></span></a>
        <a href="#why" data-sec="why"><span className="lb">자주 듣는 이야기</span><span className="cir"></span></a>
        <a href="#keep" data-sec="keep"><span className="lb">지켜가는 방식</span><span className="cir"></span></a>
        <a href="#portal" data-sec="portal"><span className="lb">대시보드</span><span className="cir"></span></a>
        <a href="#svc" data-sec="svc"><span className="lb">하는 일</span><span className="cir"></span></a>
        <a href="#vs" data-sec="vs"><span className="lb">무엇이 다른가</span><span className="cir"></span></a>
        <a href="#who" data-sec="who"><span className="lb">대표 회계사</span><span className="cir"></span></a>
        <a href="#insight" data-sec="insight"><span className="lb">인사이트</span><span className="cir"></span></a>
        <a href="#end" data-sec="end"><span className="lb">상담</span><span className="cir"></span></a>
      </nav>

      <div id="top">

      {/* 1. 첫 화면. ABOUT 의 지구본 세 장면을 그대로 홈의 히어로로 쓴다.
          검정이 헤더 뒤까지 올라가도록 컴포넌트가 스스로 위로 당긴다. */}
      <AboutOpening />

      {/* 2. 메리디안의 약속. ABOUT 에 있던 한 무대를 그대로 가져왔다.
          대화가 한 마디씩 오르고, 다 듣고 나면 좌우로 날아가 사라진다.
          비워진 그 자리에 약속 두 개가 천천히 올라온다. */}
      <section id="promise" className="promise-sec invert promise-dark">
        <div className="wrap">
          {/* 제목을 무대 안으로 넣는다. 무대가 화면에 붙어 있는 동안 제목만
              위로 흘러 나가면, 지금 보는 대화가 무엇인지 알 수 없다. */}
          <PromiseStage
            head={
              <>
                <p className="tick">Our Promise</p>
                <h2 className="sec">메리디안의 약속<span className="dot-b">.</span></h2>
                <p className="lede">사업주분들이 세무대리인과 관련해 흔히 하시는 이야기입니다.</p>
              </>
            }
          />
        </div>
      </section>

      {/* 3. 선언문. 메리디안의 본업이 무엇인지. */}
      <section className="creed invert" id="creed">
        <div className="wrap">
          <p className="creed-q rise">
            <span className="c">세금은 <em>&lsquo;내는 것&rsquo;</em>이 아니라</span><span className="c"><em>&lsquo;설계하는 것&rsquo;</em>입니다<span className="dot-b">.</span></span>
          </p>
          <p className="creed-a rise">
            <span className="s">매일의 기장이 검토가 되고, 검토가 자문이 되고,</span><span className="s">자문이 다음 결정의 근거가 됩니다.</span><span className="s">그 흐름을 끊지 않는 일이 메리디안의 본업입니다.</span>
          </p>
          {/* 배너 CTA 를 없애고 그 버튼을 여기로 옮겼다. 글은 왼쪽, 버튼만 가운데. */}
          <div className="creed-cta rise">
            <a className="btn btn-fill" href="#end">기장 이관 상담하기</a>
          </div>
        </div>
      </section>

      {/* 4. 지켜가는 방식 셋. 선언 다음에 「그래서 어떻게 지키느냐」가 온다.
          ABOUT 에 있던 것을 홈에도 둔다 — 홈만 보는 사람이 제일 많다. */}
      <section id="keep">
        <div className="wrap">
          <p className="tick rise">How we keep it</p>
          <h2 className="sec rise"><span className="c">메리디안이 기준점을</span><span className="c">지켜가는 방식<span className="dot-b">.</span></span></h2>
          <div className="rise" style={{'marginTop': 'var(--s5)'}}>
            <KeepList />
          </div>
        </div>
      </section>

      {/* 5. 문제 (반전) */}
      <section className="pin invert" id="why" style={{'height': '520vh', 'padding': '0'}}>
        <div className="pin-inner">
          <div className="wrap">
            <p className="tick" style={{'marginBottom': 'var(--s4)'}}>자주 듣는 이야기</p>
            <div className="prog" id="prog"><i className="on"></i><i></i><i></i></div>
            <div className="slabs">
              <div className="slab on">
                {/* 질문 2줄 + 화자. 화자는 질문에 딸린 것이라 함께 커지고 작아진다. */}
                <div className="ask">
                  <p className="who">법인 대표</p>
                  <q><span className="s">월말마다 자료 보내달라는 연락을 받습니다.</span><span className="s">매번 같은 걸 찾아서 보냅니다.</span></q>
                </div>
                <p className="ans"><span className="mer">메리디안은</span><span className="c">홈택스·카드·통장을 연결해 두고</span><span className="c">매일 새벽 자동으로 모읍니다.</span></p>
              </div>
              <div className="slab">
                <div className="ask">
                  <p className="who">개인사업자</p>
                  <q><span className="c">신고서를 받았는데, 이 금액이 왜 이렇게</span><span className="c">나왔는지 물어볼 데가 없습니다.</span></q>
                </div>
                <p className="ans"><span className="mer">메리디안은</span><span className="c">대시보드에서 숫자를 누르면</span><span className="c">계산식과 건수, 원본 증빙까지 이어집니다.</span></p>
              </div>
              <div className="slab">
                <div className="ask">
                  <p className="who">성장기 법인 재무담당</p>
                  <q><span className="s">절세할 수 있었던 항목을 결산 때 알게 됩니다.</span><span className="s">그때는 이미 늦습니다.</span></q>
                </div>
                <p className="ans"><span className="mer">메리디안은</span><span className="c">매일의 기장에서 놓친 공제를</span><span className="c">먼저 잡아 알려드립니다.</span></p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. 대시보드. 길게 늘어놓던 구간은 /portal 로 옮겼다.
          여기서는 한 문장과 버튼 둘로만 건넨다. */}
      <section id="portal" className="pbanner">
        <div className="wrap">
          <div className="pb-grid">
            {/* 왼쪽: 무엇인지. 오른쪽: 그래서 어떻게 생겼는지.
                글만 두면 「대시보드」가 무슨 화면인지 끝까지 모른 채 지나간다. */}
            <div className="pb-copy">
              <p className="tick rise">기장을 맡기시면</p>
              <h2 className="sec rise">
                <span className="c">회계사가 정리한 자료를</span><span className="c">한 화면에서 봅니다<span className="dot-b">.</span></span>
              </h2>
              <p className="lede rise">
                <span className="s">홈택스·카드·통장을 매일 새벽 자동으로 모읍니다.</span><span className="s">회사 전용 세무 대시보드는 무료로 드립니다.</span>
              </p>

              {/* 화면에서 실제로 보이는 것. 설명은 빼고 이름만 한 줄로 둔다.
                  네 항목을 설명까지 붙여 세로로 쌓으면 왼쪽만 길어져
                  옆의 대시보드 그림과 높이가 안 맞는다. */}
              <ul className="pb-facts rise">
                <li>지금 내야 할 부가세</li>
                <li>오늘 들어오고 나간 돈</li>
                <li>놓칠 뻔한 공제</li>
                <li>숫자의 출처</li>
              </ul>

              <div className="hero-cta rise">
                <a
                  className="btn btn-fill"
                  href={siteConfig.clientPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  무료 대시보드 시작하기
                </a>
                <a className="btn btn-line" href="/portal">알아보기</a>
              </div>
              <p className="cta-note rise"><span className="s">기장 계약이 있으면 비용이 따로 들지 않습니다.</span><span className="s">쓰던 사무소에서 넘어오는 절차는 저희가 처리합니다.</span></p>
            </div>

            <div className="pb-shot rise">
              <DashboardPeek />
              <p className="pb-cap">실제 고객 화면 · 표시된 숫자는 예시입니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* 하는 일. 카드로 묶어 하위 페이지로. */}
      <section id="svc">
        <div className="wrap">
          <p className="tick rise">하는 일</p>
          <h2 className="sec rise">기장부터 자문까지<span className="dot-b">.</span></h2>
          <div className="svc rise">
            {services.slice(0, 6).map((service, i) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <p className="no">{String(i + 1).padStart(2, "0")}</p>
                <h3>{service.title}</h3>
                <p>{(SVC_LINES[service.slug] ?? [service.description]).map((line, k) => (
                  <span className="s" key={k}>{line}</span>
                ))}</p>
                <span className="go">자세히 →</span>
              </Link>
            ))}
          </div>
          {/* 여섯 개를 다 보고 싶은 사람에게. 카드마다 있는 「자세히 →」와
              다른 곳으로 간다 — 이건 목록 전체다. */}
          <div className="svc-cta rise">
            <a className="btn btn-line" href="/services">하는 일 자세히 보기 →</a>
          </div>
        </div>
      </section>

      {/* 비교표. 무엇이 다른지는 나란히 놓아야 보인다.
          우리 칸을 크게 잡고 파란 바탕을 깐다 — 눈이 먼저 가야 할 쪽이다. */}
      <section id="vs" className="vs-dark">
        <div className="vs-rail">
        <div className="vs-fix wrap">
          <p className="tick rise">Comparison</p>
          <h2 className="sec rise"><span className="c">누구와 준비하느냐에 따라</span><span className="c">결과는 달라집니다<span className="dot-b">.</span></span></h2>
          <div className="vs-line" aria-hidden />
          <table className="vs rise">
            <thead>
              <tr>
                <th></th>
                <th className="theirs">저가 기장 사무소</th>
                <th className="ours"><Wordmark className="vs-logo" /></th>
              </tr>
            </thead>
            <tbody>
              <tr><th>관점</th><td className="theirs">가격 경쟁력 중심</td><td className="ours">대표 본업의 시간 확보</td></tr>
              <tr><th>누가 답하나</th><td className="theirs">사무 직원</td><td className="ours">공인회계사 직접</td></tr>
              <tr><th>기술 활용</th><td className="theirs">수기 · 단순 전산</td><td className="ours">내부 AI · 업무 맞춤 자동화</td></tr>
              <tr><th>소통 방식</th><td className="theirs">담당자 연결 지연</td><td className="ours">회계사 직접 답신</td></tr>
            </tbody>
          </table>
        </div>
        </div>
      </section>

      {/* 7. 대표 회계사. ABOUT 과 겹치므로 여기서는 이름과 한 문장만 두고
          업무 영역은 스크롤이 닿을 때 한 줄씩 펼친다. */}
      <section id="who">
        <div className="wrap">
          <p className="tick rise">Principal</p>
          <PrincipalUnfold />
        </div>
      </section>

      {/* 인사이트 */}
      <section id="insight">
        <div className="wrap">
          <p className="tick rise">Our thinking</p>
          <h2 className="sec rise">최근 인사이트<span className="dot-b">.</span></h2>
          <div className="posts rise">
            {posts.slice(0, 4).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <span className="cat">{post.category}</span>
                <h3>{post.title}</h3>
                <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
              </Link>
            ))}
          </div>
          <p style={{'marginTop': 'var(--s4)', 'textAlign': 'right'}}><a href="/blog" style={{'fontSize': 'var(--t-0)', 'fontWeight': '600', 'color': 'var(--blue)', 'textDecoration': 'none'}}>모든 글 보기 →</a></p>
        </div>
      </section>

      {/* 8. 마무리 (반전) */}
      <section className="end invert" id="end" style={{'paddingBottom': 'var(--s7)'}}>
        <div className="wrap">
          <p className="tick rise">기장 이관</p>
          <h2 className="rise">우리 회사 자료로 먼저 보시고 정하셔도 됩니다<span className="dot-b">.</span></h2>
          <p className="lede rise"><span className="s">상담에서 실제 대시보드를 보여드립니다.</span><span className="s">그다음에 정하셔도 늦지 않습니다.</span></p>
          <div className="hero-cta rise" style={{'justifyContent': 'center', 'marginTop': 'var(--s5)'}}>
            <a className="btn btn-fill" href="/contact">기장 이관 상담하기</a>
            <a className="btn btn-line" href="/contact">전화로 문의</a>
          </div>
          <p className="cta-note rise" style={{'color': '#7E90AB'}}>상담은 무료입니다.</p>
        </div>
      </section>

      </div>


    </div>
  );
}
