# Codex 독립 검토 — Fable 결과 열람 전 기록

검토 기준: feat/menu-ia / 9b6f13c4ab9cb82c1894be684c354395cfd72f49, 2026-09-11. 애플리케이션 코드는 수정하지 않음. 사용자 소유 untracked prototypes/ 제외.

판정: Next App Router / 정적 콘텐츠 / 소규모 Route Handler 구조는 적합하다. 전면 rewrite 근거 없음. 외관과 기본 페이지 동작은 완성도가 있으나 production 문의 전환과 신뢰성 기준 미달. 스크롤·내비게이션·문의 모듈을 국소적으로 재설계하고 핵심 테스트와 운영 체계를 추가한다.

## 직접 재현한 결함

1. P1 문의 메일 실패가 성공으로 반환: src/app/api/contact/route.ts:476. 설치된 Resend SDK에 fetch 403 모의 응답을 넣으면 throw가 아닌 {data:null,error} 반환. 동일 조건 route.POST는 HTTP 200 {success:true}. 외부 발송 없이 재현. 에러 값 확인, provider ID 검증, 성공/거절/timeout 회귀 테스트 필요.
2. P1 의존성 업데이트 필요: npm audit 11 패키지 경고 (critical 1 high 6 moderate 3 low 1). next16.2.4, postcss override8.5.10, sharp 영향. 전부 원격 악용 가능하다는 뜻 아님. Vercel 환경과 허용 image sources 기준 적용성 확인. npm audit 제안 next16.3.4, 공식 Next AVIF advisory는16.3.3 패치 명시. 현재 CI supply-chain gate 실패.
3. P1 개인정보 처리 고지/정책 경로 없음. /privacy404, 폼은 이름 이메일 전화 메시지 수집, Resend 및 Upstash로 전송. 법적 근거, 수집목적/보유기간/처리주체/위탁·국외이전 요건 검토하고 실제 데이터흐름에 맞는 고지와 필요 동의 증적 구현. 무조건 checkbox만 추가하는 제안 아님.
4. P1 실제 신고일정 오류: constants.ts225, portal/page.tsx12에2026-10-10,10-25. 국세청2026년10월 공식 표는10-12,10-26. 날짜2벌, 분기 범위 불일치, 과거 날짜로 fallback, 사용자 로컬 TZ 및 자정 갱신 없음. 승인된 일정 데이터 단일화+서울시간+만료 상태.
5. P2 견적·서비스→문의 context 유실: calculator.tsx181 및 services/[slug]/page.tsx367이 type/bottleneck/output 전달, contact/page.tsx24,56는 message만 읽음. 실제 상담 신청 클릭 후 현재 상황 빈 문자열. 견적 상태도 안 실림. typed InquiryDraft/짧은 ID 또는 세션 draft로 연결.
6. P2 공유 견적 중복 과금: pricing.ts812 deserialize addons 중복 제거 안 함,455 summation 반복. addons=monthlyReport 중복 한번/두번 월150000/220000 재현. 일반 UI는 중복 안 만들지만 URL은 입력 경계. Set 정규화, bounds, version, 도메인 검증.
7. P2 데스크톱 하위 메뉴 키보드 접근 실패: site-nav.tsx120 onBlur가 닫기 예약하고 MegaPanel은 sibling. SERVICE focus ArrowDown 후 Tab → PEOPLE focus, panel false. trigger focus handoff/공통 blur boundary/aria-controls/테스트 필요.
8. P2 모바일 dialog focus 외부로 탈출: header.tsx88은 main만 inert, footer 살아 있음, focus trap/복귀 없음. Tab12회후 footer 세무기장 등으로 이동 재현.
9. P2 검색 고객 result hash 없음: api/search/route.ts50 /clients#growing-ceo 등 생성, stage-picker.tsx25 pick0 고정, 실제id없음. direct navigation 항상 첫 단계. URL기반 tab state와 hash/popstate 처리 필요.
10. P2 /portal canonical이 홈: portal/page.tsx19에 alternates없어 layout 기본'/'상속. 실제 DOM https://www.meridianco.kr/. 대부분 페이지 OG 공통 제목/URL 상속 및 기본 이미지 없음. desktop home h1 없음(AboutOpening desktop branch only div); 모바일만 h1.
11. P2 JS 불능에서 홈 핵심 내용 invisible: .rise 기본 opacity0, PromoMotion효과가 켜줘야 함. JS disabled h2 '대시보드','기장부터 자문까지','비교','최근 인사이트' invisible. HTML기본 visible 이후 enhancement, semantic h1 안정화.
12. P2 접근성 semantics: clients ol role=tablist > li >button role=tab 트리 axe critical(required parent/children); arrow keyboard/roving tabindex/tabpanel label 없음. 자동진단 severity는 axe용어로 앱 보안 critical과 구별. 홈 span aria-label(역할없음) 추가 경고. portal contrast 초기34건은 animation opacity 영향 있어 최종 정적 상태 재검증 후만 결론에 반영.

