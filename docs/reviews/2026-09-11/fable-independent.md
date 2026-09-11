# accounting-homepage · `feat/menu-ia` 독립 검토 보고서

- 검토일: 2026-09-11
- 검토 대상: `/Users/macstudio/dev/accounting-homepage`, 브랜치 `feat/menu-ia` (HEAD `9b6f13c`, `main` 대비 8커밋 / 268파일 변경)
- 검토 모델: Claude Fable 5.1 (하네스가 보고한 모델 ID `claude-fable-5-1`). 별도 버전 검증 수단은 없어 하네스 값을 그대로 적는다.
- 방식: 저장소 파일 전수 열람(`src/`, `content/`, 설정, CI, docs), `node_modules/next/dist/docs` 관련 항목 대조, 로컬 프로덕션 서버 `http://localhost:3100`(`next start`, BUILD_ID `W18TlF8c…`)에 대한 읽기 전용 HTTP 점검. 저장소 파일은 수정하지 않았고, 브랜치를 바꾸지 않았고, 빌드/린트/감사(npm)는 Codex 몫이라 돌리지 않았다. 외부 상태(메일 발송 등)는 건드리지 않았다.
- 제외: 미추적 `prototypes/`는 `.next` 산출물·서버 응답(`/prototypes/clean/index.html` → 404) 어디에도 포함되지 않음을 확인했으므로 배포 코드 지적에서 뺐다.
- Codex 검토 산출물은 읽지 않았다.

표기: **[확정]** = 코드/응답으로 직접 확인한 결함. **[검증필요]** = 코드상 근거는 있으나 실제 배포 환경(브라우저·Vercel/CF)에서 증상을 재야 확정되는 위험.

---

## 0. 한 줄 결론

구조(Next 16 App Router · 정적 생성 · MDX 콘텐츠 · 타입 있는 서비스 데이터 · 방어적인 문의 API · 서명 검증까지 하는 CI)는 건강하다. **전면 재작성은 불필요하다.** 대신 아래 P1 아홉 건은 `main` 병합 전에 잡아야 하고, 홈/포털을 움직이는 두 개의 "이식된 바닐라 JS 덩어리"(`promo-motion.tsx`, `service-merge.tsx`)와 세 겹의 스크롤/애니메이션 엔진(Lenis ×2 인스턴스 + GSAP + motion)은 이 브랜치 이후 반드시 정리해야 할 기술부채다.

---

## 1. 우선순위 요약표

| 등급 | # | 항목 | 상태 | 영역 |
|---|---|---|---|---|
| P1 | A | `/portal` canonical이 홈(`/`)을 가리킴 → 검색엔진이 포털 페이지를 홈의 중복으로 간주 | 확정 | SEO |
| P1 | B | 홈 SSR HTML에 `<h1>`이 없음 (데스크톱 분기에 h1 부재) | 확정 | SEO |
| P1 | C | 홈·포털에서 Lenis 인스턴스가 **두 개** 동시에 스크롤을 잡음. `promise-stage`의 `lenis.stop()` 홀드가 무력화됨 | 코드 확정 / 증상 검증필요 | UX·성능 |
| P1 | D | 서비스 상세 → 문의 링크의 `?type=&output=`가 버려지고, 폼은 분류 필드를 아예 보내지 않음. 메일 제목 `[홈페이지 문의]  - 이름` | 확정 | 리드 품질 |
| P1 | E | 개인정보 수집·이용 동의 절차와 개인정보처리방침이 없음 (이름·이메일·전화 수집) | 확정(부재) | 법규 |
| P1 | F | 마감 일정 `2026-10-10`(토), `2026-10-25`(일)가 그대로 D-day로 표시. 같은 목록이 두 파일에 중복 | 확정 | 콘텐츠 정확성 |
| P1 | G | 메뉴 BLOG → 「업무경험」이 빈 페이지. 서비스 상세의 「업무 경험」 칸도 항상 비어 있음 (해당 카테고리 글 0편) | 확정 | 콘텐츠 준비 |
| P1 | H | 휴대폰에도 SSR은 데스크톱용 고정(sticky) 무대 마크업을 보내고, ~1MB JS 하이드레이션 후에야 flat 판으로 바뀜 | 코드 확정 / 체감 검증필요 | 모바일 성능 |
| P1 | I | 데스크톱 메가메뉴가 키보드로 사실상 사용 불가 (`onBlur`가 포커스 이동 즉시 닫음) | 코드 확정 / 검증필요 | 접근성 |
| P2 | J | 뒤로가기마다 맨 위로 튐 (`scrollRestoration = manual` + 경로 바뀔 때마다 `scrollTo(0)`), 블로그 페이지 번호도 유실 | 확정 | UX |
| P2 | K | 사이트 전체에 `og:image` 없음 (표지 있는 글 3편 제외) | 확정 | SEO·공유 |
| P2 | L | 페이지 제목이 `PRACTICE`, `WHO`, `PEOPLE`, `실무 메모`(h1은 「인사이트」) 등 검색 의도와 무관. `llms.txt` 서비스 설명이 구(舊) 구조 | 확정 | SEO |
| P2 | M | `/pricing`은 메뉴·푸터·사이트맵·검색 어디에도 없는 고아 페이지인데 메타는 `index, follow`, robots.txt는 Disallow | 확정 | SEO·IA |
| P2 | N | `not-found.tsx` / `error.tsx` / `global-error.tsx` 없음 → 영어 기본 404, 런타임 오류 시 빈 화면 | 확정 | 운영 |
| P2 | O | 테스트 0건. 848줄짜리 수임료 계산 로직·검색 매칭·제목 분할 등 순수 함수가 전부 무검증 | 확정 | 품질 |
| P2 | P | 폰트 92조각·영상(0.7~2.4MB)이 `Cache-Control: public, max-age=0`으로 나감 (로컬 `next start` 기준) | 로컬 확정 / 프로덕션 검증필요 | 성능 |
| P2 | Q | `template.tsx`·`AnimateOnScroll`이 하이드레이션 직후 콘텐츠를 숨겼다가 다시 페이드인 → 첫 화면 깜빡임 | 코드 확정 / 검증필요 | 성능·UX |
| P2 | R | 푸터 「Founder · 박민상 회계사 공인회계사」 (호칭 중복, 전 페이지 노출) | 확정 | 콘텐츠 |
| P2 | S | `faq/page.tsx` JSON-LD만 이스케이프 없는 `JSON.stringify` 사용 | 확정(잠재) | 보안 위생 |
| P2 | T | 글 54편의 `lastChecked`가 전부 2026-04-29~05-01 (4개월 이상 경과), 2025년 시즌 글이 그대로 노출 | 확정 | 콘텐츠 신선도 |
| P3 | – | 미사용 컴포넌트 8개(875줄)·미사용 export·미참조 public 자산 ~3MB·추적된 `output/` 12MB·낡은 문서·환경변수 문서 누락 등 | 확정 | 위생 |

