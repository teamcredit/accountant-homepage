import Link from "next/link";
import type { Metadata } from "next";
import { services } from "@/lib/data";
import { siteConfig } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";
import PromoMotion from "@/components/home/promo-motion";
import ServiceMerge from "@/components/home/service-merge";
import SchedulePopup from "@/components/home/schedule-popup";

/* 히어로에서 팝업으로 뺀 이번 분기 일정. 한 곳에서만 고치면 되게 모아둔다. */
const SCHEDULE = [
  { what: "원천세 납부", dday: "D-31", when: "2026.09.10" },
  { what: "원천세 납부", dday: "D-61", when: "2026.10.10" },
  { what: "부가세 2기 예정신고", dday: "D-76", when: "2026.10.25" },
  { what: "부가세 2기 확정신고", dday: "D-168", when: "2027.01.25" },
];
import "./promo.css";

export const metadata: Metadata = {
  title: "회계사가 정리한 자료를 한 화면에서 보는 세무 대시보드",
  description:
    "기장을 맡기시면 회사 전용 세무 대시보드가 함께 제공됩니다. 홈택스·카드·통장 자료를 매일 자동으로 모으고, 지금 이 순간의 손익과 부가세를 봅니다.",
};

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="promo">
      <PromoMotion />
      <SchedulePopup items={SCHEDULE} asOf="2026.08.10" trigger="schedOpen" />

      {/* 우측 앵커. 선과 빈 원. 원하는 데만 보고 갈 수 있게. */}
      <nav className="anchor" id="anchor" aria-label="구역 바로가기">
        <a href="#top" data-sec="top"><span className="lb">처음</span><span className="cir"></span></a>
        <a href="#why" data-sec="why"><span className="lb">자주 듣는 이야기</span><span className="cir"></span></a>
        <a href="#feat" data-sec="feat"><span className="lb">고객 화면</span><span className="cir"></span></a>
        <a href="#evid" data-sec="evid"><span className="lb">근거</span><span className="cir"></span></a>
        <a href="#creed" data-sec="creed"><span className="lb">우리의 생각</span><span className="cir"></span></a>
        <a href="#svc" data-sec="svc"><span className="lb">하는 일</span><span className="cir"></span></a>
        <a href="#flow" data-sec="flow"><span className="lb">시작하기</span><span className="cir"></span></a>
        <a href="#vs" data-sec="vs"><span className="lb">비교</span><span className="cir"></span></a>
        <a href="#insight" data-sec="insight"><span className="lb">인사이트</span><span className="cir"></span></a>
        <a href="#end" data-sec="end"><span className="lb">상담</span><span className="cir"></span></a>
      </nav>

      <div id="top">

      {/* 1. 히어로 */}
      <section className="hero">
        {/* 글 + 모이는 화면. 다 모이고 문구가 뜰 때까지 화면에 붙잡아 둔다. */}
        <div className="hero-hold">
        <div className="wrap">
          <div className="hero-grid">
            <div>
          <p className="tick">Meridian만의 특별한 서비스</p>
          <h1><span className="c">회계사가 정리한 자료를,</span><span className="c">한 화면에서<span className="dot-b">.</span></span></h1>
          <p className="hero-sub"><span className="c">기장을 맡기시면</span><span className="c"><b>회사 전용 세무 대시보드</b>가 함께 제공됩니다.</span></p>
          <div className="hero-cta">
            <a className="btn btn-fill" href="#end">기장 이관 상담하기</a>
            {/* 헤더의 '대시보드 시작하기'와 같은 곳으로 간다. 이름도 같게 —
                같은 일을 하는 버튼은 어디서든 같은 이름이어야 한다. */}
            <a
              className="btn btn-line"
              href={siteConfig.clientPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              대시보드 시작하기
            </a>
          </div>
          <p className="cta-note"><span className="s">상담은 무료입니다.</span><span className="s">쓰던 사무소에서 넘어오는 절차는 저희가 처리합니다.</span></p>
          {/* 팝업을 닫아도 여기서 다시 연다 */}
          <button type="button" id="schedOpen" className="sched-open">
            <span className="lb">이번 분기 주요 일정</span>
            <span className="dd">원천세 D-31</span>
          </button>
            </div>

            {/* 일정표가 있던 자리. 흩어진 서비스가 한 장으로 모인다.
                일정은 팝업으로 뺐다 — 히어로의 '일정 보기' 버튼으로 다시 연다. */}
            <ServiceMerge items={services.slice(0, 6).map(s => ({ slug: s.slug, title: s.title }))} />
          </div>
        </div>
        </div>

        {/* 붙잡힌 구간을 지나면 대시보드가 이어받는다 */}
        <div className="wrap">
          <div className="stage">
            {/* 커진 네모 위에 뜨는 문구. 카드가 다 모여 대시보드가 되는 그 순간을
                말로 짚어준다. service-merge 가 스크롤에 맞춰 띄우고 물린다. */}
            <p className="svm-label" aria-hidden="true">
              <span className="s">따로 굴러다니던 일이</span>
              <span className="s">한 화면으로 모입니다.</span>
            </p>
            <div className="shot" id="shot">
              <div className="shot-win" id="shotWin">
                <div className="shot-caption" id="shotCap"></div>
                {/* 실제 홈 화면 그대로. 캡처가 아니라 요소로 그린다. */}
                <div className="db" aria-label="MERIDIAN 세무 대시보드 홈">
                  <aside className="db-side">
                    <p className="db-brand">MERIDIAN<span>TAX &amp; ADVISORY</span></p>
                    <p className="db-co">㈜메리디안 데모</p>
                    <p className="db-gr">개요</p>
                    <p className="db-mi on">홈</p>
                    <p className="db-gr">증빙</p>
                    <p className="db-mi">세금계산서</p><p className="db-mi">현금영수증</p>
                    <p className="db-mi">신용카드</p><p className="db-mi">통장</p>
                    <p className="db-gr">장부·신고</p>
                    <p className="db-mi">분개·전표</p><p className="db-mi">재무제표</p><p className="db-mi">부가세 리포트</p>
                    <p className="db-gr">인건비</p>
                    <p className="db-mi">급여 입력</p><p className="db-mi">임직원 관리</p>
                  </aside>

                  <div className="db-main">
                    <header className="db-bar">
                      <span className="db-pick"><i></i>㈜메리디안 데모</span>
                      <span className="db-search">거래처, 금액, 증빙 검색<b>⌘K</b></span>
                      <span className="db-live"><i></i>반영 08-10 03:35</span>
                    </header>

                    <div className="db-body">
                      <p className="db-eyebrow">종합 현황</p>
                      <div className="db-h1row">
                        <h3>한눈에 보는 우리 회사</h3>
                        <div className="db-seg"><span className="on">최근 반영월</span><span>올해</span><span>지난분기</span><span>이번분기</span><span>지난달</span><span>이번달</span></div>
                      </div>
                      <p className="db-tagline"><b>2026년 7월 확정자료</b> 국세청 수집자료 기준</p>

                      <section className="db-card" data-hs="cash">
                        <p className="db-ey">TODAY CASH</p>
                        <p className="db-ct">오늘 현금 현황</p>
                        <p className="db-cs">최종 통장 업로드 08. 09. 03:35 · 2026-08 기준</p>
                        <div className="db-cells">
                          <div><p className="k">오늘 입금</p><p className="v num up">0원</p></div>
                          <div><p className="k">오늘 출금</p><p className="v num dn">0원</p></div>
                          <div><p className="k">이번 달 순현금</p><p className="v num up">0원</p></div>
                          <div><p className="k">미처리</p><p className="v num">0건</p><p className="m">0원</p></div>
                          <div><p className="k">기한 지난 미수</p><p className="v num">0원</p><p className="m">0건</p></div>
                          <div><p className="k">기한 지난 미지급</p><p className="v num">18,240,000원</p><p className="m">12건</p></div>
                        </div>
                      </section>

                      <div className="db-row3" data-hs="alert">
                        <div className="db-card sm"><p className="k2">다음 부가세 신고</p><p className="v2">2기 예정 신고 · D-76</p><p className="m2">부가세 리포트에서 예상액 확인 →</p></div>
                        <div className="db-card sm"><p className="k2">불공제 후보</p><p className="v2">4건 · 매입세액 1,240,000원 검토</p><p className="m2">리스트 펼치기 ▾</p></div>
                        <div className="db-card sm"><p className="k2">카드 자료</p><p className="v2">2026년 7월까지 반영</p><p className="m2">정상 반영 중 ✓</p></div>
                      </div>

                      <div className="db-row2">
                        <div className="db-vat" data-hs="vat">
                          <p className="k3">납부 예상 부가세 <span>2026년 7월 기준</span></p>
                          <p className="v3 num">6,351,500<em>원</em></p>
                          <p className="m3"><b>납부 예상</b> 매출세액 18,492,000원 &nbsp; 공제 매입세액 12,140,500원</p>
                        </div>
                        <div className="db-card" data-hs="trend">
                          <p className="k2">월별 추이</p>
                          <div className="ui-bars sm">
                            <div className="bg"><span className="b now" style={{'--h': '96%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '22%'} as React.CSSProperties}></span><i>1월</i></div>
                            <div className="bg"><span className="b now" style={{'--h': '8%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '8%'} as React.CSSProperties}></span><i>2월</i></div>
                            <div className="bg"><span className="b now" style={{'--h': '9%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '10%'} as React.CSSProperties}></span><i>3월</i></div>
                            <div className="bg"><span className="b now" style={{'--h': '18%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '12%'} as React.CSSProperties}></span><i>4월</i></div>
                            <div className="bg"><span className="b now" style={{'--h': '11%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '22%'} as React.CSSProperties}></span><i>5월</i></div>
                            <div className="bg"><span className="b now" style={{'--h': '14%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '16%'} as React.CSSProperties}></span><i>6월</i></div>
                          </div>
                          <p className="m2">최근 6개월 합계 — 매출 512,880,000원 · 매입 349,610,000원 · 차익 <b className="up">+163,270,000원</b></p>
                        </div>
                      </div>

                      <div className="db-row2" data-hs="sum">
                        <div className="db-card"><p className="k2">매출 합계</p><p className="v4 num">184,920,000원</p>
                          <p className="m2">주요 매출처</p>
                          <p className="li"><span>1 ㈜대성물산</span><span className="num">184,920,000원</span></p></div>
                        <div className="db-card"><p className="k2">매입 합계</p><p className="v4 num">121,405,000원</p>
                          <p className="m2">주요 매입처</p>
                          <p className="li"><span>1 원자재 공급 — A사</span><span className="num">58,310,000원</span></p></div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                {/* 대시보드 위 그 자리에서 조각이 하나씩 확대된다 */}
                <figure className="hotspot" data-at="0.08" style={{'--fx': '0%', '--fy': '-30%'} as React.CSSProperties}><figcaption className="say">통장까지 붙어서, <b>오늘 돈이 어떻게 도는지</b> 바로 보입니다</figcaption><div className="hs-in">
                    <p className="db-ey">TODAY CASH</p>
                    <p className="db-ct">오늘 현금 현황</p>
                    <div className="db-cells" style={{'gridTemplateColumns': 'repeat(3,1fr)'}}>
                      <div><p className="k">이번 달 순현금</p><p className="v num up">0원</p></div>
                      <div><p className="k">기한 지난 미수</p><p className="v num">0원</p><p className="m">0건</p></div>
                      <div><p className="k">기한 지난 미지급</p><p className="v num">18,240,000원</p><p className="m">12건</p></div>
                    </div>
                  </div></figure>
                <figure className="hotspot" data-at="0.32" style={{'--fx': '0%', '--fy': '-8%'} as React.CSSProperties}><figcaption className="say">낼 세금과 <b>놓칠 뻔한 것</b>을 미리 짚어줍니다</figcaption><div className="hs-in">
                    <p className="ui-lab" style={{'color': 'var(--blue)', 'fontWeight': '800'}}>다음 부가세 신고</p>
                    <p className="v2" style={{'fontSize': '26px'}}>2기 예정 신고 · D-76</p>
                    <p className="m2">부가세 리포트에서 예상액 확인 →</p>
                    <p className="ui-lab" style={{'color': 'var(--blue)', 'fontWeight': '800', 'marginTop': 'var(--s5)'}}>불공제 후보</p>
                    <p className="v2" style={{'fontSize': '26px'}}>4건 · 매입세액 1,240,000원</p>
                    <p className="m2">회계사가 먼저 걸러 알려드립니다.</p>
                  </div></figure>
                <figure className="hotspot" data-at="0.56" style={{'--fx': '-28%', '--fy': '20%'} as React.CSSProperties}>
                  <figcaption className="say">신고 전에 <b>낼 금액</b>이 이미 나와 있습니다</figcaption>
                  <div className="hs-in vat">
                    <p className="vat-lab">납부 예상 부가세 <span>2026년 7월 기준</span></p>
                    <p className="vat-big num">6,351,500<em>원</em></p>
                    <div className="vat-calc">
                      <span><i>매출세액</i><b className="num">18,492,000원</b></span>
                      <span className="op">−</span>
                      <span><i>공제 매입세액</i><b className="num">12,140,500원</b></span>
                    </div>
                    <p className="vat-note">확정 신고 전 잠정치입니다. 불공제 후보 4건은 아직 빼지 않았습니다.</p>
                  </div>
                </figure>
                <figure className="hotspot" data-at="0.82" style={{'--fx': '26%', '--fy': '20%'} as React.CSSProperties}><figcaption className="say"><b>여섯 달 흐름</b>이 막대 하나로 보입니다</figcaption><div className="hs-in">
                    <p className="k2">월별 추이</p>
                    <div className="ui-bars">
                      <div className="bg"><span className="b now" style={{'--h': '96%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '22%'} as React.CSSProperties}></span><i>1월</i></div>
                      <div className="bg"><span className="b now" style={{'--h': '8%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '8%'} as React.CSSProperties}></span><i>2월</i></div>
                      <div className="bg"><span className="b now" style={{'--h': '9%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '10%'} as React.CSSProperties}></span><i>3월</i></div>
                      <div className="bg"><span className="b now" style={{'--h': '18%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '12%'} as React.CSSProperties}></span><i>4월</i></div>
                      <div className="bg"><span className="b now" style={{'--h': '11%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '22%'} as React.CSSProperties}></span><i>5월</i></div>
                      <div className="bg"><span className="b now" style={{'--h': '14%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '16%'} as React.CSSProperties}></span><i>6월</i></div>
                    </div>
                    <p className="m2" style={{'marginTop': 'var(--s5)'}}>최근 6개월 — 매출 512,880,000원 · 매입 349,610,000원 · 차익 <b className="up">+163,270,000원</b></p>
                  </div></figure>
              </div>
            </div>
          </div>
      </section>

      {/* 2. 지표 띠 */}
      <section id="stats"><div className="stats-rail"><div className="stats-fix wrap">
        <p className="tick rise">기장을 맡기면</p>
        <h2 className="sec rise">이만큼이 자동으로 따라옵니다<span className="dot-b">.</span></h2>
        <div className="stats rise">
          <div className="stat"><b className="num">매일</b><span>홈택스·카드·통장 자동 수집</span></div>
          <div className="stat"><b className="num">30<em>종</em></b><span>서식 자동 채움</span></div>
          <div className="stat"><b className="num">19<em>종</em></b><span>민원증명 안내</span></div>
          <div className="stat"><b className="num">0<em>건</em></b><span>대표님이 찾아 보낼 자료</span></div>
        </div>
      </div></div></section>

      {/* 3. 문제 (반전) */}
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
                <p className="ans"><span className="mer">메리디안은</span><span className="c">숫자를 누르면 계산식과 건수,</span><span className="c">원본 증빙까지 이어집니다.</span></p>
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

      {/* 4. 기능 : 왼쪽 누르면 오른쪽 실제 화면이 바뀐다 */}
      <section id="feat">

        <div className="feat-rail">
          <div className="feat-fix wrap">
            <div className="feat-copy">
              {/* 이 구간의 히어로. 카드 왼쪽에 고정으로 남는다. */}
              <div className="feat-hero">
                <p className="tick">고객 화면</p>
                <h2 className="sec">신고 때까지<br className="brk" />기다리지 않아도 됩니다<span className="dot-b">.</span></h2>
              </div>
              <div className="feat-slots">
              <article className="fc on">
                <p className="no">01</p><h3>이번 달, 얼마 벌었나</h3>
                <p><span className="c">확정 전이라도</span><span className="c">지금까지 모인 자료로 계산합니다.</span><span className="c">마진율과 전년 대비 증감이 같이 나옵니다.</span></p>
              </article>
              <article className="fc">
                <p className="no">02</p><h3>작년 같은 기간과 나란히</h3>
                <p><span className="s">매출·매입·손익을 한 표에 놓습니다.</span><span className="s">차이와 증감률까지 같이 봅니다.</span></p>
              </article>
              <article className="fc">
                <p className="no">03</p><h3>올해와 작년을 겹쳐서</h3>
                <p>계절을 타는 업종이라면 이 막대 하나로 흐름이 보입니다.</p>
              </article>
              <article className="fc">
                <p className="no">04</p><h3>어디까지 반영됐는지</h3>
                <p><span className="s">카드 매입은 청구 시차가 있습니다.</span><span className="s">숨기지 않고 며칠까지인지 적어둡니다.</span></p>
              </article>
              <article className="fc">
                <p className="no">05</p><h3>어디에 얼마를 쓰나</h3>
                <p><span className="s">증빙 유형별 구성과 상위 지출처.</span><span className="s">비율로 한눈에 봅니다.</span></p>
              </article>
              <article className="fc">
                <p className="no">06</p><h3>놓칠 뻔한 것</h3>
                <p>불공제 후보, 갑자기 늘어난 매입처, 고액 1회성 지출을 먼저 짚어줍니다.</p>
              </article>
              </div>
              <div className="fdots" id="fdots"><i className="on"></i><i></i><i></i><i></i><i></i><i></i></div>
            </div>

            <div className="deck" id="deck">

                {/* 01 이번 달 손익 */}
                <div className="fpane on">
                  <p className="ui-lab">잠정 손익 <span>2026년 7월 기준</span></p>
                  <p className="ui-big num">98,750,000<em>원</em></p>
                  <p className="ui-sub"><b className="pill up">흑자 +57.7%</b> 전년 동기 6,260만원 → <b>9,875만원</b></p>
                  <p className="ui-foot">마진율 <b>11.1%</b> · 전년 7.9% · <b className="up">+3.2%p</b></p>
                </div>

                {/* 02 전년 동기 비교 */}
                <div className="fpane">
                  <table className="ui-tb">
                    <thead><tr><th></th><th>이번 기간</th><th>전년 동기</th><th>증감률</th></tr></thead>
                    <tbody>
                      <tr><th>매출</th><td className="num">892,400,000</td><td className="num">796,800,000</td><td className="num up">+12.0%</td></tr>
                      <tr><th>매입</th><td className="num">793,650,000</td><td className="num">734,200,000</td><td className="num dn">+8.1%</td></tr>
                      <tr className="tot"><th>손익</th><td className="num">98,750,000</td><td className="num">62,600,000</td><td className="num up">+57.7%</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 03 월별 추이 */}
                <div className="fpane">
                  <p className="ui-lab">월별 매출 · 2026 vs 2025</p>
                  <div className="ui-bars">
                    <div className="bg"><span className="b now" style={{'--h': '74%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '62%'} as React.CSSProperties}></span><i>1월</i></div>
                    <div className="bg"><span className="b now" style={{'--h': '86%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '70%'} as React.CSSProperties}></span><i>2월</i></div>
                    <div className="bg"><span className="b now" style={{'--h': '96%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '84%'} as React.CSSProperties}></span><i>3월</i></div>
                    <div className="bg"><span className="b now" style={{'--h': '88%'} as React.CSSProperties}></span><span className="b old" style={{'--h': '86%'} as React.CSSProperties}></span><i>4월</i></div>
                  </div>
                  <p className="ui-foot"><b className="sw now"></b> 2026 &nbsp; <b className="sw old"></b> 2025</p>
                </div>

                {/* 04 자료 반영 상태 */}
                <div className="fpane">
                  <p className="ui-lab">데이터 반영 상태</p>
                  <div className="ui-cols">
                    <div><p className="k">세금계산서</p><p className="v num">2026-04-07</p><p className="m"><b className="ok">정상</b> 최근 7일 24건</p></div>
                    <div><p className="k">현금영수증</p><p className="v num">2026-04-07</p><p className="m"><b className="ok">정상</b> 최근 7일 11건</p></div>
                    <div><p className="k">신용카드</p><p className="v num">2026-03-25</p><p className="m"><b className="warn">확인 필요</b> 청구 시차 D-13</p></div>
                  </div>
                </div>

                {/* 05 지출 구조 */}
                <div className="fpane">
                  <p className="ui-lab">증빙 유형 믹스</p>
                  <div className="ui-mix">
                    <div><span className="k">세금계산서</span><span className="v num">517,400,000원</span><span className="bar" style={{'--p': '65.2%'} as React.CSSProperties}></span><span className="m">전체 매입의 65.2%</span></div>
                    <div><span className="k">신용카드</span><span className="v num">191,300,000원</span><span className="bar" style={{'--p': '24.1%'} as React.CSSProperties}></span><span className="m">전체 매입의 24.1%</span></div>
                    <div><span className="k">현금영수증</span><span className="v num">84,950,000원</span><span className="bar" style={{'--p': '10.7%'} as React.CSSProperties}></span><span className="m">전체 매입의 10.7%</span></div>
                  </div>
                </div>

                {/* 06 주의 항목 */}
                <div className="fpane">
                  <p className="ui-lab">주의 항목</p>
                  <ul className="ui-list">
                    <li><span className="k">법인카드 — 대형마트</span><span className="m">불공제 상위 · 카드 8건</span><span className="v num">3,240,000원</span></li>
                    <li><span className="k">원자재 공급 — A사</span><span className="m">급증 매입처 · 평균 대비 2.4배</span><span className="v num">84,200,000원</span></li>
                    <li><span className="k">설비 도입 — 정밀가공기</span><span className="m">고액 1회성 · 2026-02-14</span><span className="v num">48,500,000원</span></li>
                  </ul>
                </div>
            </div>
          </div>
        </div>
      </section>


      {/* 지원 기능. 카드가 흩어져 있다가 한 화면으로 모인다. */}
      <section id="menu">
        <div className="gather" id="gather">
          <div className="gather-in wrap">
            <div className="gather-head">
              <p className="tick">대시보드에서 되는 일</p>
              <h2 className="sec"><span className="c">흩어져 있던 정보가</span><span className="c">한 곳으로 모입니다<span className="dot-b">.</span></span></h2>
              <p className="lede"><span className="s">증빙부터 장부, 인건비, 서식까지.</span><span className="s">따로 챙기던 것을 한 화면에서 봅니다.</span></p>
            </div>
            <div className="gather-grid">
            <article className="gc" data-g="증빙"><span className="gk">증빙</span><b>세금계산서</b><p>주고받은 계산서를 한 표에서</p></article>
            <article className="gc" data-g="증빙"><span className="gk">증빙</span><b>현금영수증</b><p>발행·수취 내역 자동 수집</p></article>
            <article className="gc" data-g="증빙"><span className="gk">증빙</span><b>신용카드</b><p>사업용 카드 승인 내역</p></article>
            <article className="gc" data-g="증빙"><span className="gk">증빙</span><b>통장</b><p>입출금을 증빙과 짝지어</p></article>
            <article className="gc" data-g="장부"><span className="gk">장부·신고</span><b>분개·전표</b><p>거래를 장부 형태로 확정</p></article>
            <article className="gc" data-g="장부"><span className="gk">장부·신고</span><b>재무제표</b><p>시산표·총계정원장 표준 서식</p></article>
            <article className="gc" data-g="장부"><span className="gk">장부·신고</span><b>부가세 리포트</b><p>낼 금액을 미리</p></article>
            <article className="gc" data-g="인건비"><span className="gk">인건비</span><b>급여 입력</b><p>넣으면 세금이 자동 계산</p></article>
            <article className="gc" data-g="인건비"><span className="gk">인건비</span><b>임직원 관리</b><p>직원 명단과 4대보험</p></article>
            <article className="gc" data-g="인건비"><span className="gk">인건비</span><b>사업소득 입력</b><p>프리랜서 지급 기록</p></article>
            <article className="gc" data-g="인건비"><span className="gk">인건비</span><b>기타소득 입력</b><p>강의료 등 기타 지급</p></article>
            <article className="gc" data-g="인건비"><span className="gk">인건비</span><b>사업·기타소득자 관리</b><p>지급 대상 명단</p></article>
            <article className="gc" data-g="서식"><span className="gk">서식·증명</span><b>서식자료</b><p>30종을 회사 정보 채워서</p></article>
            <article className="gc" data-g="서식"><span className="gk">서식·증명</span><b>민원증명</b><p>19종 발급 안내</p></article>
            <article className="gc" data-g="시스템"><span className="gk">시스템</span><b>설정</b><p>팀 권한과 알림</p></article>
            </div>
          </div>
        </div>
      </section>




      {/* 5. 근거 */}
      <section id="evid" style={{'background': 'var(--w-2)'}}>
        <div className="wrap">
          <p className="tick rise">숫자를 누르면</p>
          <h2 className="sec rise">그 숫자가 어디서 왔는지 나옵니다<span className="dot-b">.</span></h2>
          <p className="lede rise"><span className="s">합계만 보여주고 끝내지 않습니다.</span><span className="s">계산식과 집계 건수, 원본 증빙까지 이어집니다.</span></p>

          <div className="panel rise" style={{'background': 'var(--w)'}}>
            <div className="tabs" role="tablist" aria-label="기간">
              <button className="tab" role="tab" aria-selected="true" data-p="m">이번 달</button>
              <button className="tab" role="tab" aria-selected="false" data-p="l">지난달</button>
              <button className="tab" role="tab" aria-selected="false" data-p="q">이번 분기</button>
              <button className="tab" role="tab" aria-selected="false" data-p="y">올해</button>
            </div>
            <div className="kpis">
              <button className="kpi" aria-expanded="true" data-k="0"><span className="lab">매출 합계</span>
                <span className="val num" data-m="184,920,000" data-l="171,340,000" data-q="512,880,000" data-y="1,946,220,000">184,920,000</span>
                <span className="cmp" data-m="전년 동월 +12.3%" data-l="전년 동월 +8.1%" data-q="전년 동기 +10.4%" data-y="전년 +14.2%">전년 동월 +12.3%</span></button>
              <button className="kpi" aria-expanded="false" data-k="1"><span className="lab">매입 합계</span>
                <span className="val num" data-m="121,405,000" data-l="118,220,000" data-q="349,610,000" data-y="1,332,880,000">121,405,000</span>
                <span className="cmp dn" data-m="전년 동월 +4.8%" data-l="전년 동월 +3.2%" data-q="전년 동기 +5.1%" data-y="전년 +6.0%">전년 동월 +4.8%</span></button>
              <button className="kpi" aria-expanded="false" data-k="2"><span className="lab">잠정 손익</span>
                <span className="val num" data-m="63,515,000" data-l="53,120,000" data-q="163,270,000" data-y="613,340,000">63,515,000</span>
                <span className="cmp" data-m="전년 동월 +28.7%" data-l="전년 동월 +19.4%" data-q="전년 동기 +23.9%" data-y="전년 +31.1%">전년 동월 +28.7%</span></button>
              <button className="kpi" aria-expanded="false" data-k="3"><span className="lab">부가세 예상</span>
                <span className="val num" data-m="6,351,500" data-l="5,312,000" data-q="16,327,000" data-y="61,334,000">6,351,500</span>
                <span className="cmp" data-m="불공제 후보 4건" data-l="불공제 후보 2건" data-q="불공제 후보 9건" data-y="불공제 후보 27건">불공제 후보 4건</span></button>
            </div>
            <div className="evid">
              <div><h4>계산식</h4><div className="formula" id="f-form"></div><p className="evid-note">실제 화면에서는 여기서 원장으로 바로 넘어갑니다.</p></div>
              <div><h4 id="f-rowtitle">이 금액을 만든 거래처</h4><p className="rnote" id="f-rownote">318건을 합친 값입니다</p><div className="rows" id="f-rows"></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 배너 CTA. 본문을 한 번 끊고 지나간다. */}
      <div className="wrap">
        <div className="band-cta rise">
          <div>
            <h3>지금 기장 상황부터 점검해 드립니다<span className="dot-b">.</span></h3>
            <p>어디가 새는지, 무엇이 늦는지 먼저 봅니다.</p>
          </div>
          <a className="btn btn-fill" href="#end">기장 이관 상담하기</a>
        </div>
      </div>

      {/* 선언문. 메리디안의 본업이 무엇인지. */}
      <section className="creed invert" id="creed">
        <div className="wrap">
          <p className="creed-q rise">
            <span className="c">세금은 <em>&lsquo;내는 것&rsquo;</em>이 아니라</span><span className="c"><em>&lsquo;설계하는 것&rsquo;</em>입니다<span className="dot-b">.</span></span>
          </p>
          <p className="creed-a rise">
            <span className="s">매일의 기장이 검토가 되고, 검토가 자문이 되고,</span><span className="s">자문이 다음 결정의 근거가 됩니다.</span><span className="s">그 흐름을 끊지 않는 일이 메리디안의 본업입니다.</span>
          </p>
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
                <p>{service.description}</p>
                <span className="go">자세히 →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 흐름 */}
      <section id="flow">
        <div className="wrap">
          <p className="tick rise">시작하기</p>
          <h2 className="sec rise">대표님이 하실 일은<br className="brk" />서류 한 장입니다<span className="dot-b">.</span></h2>
          <div className="flow rise">
            <div className="step"><h3>상담</h3><p><span className="s">지금 상황과 필요한 것을 듣습니다.</span><span className="s">비용도 이때 확정합니다.</span></p></div>
            <div className="step"><h3>이관 동의</h3><p><span className="s">서류 한 장이면 됩니다.</span><span className="s">나머지 절차는 저희가 처리합니다.</span></p></div>
            <div className="step"><h3>자료 연결</h3><p><span className="s">홈택스와 카드, 통장을 연결합니다.</span><span className="s">과거 자료도 가져옵니다.</span></p></div>
            <div className="step"><h3>화면 열림</h3><p>다음 날부터 대시보드에서 우리 회사 숫자를 봅니다.</p></div>
          </div>
        </div>
      </section>

      {/* 7. 비교 */}
      <section id="vs" style={{'background': 'var(--w-2)'}}>
        <div className="vs-rail">
        <div className="vs-fix wrap">
          <p className="tick rise">무엇이 다른가</p>
          <h2 className="sec rise">같은 기장인데<br className="brk" />결과가 다른 이유<span className="dot-b">.</span></h2>
          <table className="vs rise">
            <thead><tr><th></th><th className="theirs">보통의 세무사무소</th><th className="ours"><span className="vs-brand"><img src="/meridian-logo.png" alt="" />MERIDIAN</span></th></tr></thead>
            <tbody>
              <tr><th>자료 전달</th><td className="theirs">월말마다 대표님이 모아서 보냄</td><td className="ours"><strong>매일 자동 수집.</strong> 보낼 것이 없음</td></tr>
              <tr><th>숫자 확인</th><td className="theirs">신고 끝나고 결과만 받음</td><td className="ours"><strong>지금 이 순간</strong>의 손익과 부가세</td></tr>
              <tr><th>근거</th><td className="theirs">왜 이 금액인지 물어봐야 함</td><td className="ours">숫자를 누르면 <strong>계산식과 원본</strong></td></tr>
              <tr><th>자료 기준 시점</th><td className="theirs">언제까지 반영됐는지 모름</td><td className="ours">화면마다 <strong>기준 시각 표시</strong></td></tr>
              <tr><th>같은 판단 반복</th><td className="theirs">매달 다시 물어봄</td><td className="ours">한 번 확정하면 <strong>규칙으로 학습</strong></td></tr>
            </tbody>
          </table>
        </div>
        </div>
      </section>

      {/* 대표 회계사. 원본 구조 그대로: 좌 사진 / 우 이름·문장·업무영역 2열 */}
      <section id="who">
        <div className="wrap">
          <p className="tick rise">Principal</p>
          <div className="who-grid">
            <div className="shot-frame rise-slow"><img src="/images/profile-chest.jpg" alt="박민상 공인회계사" /></div>
            <div className="rise-slow" style={{'--delay': '.18s'} as React.CSSProperties}>
              <p className="wname">박민상<span className="dot-b">.</span></p>
              <p className="wrole">공인회계사 · Founder · KICPA</p>

              <p className="wsay"><span className="s">장부 한 줄을 어떻게 적느냐가 다음 결정의 근거가 됩니다.</span><span className="s">계정 분류 하나, 증빙 하나도 그 무게로 다룹니다.</span></p>
              <p className="wsay2"><span className="s">그래서 장부가 곧 자료입니다.</span><span className="s"><b>대표가 다음 결정을 내릴 때 펼쳐 보는 자료.</b></span></p>

              <div className="wpa">
                <p className="wpa-lab">Practice Areas</p>
                <ul>
                  <li>세무 기장 · 세무 신고</li>
                  <li>법인세 · 소득세 세무 조정</li>
                  <li>비상장주식 가치평가</li>
                  <li>M&amp;A 재무실사 (FDD)</li>
                  <li>IPO 사전 회계 정비 · K-IFRS 전환</li>
                  <li>가치평가 모델링 (DCF · 시장접근법 · 자산접근법 · 파생상품)</li>
                </ul>
              </div>

              <a className="wmore" href="/about">프로필 전체 보기 →</a>
            </div>
          </div>
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
          <p style={{'marginTop': 'var(--s4)'}}><a href="/blog" style={{'fontSize': 'var(--t-0)', 'fontWeight': '600', 'color': 'var(--blue)', 'textDecoration': 'none'}}>모든 글 보기 →</a></p>
        </div>
      </section>

      {/* 8. 마무리 (반전) */}
      <section className="end invert" id="end" style={{'paddingBottom': 'var(--s7)'}}>
        <div className="wrap">
          <p className="tick rise">기장 이관</p>
          <h2 className="rise">우리 회사 자료로 먼저 보시고 정하셔도 됩니다<span className="dot-b">.</span></h2>
          <p className="lede rise"><span className="s">상담에서 실제 화면을 보여드립니다.</span><span className="s">그다음에 정하셔도 늦지 않습니다.</span></p>
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