## 구조/운영 리스크 (관측 사실과 영향 가설 구분)

- Root ReactLenis + PromoMotion new Lenis 중복(window owner2개). home/portal에서 실제 함께 마운트. GSAP ScrollTrigger.getAll().kill 모든 component trigger 제거 및 scrollerProxy reset없음. document-global selectors/RAF/scattered offsets(66/80) 결합, @ts-nocheck & eslint-disable. 스크롤 단일 owner로 refactor, scene scope refs 및 gsap context/matchMedia cleanup, native scrolling default 검토. 항상 freeze한다는 단정 없음.
- root template, AnimateOnScroll hydration 전 fragment 후 motion wrapper로 바꿔 자식 remount 가능. 같은 home-hero.webm 요청2회 관측(각~922KB). 모바일 branch도 swap. waterfall 확인과 안정한 DOM/하나의video/poster 최적화 필요.
- Lighthouse home mobile simulated150ms RTT/4xCPU 1회:62점/FCP5.3s/LCP9.5s/TBT30ms/CLS0. LCP target video, poster없음. 실사용성능수치가 아니라 로컬진단. 우선 poster/criticalCSS/font/미디어 loading. 3개 라이브러리있다는 이유만으로 성능실패 추정하지 않음.
- globals5770+promo2514+glass481=8765 CSS줄, 토큰과 mobile breakpoints 중복, promo .wrap 등 global rules. CSS modules/component scope와 token single source. 주석길이만으로 전체 rewrite 제안안함.
- API는20KB stream 제한/HTMLescape/origin/method validation/honeypot/IP email rate limit 있고 유효한 방어다. Shared limiter env가없거나오류시기본메모리fallback; serverless instances 우회/정책 불명,README strict flag누락. production fail policy와 config validation, 프록시 IP trust 확인.
- 문의 영속 저장/receipt id/retry/idempotency/운영알림/delivery webhook 없음. 작은 사이트는 provider acceptance검증+발송기록/알림으로 시작, 유실없는 SLA원하면 DB+outbox 필요. 대형 CRM/microservice 일괄도입 불필요.
- error.tsx/global-error/not-found 맞춤UI 없음. 기본404는정상. Recovery UX/에러 추적/문의 전환·실패 관측/배포 smoke 필요. Vercel Analytics/SpeedInsights는 이미 있음.
- CI 공급망/서명/SBOM/lint/build/content audit 있음. 기능/E2E/접근성/견적 unit 테스트 없음. 공급망에만 높은검증밀도, 현사업흐름은빈틈. 핵심 시나리오 추가. production branch/protection/env secrets/rollback 실제설정 미확인.
- getAllPosts 반복 sync parse:현재51공개글에서규모문제아님, build manifest/cache와strict schema/related slug/serviceRefs/date freshness 검증은개선. MDX는저장소신뢰콘텐츠라현재remoteRCE단정불가; CMS 외부원고도입시trusted-code boundary결정.
- /pricing robots disallow인데 index true상속. 숨기는의도면 noindex를 crawler가볼수있게, 공개의도면탐색정책 정리. 현재메뉴미노출은의도일수있어기능고장으로단정안함.
- /portal은실제대시보드가아닌데모, external app본체는다른repo. /contract도reverse proxy. 두URL HEAD200 및 contractcamera헤더독립확인. 실제 로그인/권한격리/연동/서명/파일보존/삭제/감사로그는이번repo로검증불가. 별도수용시험필요.

## 검증 범위

lint/build/content pass, audit signatures793verified130attestations, audit11alerts. sitemap69+pricing1=70페이지200, preview/임의404/privacy404. 43개SSR script/image/source자산HEAD200. browser12대표페이지200/JSError0. 375/768/960x812,6화면18조합root가로overflow없음(메뉴클리핑없다는증거아님). no-live-email, no-prod-mutation. 모바일screenshot와desktop 확인. Fable결과는이기록작성까지열람하지않음.

추가 독립 검증: 설치된 Upstash SDK timeout 경로가 success:true/reason:timeout 반환함을 10ms timeout mock limiter로 확인. route는 reason을 버리므로 strict flag만으로 timeout fail-closed 달성 못함. 최종 보고서 운영 정책 절에 반영.