---

## 2. 기능 검토 (end-to-end)

로컬 프로덕션 서버에서 확인한 라우트 응답:

| 경로 | 상태 | 비고 |
|---|---|---|
| `/` `/about` `/members` `/clients` `/faq` `/portal` `/contact` `/pricing` `/services` `/services/*` `/blog` `/blog/*` | 200 | 정적 프리렌더(`x-nextjs-prerender: 1`), `/contact`만 동적(`searchParams`) |
| `/preview` | 404 | `ENABLE_PREVIEW_PAGE` 미설정 시 `notFound()` — 의도대로 |
| `/practice`, `/practice/valuation` | 308 → `/services…` | 정상 |
| `/blog?tab=faq` | 307 → `/faq?tab=faq` | 쿼리가 따라감. 무해하나 `?tab=faq`가 남는 건 지저분 |
| `/api/contact` GET/PUT/PATCH/DELETE | 405, OPTIONS 204, HEAD 405 | 정상 |
| `/api/contact` POST (Origin 타 도메인) | 403 | 정상 |
| `/api/contact` POST (UA 없음) | 400 | 정상 |
| `/api/search` | 200, 72건, `X-Robots-Tag: noindex` | 정상 |
| `/robots.txt` `/sitemap.xml`(69 URL) `/llms.txt` | 200 | 내용 문제는 §6 |
| `/contact?message=<script>…` | 반사값이 올바르게 이스케이프됨 | XSS 없음 |

### 2-1. 문의 흐름이 끊겨 있다 — P1-D [확정]

- `src/app/services/[slug]/page.tsx:366-371` 는 `/contact?type=<서비스명>&output=<산출물>` 로 보낸다.
- `src/app/contact/page.tsx:24-28, 54-57` 는 `searchParams.message` **만** 읽는다. `type`, `output` 은 버려진다.
- `src/components/contact/contact-form.tsx:5-12, 51-55` 의 폼 상태는 `name/email/phone/message/startedAt/website` 뿐이다. 서버(`src/app/api/contact/route.ts:405-418`)가 받도록 만들어 둔 `type/companyStage/bottleneck/desiredOutput/timeline` 은 어떤 화면에서도 채워지지 않는다. `src/lib/contact-options.ts` 전체가 사실상 죽은 코드다.
- 결과: `route.ts:480` 의 제목이 항상 `[홈페이지 문의]  - 홍길동` (type 빈 문자열, 공백 두 칸). 서비스 상세에서 넘어온 맥락(어느 서비스, 어떤 산출물)이 메일에 남지 않는다.
- 영향: 회계사가 받는 리드에 서비스 구분이 없다. 마케팅 관점에서 이 브랜치의 핵심 목표(서비스 상세 → 문의 전환)가 데이터로 안 남는다.
- 수정: (1) `contact/page.tsx` 에서 `type`·`output` 을 읽어 `initialValues` 로 넘기고, (2) 폼에 hidden 또는 select 로 `type`(CONTACT_TYPE_OPTIONS 와 값 일치 필요 — 현재 서비스명 「세무 기장」과 옵션 「세무 기장」은 일치하지만 「기업 실사」·「PA」·「IPO 자문」·「경리 아웃소싱」은 옵션에 없어 서버에서 빈 문자열로 떨어진다)을 포함하고, (3) `route.ts:480` 은 `type ? \`${type} - ${name}\` : name` 으로 정리한다.

### 2-2. 메뉴가 빈 페이지로 보낸다 — P1-G [확정]

- `src/lib/constants.ts:118` 「업무경험」 카테고리가 BLOG 드롭다운(`constants.ts:183-187`)에 들어간다.
- `content/posts/*.mdx` 54편 중 `category: 업무경험` 은 **0편**, `services:` 프런트매터를 가진 글도 0편이다(grep 결과).
- `/blog?cat=case` 는 `src/app/blog/blog-content.tsx:301-307` 의 "이 갈래엔 아직 글이 없습니다." 만 렌더링한다. 상단 메뉴에서 바로 닿는 빈 화면이다.
- `src/app/services/[slug]/page.tsx:62-68` 의 `cases` 는 언제나 `[]` 이므로 「업무 경험 & 인사이트」 칸은 인사이트 글 3편만 보이고 "업무 경험 전체 보기" 링크는 절대 뜨지 않는다.
- 수정: 병합 전에 최소 1~2편의 업무경험 글을 넣거나, 글이 0편이면 메뉴 항목을 렌더링하지 않도록 `navMenu` 생성부에서 카테고리별 글 수를 보고 거른다(`insightCategories` 는 서버에서만 posts 를 알 수 있으니 `api/search` 처럼 서버 컴포넌트에서 계산해 내려야 한다).

### 2-3. 마감 일정이 틀린 날짜를 센다 — P1-F [확정]

- `src/lib/constants.ts:225-231` 과 `src/app/portal/page.tsx:12-17` 에 **같은 배열이 두 번** 적혀 있다(주석은 "이 목록 하나를 같이 본다"라고 하지만 포털은 복제본을 쓴다).
- `2026-10-10` 은 **토요일**, `2026-10-25` 는 **일요일**이다. 국세기본법상 기한이 공휴일·토요일이면 다음 영업일로 넘어가므로 실제 마감은 10/12(월), 10/26(월)이다. 헤더 큐브(`schedule-cube.tsx:23-35`)와 포털 팝업은 토·일 날짜를 기준으로 D-day 를 센다. 세무 사이트가 마감일을 하루 이틀 틀리게 보여 주는 것은 신뢰 문제다.
- `2026-09-10` 은 이미 지났다. 큐브는 `liveItems()` 로 지난 항목을 거르지만(`schedule-cube.tsx:43-49`), 포털 `SchedulePopup` 이 같은 필터를 갖는지는 확인하지 못했다 [검증필요].
- 수정: 배열을 `constants.ts` 하나로 합치고, 날짜는 영업일 보정을 거친 실제 마감일로 적는다(또는 `daysLeft` 에서 주말 보정). 서비스 페이지의 「1년의 흐름」(`services/page.tsx:93-133`) 날짜들은 법정 기한 기준으로 맞다.

### 2-4. 뒤로가기가 항상 맨 위로 간다 — P2-J [확정]

- `src/components/layout/scroll-to-top.tsx:17-20` 이 전역으로 `history.scrollRestoration = "manual"` 을 켠다.
- `src/components/providers/smooth-scroll-provider.tsx:27-39` 는 `pathname` 이 바뀔 때마다(뒤로가기 popstate 포함) `lenis.scrollTo(0, {immediate:true})` 를 호출한다.
- `src/app/template.tsx` 는 루트 template 이라 모든 이동에서 페이지 트리를 재마운트한다 → `blog-content.tsx:88` 의 `page` 상태(현재 몇 번째 판인지)도 사라진다.
- 결과: 블로그 목록 3페이지에서 글을 열고 뒤로 가면 1페이지 맨 위. 54편짜리 목록에서는 눈에 띄는 퇴행이다.
- 수정: `ScrollToTopOnRouteChange` 에서 popstate 는 제외(`window.addEventListener("popstate")` 로 플래그를 세우거나 Next 의 `useRouter` 내비게이션 타입 확인), `scrollRestoration` 은 홈에서만 필요하면 홈 컴포넌트 안에서 처리, 페이지 번호는 `?page=` 로 URL 에 싣는다.

### 2-5. 기타 기능

- `src/app/services/[slug]/page.tsx:168`, `:263` — `{service.childSlugs?.length && (…)}` 패턴. 배열이 `[]` 이면 화면에 `0` 이 찍힌다. 지금 데이터에는 빈 배열이 없어 잠재 결함이지만 `Boolean()` 또는 `> 0` 으로 바꿔 두는 게 안전하다 [확정·잠재].
- `next.config.ts:49-53` `/blog?tab=faq` → `/faq` 리다이렉트가 쿼리를 그대로 끌고 간다. 무해.
- `src/components/home/promo-motion.tsx:74` 는 `#creed` 를 찾지만 홈에는 `id="creed"` 가 없다(`page.tsx:235` 는 `id="end"`). 크리드 홀드는 조용히 비활성. 의도라면 코드도 지우는 게 맞다.

---

## 3. 아키텍처 평가

### 3-1. 잘 된 것
- App Router + `generateStaticParams` 로 블로그·서비스 상세가 전부 정적. `/contact` 만 동적. 배포 후 서버 비용·장애면이 작다.
- 콘텐츠 원본이 한 곳씩이다: 서비스 = `src/lib/data.ts` + 묶음 = `constants.ts:serviceGroups`(메뉴·목록·띠·푸터·사이트맵·검색이 전부 이걸 본다), FAQ = `lib/faq.ts`, 글 = MDX 프런트매터. 이 브랜치가 IA 문서(`docs/IA_V2.md`)의 「같은 내용은 한 군데가 원본」 원칙을 코드로 꽤 잘 옮겼다.
- `posts.ts` 의 슬러그 검증·경로 정규화, `mdx-content.tsx` 의 href 화이트리스트, `api/contact` 의 본문 크기 제한·honeypot·타이밍·URL 수·Origin/Sec-Fetch-Site 검사·헤더 인젝션 방지(이메일 정규식이 개행을 허용하지 않음, subject `singleLine`)는 이 규모 사이트치고 성실하다.
- 코드 주석이 「왜」를 남긴다. 유지보수자에게 큰 자산이다.

### 3-2. 문제 — 스크롤/애니메이션 스택이 세 겹이다 — P1-C

| 엔진 | 어디서 | 비고 |
|---|---|---|
| Lenis (ReactLenis root) | `smooth-scroll-provider.tsx:54-58` — 모든 페이지 | `lerp .2, duration .65` |
| Lenis (raw `new Lenis`) | `promo-motion.tsx:53-61` — `/`, `/portal` | 같은 옵션으로 **두 번째 인스턴스**, 자체 rAF 루프, `window.__lenis` 전역 |
| GSAP + ScrollTrigger | `promo-motion.tsx`, `service-merge.tsx` | Lenis 두 번째 인스턴스에 scrollerProxy |
| motion (framer) | 18개 파일 | `useScroll`, `whileInView`, layout 애니메이션 |

- 두 Lenis 가 같은 `window` 에 wheel/touch 리스너를 각각 붙이고 각자 `scrollTo` 를 쓴다. 코드상 확정. 실제 체감(가속 겹침·미세 진동)은 브라우저에서 재야 한다 [검증필요]. `docs/FIX_LOG_2026-09-07.md` §3 의 프레임 측정은 "뒤로 튐 0건"을 보고했지만 이중 인스턴스 자체를 인지한 기록은 없다.
- 확정적인 부작용: `src/components/about/promise-stage.tsx:87-91` 은 provider 의 Lenis 에 `stop()` 을 건다. 그러나 `promo-motion` 의 두 번째 Lenis 는 계속 wheel 을 처리하므로 「약속이 올라오는 순간 2.5초 붙잡기」는 홈에서 동작하지 않는다(멈춘 인스턴스는 `preventDefault` 만 하고, 살아 있는 인스턴스가 그대로 굴린다).
- `promo-motion.tsx`(668줄)와 `service-merge.tsx`(827줄), `schedule-popup.tsx` 는 `// @ts-nocheck` + `/* eslint-disable */` 로 타입·린트에서 빠져 있고, `getElementById('shot'|'gather'|'fdots'|'f-form'…)`·`querySelectorAll('.fc'|'.fpane'|'.kpi')` 로 JSX 마크업과 문자열 ID 로 결합돼 있다. 마크업을 고치면 조용히 깨지고, 타입 검사·린트가 그걸 잡아 주지 못한다. 이 브랜치의 회귀 위험 1순위다.
- 스크롤 리스너가 rAF 로 합쳐지지 않은 채 여럿이다: `header.tsx:73-74`(매 스크롤마다 `querySelector` + `getBoundingClientRect`), `scroll-cue.tsx:26`(`scrollHeight` 읽기), `promo-motion.tsx` 의 `makeSnap` ×2 + 섹션 브레이크 + 자체 frame 스케줄러, ScrollTrigger. 각각은 싸지만 레이아웃 강제 동기화가 프레임마다 여러 번 일어난다.

### 3-3. 문제 — CSS 규모와 두 가지 스타일 언어
- `globals.css` 5,770줄 + `promo.css` 2,514줄 + `glass.css` 481줄 ≈ 8.8k 줄. 홈 로드 시 CSS 148KB + 66KB + 9KB(비압축).
- 하위 페이지는 Tailwind 유틸리티, 홈/포털은 `.promo` 스코프의 BEM 풍 클래스. `globals.css` 머리말은 "Deloitte 톤" 을, `promo.css` 는 "hometax accent 사다리" 를 말한다. 디자인 토큰이 두 벌이다(`--color-accent` vs `--blue`).
- 재작성 사유는 아니지만, 라우트별 CSS 분리(`promo.css` 는 이미 홈/포털에서만 import 되는 점은 좋다)와 토큰 단일화는 필요하다.

### 3-4. 죽은 코드·자산 [확정]
- 어디서도 import 되지 않는 컴포넌트 8개, 875줄: `home/diagnostic-checklist.tsx`, `home/hero-cta-button.tsx`, `home/hero-parallax.tsx`, `home/hero-text-reveal.tsx`, `home/principal-unfold.tsx`, `services/sticky-scroll-services.tsx`, `motion/tilt-card.tsx`, `motion/image-reveal.tsx`.
- 미사용 export: `constants.ts` `navLinks`(:197), `heroImages`(:79), `pricingUrl`(:65); `posts.ts` `getCategories`(:375).
- `public/` 에서 참조되지 않는데 배포되는 파일: `public/media/hero-3d.mov`(1.0MB), `public/media/hero-3d.webm`(1.0MB), `public/images/profile-chest.jpg`(1.1MB, 죽은 `principal-unfold` 만 참조), `founder-3d-serious.png`, `hero-document.webp`, `meridian-advisory-workspace-hero.webp`, `next.svg`·`vercel.svg`·`globe.svg`·`file.svg`·`window.svg`.
- `.gitignore` 에 있으면서 추적되는 파일 44개(`output/` 12MB 스크린샷·로그, `.last-deploy.txt`). `.vercelignore` 가 배포에선 빼지만 저장소만 무겁다. `output/dev-3100.out.log` 에는 다른 개발자의 Windows 경로가 남아 있다.
- 루트의 `Logo.png`, `image/image.png`, `HANDOFF_REVIEW.md`(한결회계법인 시절 문서, Next 16.2.1 표기), `MEMORY.md` 는 정리 대상.

### 3-5. 재작성이 필요한가
**아니다.** 재작성을 정당화하려면 프레임워크 선택·데이터 모델·배포 모델 중 하나가 잘못돼 있어야 하는데 셋 다 적절하다. 필요한 것은 범위가 분명한 리팩터링이다:
1. `promo-motion.tsx` 의 raw Lenis 제거 → provider 의 `useLenis()` 사용, ScrollTrigger 프록시도 그 인스턴스로.
2. 두 바닐라 덩어리를 타입 있는 React 훅으로 나누고(`useStepScroll`, `useSnap`, `useEvidencePanel` …) `@ts-nocheck` 해제. 문자열 ID 결합은 `ref` 로.
3. GSAP 과 motion 중 하나로 통일(포털의 카드 모이기만 GSAP 을 쓰므로 motion 의 `useScroll`+`useTransform` 으로 옮기면 GSAP 의존성을 뺄 수 있다. 홈 JS ~1MB 중 GSAP+ScrollTrigger 몫은 실측 필요).
4. §3-4 죽은 코드·자산 삭제.
5. 순수 함수 단위 테스트 + Playwright 스모크(§8).

이 다섯 개는 며칠 단위 작업이지 주 단위가 아니다.

---

## 4. 보안·프라이버시

### 4-1. 개인정보 동의·처리방침 부재 — P1-E [확정]
- `contact-form.tsx` 는 이름·이메일·전화·상황을 받지만 수집 목적·항목·보유기간 고지와 동의 체크가 없다. 사이트 어디에도 개인정보처리방침 페이지·링크가 없다(`grep 개인정보` → 0건, 푸터 `footer.tsx` 에 링크 없음).
- `lib/faq.ts:41-42` 의 "계약으로 이어지지 않으면 보관하지 않고 파기합니다" 는 처리방침의 기능을 대신하지 못한다.
- 개인정보보호법 제15조·제30조 관점에서 공인회계사 사이트가 안고 갈 위험이 아니다. `/privacy` 정적 페이지 + 폼의 필수 동의 체크(`required`) + 서버에서 `agree === true` 검증을 추가한다.

### 4-2. 헤더·CSP
- `next.config.ts:87-125`: X-Frame-Options DENY, `frame-ancestors 'none'`, COOP/CORP, Referrer-Policy, Permissions-Policy(`browsing-topics=()` 포함), `X-Robots-Tag` on `/api/*`·`/preview`. 좋다. `/contract` 예외 정규식은 `MEMORY.md` 기록대로 검증된 것으로 보인다.
- CSP `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com`(`next.config.ts:4-10`): `'unsafe-inline'` 이 있는 한 CSP 는 XSS 를 막지 못한다(문서 `02-guides/content-security-policy.md` 는 nonce + `'strict-dynamic'` 을 권하지만 그러려면 동적 렌더링이 필요해 정적 생성과 충돌). 현재 사이트는 사용자 입력을 렌더링하는 곳이 `/contact?message=` 뿐이고 그것도 React 가 이스케이프하므로 **수용 가능한 절충**이다. 다만 "CSP 가 있다" 를 보안 근거로 삼지는 말 것.
- HSTS 헤더는 앱이 내지 않는다. Vercel 은 자동 부여하지만 Cloudflare Workers 프리뷰는 대시보드 설정에 달려 있다 [검증필요].

### 4-3. 문의 API
- `route.ts:175-182` `getClientKey` 는 `x-forwarded-for` 첫 값을 신뢰한다. Vercel 뒤에서는 플랫폼이 덮어쓰므로 안전. Cloudflare Workers 로 가면 클라이언트가 임의 값을 넣을 수 있어 IP 레이트리밋이 우회된다 → CF 에서는 `cf-connecting-ip` 를 우선해야 한다 [배포 대상에 따라].
- `route.ts:456` `RESEND_FROM_EMAIL` 미설정 시 `onboarding@resend.dev` 로 폴백. Resend 의 onboarding 도메인은 계정 소유자 주소로만 발송 가능하므로 프로덕션에서 env 누락 시 "성공" 응답 뒤 조용히 실패할 수 있다. 미설정이면 500 을 내는 편이 낫다.
- `route.ts:28-29` `CONTACT_RATE_LIMIT_REQUIRE_SHARED` 는 README 에 없다. 메모리 레이트리밋은 서버리스 인스턴스별이라(주석도 인정) Upstash 없이는 사실상 무력하다 → README 「필수」로 올리거나 기본을 `true` 로.
- JSON-LD 직렬화: `layout.tsx:24-31`, `contact/page.tsx:45-52`, `blog/[slug]/page.tsx:32-39` 는 `<`/`>`/`&`/U+2028 을 이스케이프하는 `toSafeJsonLd` 를 쓰는데 `src/app/faq/page.tsx:52` 만 맨 `JSON.stringify` 다. 데이터가 정적 FAQ 라 지금은 무해하지만 답변에 `</script>` 가 들어가는 순간 페이지가 깨진다. 같은 헬퍼로 통일하고, 세 파일에 복붙된 `toSafeJsonLd` 는 `lib/` 로 뺀다 [확정·잠재].
- `mdx-content.tsx`: MDX 는 콘텐츠 파일 안의 JSX/JS 를 실행한다. 글은 저장소 안에서만 오므로 현재는 안전하지만, 외부 기고를 받기 시작하면 `next-mdx-remote` 의 코드 실행 경계를 다시 봐야 한다.

---

## 5. 접근성

- **메가메뉴 키보드 — P1-I** [코드 확정 / 검증필요]: `site-nav.tsx:120-122` 래퍼의 `onBlur` 는 포커스가 래퍼 밖으로 나가면 `scheduleClose()` 를 부른다. 판(`MegaPanel`)은 `header.tsx:199-200` 처럼 `.hdr-bar` **뒤에** 렌더링되므로 DOM 순서상 트리거 → 다음 상위 메뉴 → 큐브 → 검색 → CTA → 판 순이다. ArrowDown 으로 판을 열어도 Tab 한 번에 포커스가 래퍼를 떠나 120ms 뒤 판이 닫힌다. 키보드 사용자는 서비스 8개 링크에 닿을 수 없다(우회로: `/services` 의 ServicePicker). 수정: ArrowDown 시 판의 첫 링크로 `focus()` 이동, `onBlur` 판정에 판(`.hdr-mega`)도 포함, Esc 로 트리거 복귀(이미 있음).
- 스킵 링크 없음(`grep skip` → 0), `<main>` 에 id 없음. 헤더에 링크가 10개 넘으므로 「본문으로 건너뛰기」가 필요하다.
- `site-search.tsx:140-150, 172-192`: `role="listbox"` + `role="option"` 인 링크들이 있지만 입력에 `role="combobox"`, `aria-controls`, `aria-activedescendant`, `aria-expanded` 가 없어 화면낭독기가 후보를 알리지 못한다.
- `service-picker.tsx:144` hover 로 바뀌는 항목에 `aria-current="true"` — 현재 페이지가 아닌데 current 를 쓴다. `aria-selected` 도 링크에는 부적절하니 시각 표시만 두는 게 낫다.
- `stage-picker.tsx:34-50` `role="tablist"/"tab"` 인데 화살표 키 이동이 없다. 탭 패턴을 쓰려면 키보드 규약까지, 아니면 그냥 버튼 그룹으로.
- 잘 된 것: 모바일 메뉴 `inert` + `aria-modal` + Esc(`header.tsx:83-115`), 일정 모달 포커스 트랩·복귀(`schedule-cube.tsx:73-99`), `prefers-reduced-motion` 분기 10곳 이상, `focus-visible` 규칙 20개, 영상 `aria-hidden`, 색 대비(`--color-subtle #6E6E6E` 5.7:1, deep 배경 위 `neutral-400` ≈ 6.5:1).

---

## 6. 성능

| 항목 | 값(홈, 로컬 `next start`) |
|---|---|
| HTML | 99KB |
| CSS | 148KB + 66KB + 9KB |
| JS 청크(스크립트 태그 기준 합) | ≈ 1.0MB 비압축 (최대 227KB, 145KB, 141KB, 129KB, 113KB) |
| 히어로 영상 | `/home-hero.webm` 0.9MB · `.mp4` 1.1MB (홈), `/meridian-hero.webm` 0.7MB · `.mp4` 2.4MB (하위 9쪽 전부) |
| 폰트 | Pretendard 92조각 + Wanted Sans 92조각(unicode-range) + Cormorant 2파일 preload |

- **모바일 SSR 마크업 — P1-H** [코드 확정]: `lib/use-media.ts:24-28` 의 서버 스냅샷은 항상 `false`(=데스크톱). 따라서 SSR HTML 은 `about-stage`/`promise-scroll`(sticky 100svh 무대)을 담는다(curl 로 `about-stage` 2회, `about-flat` 0회 확인). 휴대폰은 JS 가 도착·실행될 때까지 데스크톱 판을 보다가 `about-flat` 으로 바뀐다. `about-opening.tsx` 주석("첫 페인트부터 flat")은 하이드레이션 **후** 첫 React 페인트 얘기지 SSR 첫 페인트가 아니다. 3G/저사양에서 ~1MB JS 파싱 전까지 무대가 보이고 레이아웃이 통째로 바뀐다(CLS). 대안: CSS 미디어쿼리만으로 두 판을 모두 렌더링하고 `display` 로 가르기(정적 마크업 두 벌), 또는 `useHandheld` 의 서버 스냅샷을 UA 힌트(`Sec-CH-UA-Mobile`)로 채우기(그러면 동적 렌더링이 됨).
- **하이드레이션 깜빡임 — P2-Q** [코드 확정]: `template.tsx:11-28` 과 `animate-on-scroll.tsx:55-64` 는 SSR 에선 그냥 자식을 그리고, 하이드레이션 뒤 `motion.div` 를 `initial={{opacity:0}}` 로 마운트한다. 보이던 내용이 0.35~0.6초 사라졌다 나타난다. 이 패턴은 `main` 에도 있던 것이지만(`animate-on-scroll.tsx` 는 이 브랜치에서 안 바뀜) 루트 `template.tsx` 까지 얹혀 매 페이지 이동마다 반복된다. `initial={false}` 로 첫 마운트는 애니메이션 없이, 이후 이동에서만 페이드하도록 바꾸는 것이 일반적이다.
- **정적 자산 캐시 — P2-P**: 로컬 `next start` 기준 `/home-hero.mp4`, `/fonts/**` 가 `Cache-Control: public, max-age=0`. Vercel 도 `public/` 파일에 기본 `max-age=0, must-revalidate` 를 주고 CDN 만 캐시하므로 브라우저는 페이지마다 폰트 조각 수십 개를 재검증(304)한다. `next.config.ts headers()` 에 `/fonts/:path*`, `/:file*.(mp4|webm|jpg|webp|png)` 를 `public, max-age=31536000, immutable` 로 추가할 것(파일명에 해시가 없으니 교체 시 이름을 바꾸는 규칙과 함께) [프로덕션 헤더 검증필요].
- 하위 9쪽 전부가 히어로 배경으로 2.4MB mp4(웹킷 폴백)를 0.3~0.38 투명도로 깐다. `preload="metadata"` + 포스터라 첫 페인트는 막지 않지만 iOS 가 재생을 시작하면 데이터가 나간다. 하위 페이지용은 720p·10초 루프로 더 줄이거나 `prefers-reduced-data` 분기를 둘 만하다.
- `layout.tsx:16-22` Cormorant Garamond(3 굵기 × 2 스타일)를 전 페이지에 싣지만 쓰이는 곳은 About 로고 한 줄이다. 실제 preload 는 2파일이라 크지 않으나 About 에서만 부르는 편이 깔끔하다.
- `header.tsx:159,168`, `page.tsx:110,173,243`, `portal/page.tsx:460` 의 `<a href="/contact">`·`<a href="/portal">` 는 전체 새로고침이다. FIX_LOG 가 "린트 에러로 `<a>` 를 `<Link>` 로 바꿨다" 고 적었지만 이 6곳은 남아 있다(App Router 에서는 `no-html-link-for-pages` 가 안 걸린다). 특히 헤더 CTA 는 가장 많이 눌리는 링크다.
- 애니메이션 라이브러리 3종 동시 탑재(§3-2)는 JS 1MB 의 주원인 후보다. 정확한 몫은 `next build` 의 청크 분석으로 재야 한다 [검증필요].

---

## 7. SEO·메타데이터

- **`/portal` canonical — P1-A** [확정]: `src/app/portal/page.tsx:19-23` 의 metadata 에 `alternates.canonical` 이 없어 루트 `layout.tsx:65-67` 의 `canonical: "/"` 를 상속한다. 응답 HTML: `<link rel="canonical" href="https://www.meridianco.kr">`. 사이트맵(`sitemap.ts:56-61`)에는 우선순위 0.75 로 넣어 두었으니 서로 모순이다. 구글은 canonical 을 따라 `/portal` 을 색인에서 뺀다. 홈(`page.tsx`)도 canonical 을 명시하지 않지만 루트 값이 `/` 라 우연히 맞다. 404 페이지도 같은 이유로 홈 canonical 을 달고 나간다(404 라 무시되지만 `not-found.tsx` 를 만들 때 함께 정리).
- **홈 h1 없음 — P1-B** [확정]: `about-opening.tsx:144` 의 `<h1>` 은 flat(휴대폰·reduced-motion) 분기에만 있고, 데스크톱 분기(`:216-220`)는 `<div className="about-what-name">` 안에 Wordmark 만 있다. SSR 은 데스크톱 분기 → 홈 HTML 에 `<h1>` 0개(curl 확인). 가장 중요한 페이지에 h1 이 없다. `about-what-name` 을 `h1` 으로 바꾸면 된다(스타일은 클래스에 있으니 무해).
- **og:image — P2-K** [확정]: `layout.tsx:68-81` openGraph/twitter 에 이미지가 없고, 하위 페이지도 없다. 카카오톡·슬랙·링크드인 공유 카드에 이미지가 안 뜬다. `app/opengraph-image.png`(정적 1200×630) 하나면 전 페이지에 자동 적용된다.
- **제목 — P2-L** [확정]: `services/page.tsx:8` "PRACTICE", `clients/page.tsx:10` "WHO", `members/page.tsx:11` "PEOPLE", `blog/page.tsx:9` "실무 메모"(h1 은 「인사이트」, 메뉴는 BLOG). 검색 결과에 `PRACTICE | 메리디안 택스 어드바이저리` 로 뜬다. 「세무기장·세무조정·회계감사 서비스 | 메리디안」 처럼 한국어 키워드로. `api/search/route.ts:42` 의 `hint: "PRACTICE"` 도 같은 잔재.
- `src/app/llms.txt/route.ts:26-28`: Services 설명이 "세무기장, 법인세, 세무조정, 자문, 가치평가" 로 구 구조. `/faq`, `/portal`, `/clients`, `/members` 가 Core Pages 에 없다.
- **`/pricing` — P2-M** [확정]: `robots.ts:9` 가 Disallow 하지만 `pricing/page.tsx:6-13` 은 canonical 만 있고 `robots: {index:false}` 가 없어 HTML 에는 `index, follow` 가 박힌다. Disallow 는 크롤링만 막고 외부 링크로는 색인될 수 있어 두 신호가 어긋난다. 게다가 `constants.ts:202-215` 는 `/pricing` 을 사이트 내 검색에서도 뺐고 메뉴·푸터 어디에도 링크가 없어 완전한 고아 페이지다. IA 문서는 "(수임료)" 를 괄호로 남겨 두었는데, 살릴지 죽일지를 결정해야 한다. 살리면 메뉴/푸터 링크 + robots 통일, 죽이면 라우트 삭제.
- `sitemap.ts:8` `now` 를 정적/서비스 URL 전부의 `lastModified` 로 쓴다. 매 배포마다 모든 URL 이 "방금 수정됨" 이 되어 크롤러가 lastmod 를 무시하게 된다. 정적 페이지는 lastmod 를 생략하거나 커밋 시각을 쓴다.
- 사이트맵에 `/services/tax-advisory`(세부 업무 링크 셋만 있는 분류 페이지)가 들어간다. 얇은 페이지라 canonical 을 `/services` 로 주거나 본문을 채운다.
- JSON-LD: `ProfessionalService` + `WebSite` + `BlogPosting` + `BreadcrumbList` + `FAQPage`(contact·faq 두 곳에 **같은** FAQPage 가 중복 — 구글은 도메인당 한 FAQPage 를 권장한다). `address`/`telephone` 이 `ProfessionalService` 에 없다(`siteConfig.address`, `tel` 이 있으니 넣을 것).

---

## 8. 콘텐츠·데이터 정확성

- 마감일 주말 문제 — §2-3.
- **푸터 호칭 중복 — P2-R** [확정]: `footer.tsx:46` `Founder · {siteConfig.founder} 공인회계사` → `siteConfig.founder = "박민상 회계사"` 이므로 「박민상 회계사 공인회계사」.
- **글 신선도 — P2-T** [확정]: 54편 전부 `lastChecked` 2026-04-29 ~ 05-01. 글마다 「검토 기준일」 카드를 크게 보여 주고 `llms.txt` 에도 "Last checked" 를 적으므로, 4개월 넘은 날짜가 오히려 신뢰를 깎는다. `vat-preliminary-q1-2025`, `vat-preliminary-q2-2025`, `interim-corporate-tax-2025`, `year-end-tax-prep-2025` 등 2025 시즌 글이 2026-09 에 그대로 목록에 선다. `scripts/content-audit.mjs` 는 `lastChecked` 존재만 보고 경과일은 안 본다 → 90일 초과 경고를 추가할 것.
- `content-audit.mjs` 는 통과(0 error / 0 warning). `published: false` 3편(`_template`, `business-status-report-exempt`, `prelim-filing-penalty-relief-2026`)은 정상 제외.
- `services/page.tsx:93-133` 「1년의 흐름」 법정 기한(1.25/2.10/3.31/4.25/5.31/6.30/7.25/8.31/10.25/11.30)은 12월 결산 법인·개인 기준으로 맞다. "매월 10일 원천세" 도 맞다.
- 포털·대시보드 배너의 숫자는 데모다. `page.tsx:122` 「표시된 숫자는 예시입니다」 는 있지만, `/portal` 본문(`portal/page.tsx:129-179, 285-343, 397-410`)에는 「데모/예시」 표기가 회사명 「㈜메리디안 데모」 뿐이다. 「매일 자동 수집」「30종 서식 자동 채움」「0건 대표님이 찾아 보낼 자료」 같은 정량 주장은 광고 규제 관점에서 근거 문구 한 줄이 필요하다.
- 소속 고지: `constants.ts:62-64`(「메리디안 택스 어드바이저리」)와 `about/page.tsx:211-219`(「메리디안 어드바이저리」)의 브랜드명 표기가 다르다. 법정 업무 주체를 밝히는 문장이라 한 벌로 맞출 것.
- `constants.ts:131` 이 가리키는 `docs/IA_MENU_PLAN.md` 는 없다(IA_V2 로 대체됨).

---

## 9. 테스트·CI·배포·관측

### 9-1. 테스트 — P2-O [확정]
- `package.json` 에 test 스크립트 없음, 테스트 디렉터리 없음. `lib/pricing.ts`(848줄, 구간표·부가·세팅비 계산·URL 직렬화), `lib/search-match.ts`(초성·1글자 오타 매칭), `lib/headline.ts`(조사 규칙 분할), `lib/posts.ts`(프런트매터 정규화·관련글 점수) 는 전부 순수 함수라 Vitest 로 반나절이면 덮인다. 특히 수임료 계산은 고객이 보는 숫자다.
- 이 브랜치는 Playwright 로 "잰" 기록(`docs/FIX_LOG_2026-09-07.md`)이 많지만 스크립트는 저장소에 없다. 그 측정을 `e2e/` 스모크(각 라우트 200·h1 존재·canonical·콘솔 에러 0·모바일 sticky 0개)로 굳히면 회귀 방지가 된다.

### 9-2. CI (`.github/workflows/ci.yml`)
- 좋은 점: 액션 SHA 고정, `permissions: contents: read`, `npm ci --ignore-scripts` 후 신뢰 패키지만 `rebuild`, `npm audit --audit-level=moderate`, `npm audit signatures`, CycloneDX SBOM 업로드, 콘텐츠 감사 → 린트 → 빌드. 이 규모에선 상위권이다. Dependabot 주간.
- 빠진 것: 테스트 단계(없으니까), Lighthouse/번들 예산, 프리뷰 배포 검증. Node 22.21.1 고정인데 `package.json` `engines`·`.nvmrc` 가 없어 로컬(22.23.1)과 어긋나도 아무도 모른다.
- `package.json` `overrides`(postcss 8.5.10, svix 1.92.2)는 감사 통과용 핀이다. 상위 의존성이 올라가면 오히려 다운그레이드가 될 수 있으니 Dependabot PR 때마다 확인 대상.

### 9-3. 배포
- README 는 Vercel. 워크트리에는 `wrangler.jsonc`·`open-next.config.ts`·`.open-next/`·`.wrangler/` 가 있는데 `.git/info/exclude` 로만 숨겨져 있고 `@opennextjs/cloudflare`·`wrangler` 는 `npm ls` 에서 **extraneous**(package.json 에 없음). `npm ci` 한 번이면 사라진다. 프리뷰 환경이 저장소 밖 상태에 의존한다 → devDependency 로 넣고 `deploy:preview` 스크립트로 명시하거나, 프리뷰가 끝나면 통째로 걷어낼 것(메모리에 "검토 후 삭제" 로 적혀 있다).
- 배포 대상이 둘이면 §4-3 의 IP 추출, HSTS, `next.config.ts` 의 `has: host` 리다이렉트·`/contract` 리라이트 동작이 각각 달라진다. 이 브랜치가 최종적으로 Vercel 로 간다면 CF 관련 잔재는 병합 전에 제거하는 게 맞다.
- `.last-deploy.txt` 는 2026-04-26 으로 멈춰 있다. 추적하지 말거나 갱신할 것.
- `/api/search`(런타임 동적)가 Vercel 서버리스에서 `content/posts` 를 `fs` 로 읽는다(`posts.ts:6-10, 320-346`). Next 의 파일 추적이 `path.join(process.cwd(), "content", "posts")` 를 따라가 번들에 포함하는지는 빌드 산출물(`.next/server/…/route.js.nft.json`) 또는 프로덕션에서 `/api/search` 응답에 `"kind":"글"` 항목이 있는지로 확인해야 한다. 빠지면 `existsSync` 가 false 라 **오류 없이 글만 조용히 사라진다** [검증필요]. 안전장치: `outputFileTracingIncludes: { "/api/search": ["./content/posts/**"] }` 또는 `/api/search` 를 `export const dynamic = "force-static"` 으로 빌드타임 고정(글은 배포 때만 바뀌므로 이게 더 맞다).

### 9-4. 관측·운영 — P2-N
- `not-found.tsx` 없음 → 영어 기본 "This page could not be found" 가 헤더/푸터 사이에 뜬다(확인). `error.tsx`/`global-error.tsx` 없음 → 클라이언트 런타임 오류(예: 두 스크롤 엔진 충돌) 시 빈 화면.
- 오류 수집(Sentry 류)·업타임 감시 없음. 문의 API 실패는 `console.error` 로만 남는다(`route.ts:211-213`) — Vercel 로그 보존 기간 안에 봐야만 알 수 있다. 문의 폼은 이 사이트의 유일한 전환 지점이니 최소한 실패 알림(Resend 실패 시 대체 경로 또는 로그 알림)은 있어야 한다.
- Vercel Analytics·Speed Insights 는 탑재됐다. CF 프리뷰에서는 스크립트 404 로 무해하게 실패한다.

---

## 10. 비효율·정리 항목 (P3)

| 파일:줄 | 내용 |
|---|---|
| `src/components/home/{diagnostic-checklist,hero-cta-button,hero-parallax,hero-text-reveal,principal-unfold}.tsx`, `services/sticky-scroll-services.tsx`, `motion/{tilt-card,image-reveal}.tsx` | import 0 — 삭제 (875줄) |
| `src/components/motion/index.ts:5-6` | 죽은 `ImageReveal`·`TiltCard` 재수출 |
| `constants.ts:65,79-83,88-94,197` / `posts.ts:375-379` | `pricingUrl`, `heroImages`, `imageCredits`(빈 배열), `navLinks`, `getCategories` 미사용 |
| `public/media/*`, `public/images/profile-chest.jpg` 외 §3-4 목록 | 미참조 자산 ~3.3MB 배포 |
| `output/**`(43파일 12MB), `.last-deploy.txt`, `Logo.png`, `image/image.png`, `HANDOFF_REVIEW.md`, `MEMORY.md` | 저장소 위생 |
| `layout.tsx:24`, `contact/page.tsx:45`, `blog/[slug]/page.tsx:32` | `toSafeJsonLd` 3중 복사 → `lib/` 로 |
| `constants.ts:225` / `portal/page.tsx:12` | 일정 배열 중복 (§2-3) |
| `header.tsx:38-82` | 스크롤마다 `querySelector`+`getBoundingClientRect`; `pathname` 바뀔 때만 판정 요소를 캐시하고 스크롤은 `scrollY < 24` 만 보면 충분 |
| `scroll-cue.tsx:17-32` | 스크롤마다 `scrollHeight` 읽기 → rAF 합치기 또는 `IntersectionObserver` 로 바닥 감지 |
| `promo-motion.tsx:57` | `window.__lenis` 전역 노출 |
| `about-opening.tsx:71-73` | `dispatchEvent(new Event("scroll"))` 로 헤더 깨우기 — 헤더가 `data-film` 속성을 관찰하도록 바꾸면 사라지는 우회 |
| `services/[slug]/page.tsx:168,263` | `&& length` → `0` 렌더링 잠재 |
| `blog-content.tsx:20-28` | `TitleWithTail` 이 마지막 글자가 `?`·`)` 여도 색칠 |
| `schedule-cube.tsx:42-60` | 모듈 캐시(`cached`, `todayCache`)가 탭을 오래 열어 두면 날짜가 안 넘어감 |
| README | `CONTACT_RATE_LIMIT_REQUIRE_SHARED`, `NEXT_PUBLIC_*_SITE_VERIFICATION` 문서 누락; Vercel 전용 서술 |
| `docs/IA_V2.md`, `constants.ts:131` | 삭제된 `IA_MENU_PLAN.md` 참조 |

---

## 11. Next 16 관례 대조 (`node_modules/next/dist/docs`)

- `proxy.ts`(구 `middleware`)는 쓰지 않는다. 헤더·리다이렉트는 `next.config.ts` 로 처리 — 정적 사이트에 적합.
- `params`/`searchParams` 를 `Promise` 로 `await` — 16 규약 준수(`services/[slug]`, `blog/[slug]`, `contact`).
- `useSearchParams` 를 `Suspense` 로 감쌈(`blog/page.tsx:64-69`) — 문서대로.
- Route Handler `GET` 은 15 이후 기본 동적(`route.md:669`). `llms.txt` 는 `force-static` 으로 명시했지만 `api/search` 는 아니다 → §9-3.
- 문서의 `unstable_instant`/Cache Components 는 미사용. 이 사이트는 거의 전부 정적이라 필요 없다.
- CSP nonce 가이드는 동적 렌더링 전제(`content-security-policy.md:38`) — 현 설계와 상충, §4-2 의 절충 유지.
- `next/font` 대신 수동 `<link rel="stylesheet">`(`layout.tsx:136-141`)는 unicode-range 분할 때문이라는 이유가 타당하며 `eslint-disable` 도 명시적이다.

---

## 12. 권고 순서

**병합 전 (P1)**
1. `/portal` metadata 에 `alternates.canonical: "/portal"` (A).
2. `about-opening.tsx:216` `div` → `h1` (B).
3. `promo-motion.tsx` 의 `new Lenis` 제거, `useLenis()` 인스턴스로 ScrollTrigger 프록시 (C). 수정 후 브라우저에서 `/` 스크롤·약속 홀드 동작 확인.
4. 문의 맥락 전달: `contact/page.tsx` 에서 `type/output` 읽기, 폼에 `type` 포함, `CONTACT_TYPE_OPTIONS` 를 8개 서비스명과 일치시키기, 제목 포맷 정리 (D).
5. 개인정보처리방침 페이지 + 폼 동의 체크 + 서버 검증 (E).
6. 일정 배열 단일화 + 영업일 보정 (F).
7. 업무경험 글 최소 1편 또는 0편일 때 메뉴 항목 숨김 (G).
8. 모바일 SSR: flat 판을 정적 마크업으로 함께 내보내고 CSS 로 가르기 (H). 실측: 390px 뷰포트에서 JS 차단 후 첫 페인트 스크린샷.
9. 메가메뉴 키보드: ArrowDown 시 판 첫 링크로 포커스, `onBlur` 판정에 판 포함 (I).

**병합 직후 (P2)**
- J 뒤로가기 복원, K `opengraph-image`, L 제목·llms.txt·hint 정리, M `/pricing` 결정, N `not-found.tsx`/`error.tsx`, O Vitest + Playwright 스모크, P 자산 캐시 헤더(프로덕션에서 `curl -I` 로 확인), Q `initial={false}`, R 푸터 문구, S FAQ JSON-LD, T `lastChecked` 갱신 루틴 + 90일 경고.

**그 다음 (부채)**
- §3-5 의 다섯 항목. 특히 `promo-motion.tsx`·`service-merge.tsx` 를 타입 있는 훅으로 분해하는 작업은 홈/포털을 다시 손댈 때마다 회귀 비용을 줄여 준다.

---

## 13. 검증이 더 필요한 항목 (내가 확인하지 못한 것)

| 항목 | 어떻게 확인하나 |
|---|---|
| 이중 Lenis 의 체감 증상(C) | 데스크톱 브라우저에서 `/` 휠 스크롤, `window.__lenis` 와 provider 인스턴스 둘 다 `isScrolling` 인지, 약속 구간 홀드 여부 |
| 메가메뉴 키보드(I) | Tab → SERVICE → ArrowDown → Tab 순서로 판 링크에 닿는지 |
| 모바일 첫 페인트(H) | 390×844, 네트워크 Slow 3G, JS 차단 상태 스크린샷 |
| 하이드레이션 깜빡임(Q) | 필름스트립 캡처 |
| 프로덕션 캐시 헤더(P)·HSTS | `curl -I https://www.meridianco.kr/fonts/pretendard/PretendardVariable.css` 등 |
| `/api/search` 에 글 포함 여부(§9-3) | 프로덕션 응답에서 `"kind":"글"` 개수 = 54 |
| 포털 `SchedulePopup` 이 지난 일정을 거르는지 | `schedule-popup.tsx` 본문 확인(이번 검토에서 머리말만 읽음) |
| 홈 JS 1MB 의 라이브러리별 몫 | `next build` 후 청크 분석(Codex 빌드 결과 활용) |
| npm audit / lint / build 결과 | Codex 담당 |

---

*저장소 파일은 하나도 수정하지 않았다. 이 보고서와 임시 덤프(`/tmp/accounting-review-20260911/_*.txt|html`)만 생성했다.*
