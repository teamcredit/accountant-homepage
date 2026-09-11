# UI/UX 개선 구현 및 검증 보고서

2026-09-11 · `feat/menu-ia` · 기준 커밋 `9b6f13c4ab9cb82c1894be684c354395cfd72f49`

기존 화면을 기준으로 프론트엔드의 문의·탐색·애니메이션 구조를 수정했다. 전면 재작성 대신 화면 컴포넌트와 동작 코드를 분리하고, 실제 브라우저에서 발견한 결함을 고쳤다. 새 백엔드 구현과 운영 배포는 포함하지 않았다. 원래 [실행 계획](../README.md)은 계획 당시 문서로 보존하며, 실제 수행 범위와 예외는 이 문서를 기준으로 판단한다.

## 1. 구현 내용

| 단계 | 구현 및 결과 | 남은 범위·판단 |
|---|---|---|
| UI-00 화면 기준선 | 수정 전 production build와 수정 후 데스크톱/모바일 10개 경로의 화면·실제 휠 스크롤·역방향 이동·영상·trace 수집 | 장면마다 정확한 0/25/50/75/100%를 고정한 픽셀 회귀 시스템까지 만들지는 않음 |
| UI-01 검증 환경 | Playwright Chromium/모바일 Chromium/WebKit/Firefox, axe, CI 브라우저 검증 및 실패 trace 추가. Next 16.3.4와 호환 의존성으로 업데이트 | CI 구성은 로컬 검증 완료, 원격 GitHub 실행·배포는 하지 않음 |
| UI-02 문의·견적 | 서비스 선택과 견적 조건을 문의 초안으로 전달. URL 입력 범위·버전 검증, 중복 옵션 중복 과금 방지, 잘못된 링크 안내. 전송 중 잠금, 실패/429/20초 지연 안내와 입력 보존 | API가 잘못 성공을 반환하는 문제는 BE-01로 남음. 모의 성공 테스트는 실제 메일 배달 증거가 아님 |
| UI-03 탐색 | 데스크톱 메뉴 키보드, 모바일 메뉴·일정 팝업 포커스 가두기/복귀·배경 inert·스크롤 잠금 통합. 검색 오류/재시도/키보드/한글 조합 처리. 고객 탭 hash/history, 블로그 페이지·필터·뒤로가기 복원 | 외부 업무 앱의 로그인·업무 처리까지 검증하지 않음 |
| UI-04 정보·SEO | 일정 데이터 통합, 서울 날짜 기준 D-day·자정 갱신·만료 숨김. canonical/OG/한국어 제목/가격 페이지 noindex, 안전한 JSON-LD, 오류·404 화면, 빈 카테고리 안내, 푸터 정리 | 기존 세무 글 51건의 편집 검토 필요. 검토 날짜를 임의로 갱신하지 않음 |
| UI-05 애니메이션 | Lenis 단일화. PromoMotion/ServiceMerge의 JSX와 장면 제어 분리, 타입 검사 복구, 자신이 생성한 이벤트·observer·RAF·GSAP만 정리. 데모의 innerHTML 갱신을 React 상태로 이관 | 기존 장면의 위치 계산·타이밍은 유지. 모든 수식을 새 레이아웃 엔진으로 바꾸는 재작성은 하지 않음 |
| UI-06 초기 표시·미디어 | 안정된 template/AnimateOnScroll 출력, JS 없이도 주요 본문 표시. reduced-motion 첫 렌더 일치. 영상 poster, 화면 밖·백그라운드·동작 줄이기 설정에서 영상 정지 | 기존 브랜드 폰트 유지. 성능 수치는 아래 측정 결과와 한계 참조 |
| UI-07 정리 | 데모 스타일 선택자 범위화, 타입 검사 해제 제거, 일정·데모 수치 중복 제거, 생성물 추적 정리 | 전역 CSS 전체를 CSS Modules로 옮기지는 않음. 로컬 배포 설정과 prototypes는 보존 |
| UI-08 인수 | 브라우저 기능 검사, 반응형 경계 검사, 공개 URL 전수 응답 확인, 접근성·수명주기·화면 비교 | 실기기 iPhone, 실제 200% 브라우저 확대, 운영 CDN/외부 앱/메일 배달 검증은 별도 |

## 2. 구조상 달라진 점

- `promo-motion.tsx`는 화면 루트와 설정 변경을 연결하고, `promo-scenes.ts`가 이벤트·타이머·observer의 수명주기를 책임진다. 전역 ScrollTrigger 일괄 삭제와 중복 Lenis를 제거했다.
- `service-merge.tsx`는 화면을 렌더하고, `service-merge-scene.ts`가 카드 합류 장면을 제어한다. 장식용 복제 DOM은 중복 ID를 없애고 inert 처리했다.
- `evidence-demo.tsx`는 기간·지표·행·계산식을 React 상태로 렌더한다. 화면의 수치를 직접 innerHTML로 덮어쓰지 않는다. 예시 영업이익은 인건비를 일관되게 차감하도록 수정했다.
- `use-dialog.ts`가 모달 초점과 스크롤 잠금의 공통 책임을 갖는다. Safari 터치에서 트리거가 자동으로 초점을 받지 않는 경우도 명시적으로 복귀시킨다.
- `use-media.ts`의 서버 스냅샷을 통해 동작 줄이기 설정에서도 첫 클라이언트 출력이 서버 HTML과 일치하게 했다. Motion의 환경값으로 첫 렌더에서 바로 다른 DOM을 선택하던 경로를 정리했다.
- `schedule.ts`, `use-today.ts`로 일정과 날짜 계산을 통합했다. `json-ld.ts`는 구조화 데이터의 안전한 직렬화를 담당한다.

## 3. 화면 보존과 의도한 변경

[의도한 변경 목록](./intentional-changes.md)에 별도로 기록했다. 기존 영상·워드마크·브랜드 색·폰트·섹션 순서·스크롤 장면의 인상은 유지했다. 정상 모션 캡처를 비교했으며, 모션을 모두 끈 이미지로 보존 여부를 판정하지 않았다.

선별 화면: [모바일 첫 화면](./evidence/home-mobile.png), [홈 대화 장면](./evidence/home-motion-desktop.png), [포털 카드 장면](./evidence/portal-motion-desktop.png).

로컬 원본 증거는 `artifacts/before/`와 `artifacts/verified/`에 있다. 각 manifest는 경로·viewport·장면·브라우저 버전과 JS 오류를 기록한다. 두 세트 모두 10개 경로 × 2개 화면 크기이며 영상·trace를 포함한다. `artifacts/final/`은 중간에 중단된 캡처여서 인수 증거로 사용하지 않는다. `verified` 캡처 후 검색 초점 타이머와 reduced-motion 초기화가 추가 수정되었으므로 해당 설정의 최종 판정은 회귀 테스트 결과를 함께 본다.

## 4. 검증 결과와 재현

최종 실행 결과는 [검증 요약](./validation.md)에 기록한다. 아래 증거는 최종 브라우저 검사 및 로컬 production build를 기준으로 한다.

- [반응형 결과](./evidence/responsive.json): 12개 폭 × 4개 경로, 48개 조합. 주요 breakpoint 양쪽을 포함해 가로 넘침 없음.
- [URL 결과](./evidence/routes.json): sitemap 공개 URL 69개와 가격 페이지, 없는 경로를 포함한 71개 응답 검사. 정상 70개는 200, 없는 경로는 404. 서비스 상세 9개 화면과 canonical도 확인.
- [수명주기 결과](./evidence/lifecycle.json): client navigation 10회 순환, 같은 document에서 오류 없이 실행. 대기 RAF는 3~4개로 유지. 이는 전체 heap·모든 타이머의 메모리 누수 부재를 증명하는 측정은 아니다.
- 실제 문의 발송은 route mock으로 차단했다. 응답 200/429/503 및 지연, 선택 맥락과 입력 보존을 확인한다.
- 접근성 검사에 남는 장식용 대형 고객 단계 번호의 대비 경고와 heading-order/skip-link landmark 경고는 분리 기록한다. 자동 검사 전체가 0건이라는 의미는 아니다.

재현 순서:

```sh
npm ci
npm run lint
npm run audit:content
npm run build
npx playwright install chromium firefox webkit
```

별도 터미널에서 `node scripts/qa/https.mjs` 실행 후 `QA_BASE_URL=https://localhost:3443 npm run test:e2e -- --workers=4`. Playwright가 production 서버를 띄운다. 자체 서명된 로컬 HTTPS를 사용하는 이유는 실제 CSP의 `upgrade-insecure-requests`를 제거하지 않고 WebKit을 검증하기 위해서다.

캡처·추가 검사는 production 서버가 3100에서 실행 중일 때 `npm run qa:capture -- review`, `node scripts/qa/audit.mjs`, `node scripts/qa/lifecycle.mjs`로 수행한다. 캡처 도중 `.next`를 다시 빌드하면 기존 서버의 manifest와 달라지므로 반드시 캡처 종료 → 서버 종료 → build → 서버 재시작 순서를 지킨다.

## 5. 배포 전 남은 일

1. **BE-01 문의 API 실패 판정**: Resend가 오류 객체를 반환해도 성공으로 처리하는 기존 문제를 수정하고 실제 수신까지 검증해야 한다. UI 수정만으로 해결되지 않았다.
2. **BE-02 등 서버 후속**: rate limit 장애 정책, 요청 추적·재시도·중복 방지 등은 [백엔드 후속 목록](../backend-backlog.md)을 따른다. 이번 작업에서 `src/app/api` 구현은 변경하지 않았다.
3. **운영 콘텐츠**: 오래된 글 51건과 데모 화면의 영업상 수치를 담당자가 검토해야 한다. 사례가 없는 카테고리는 빈 상태 안내를 제공한다.
4. **세무 일정 갱신**: 확인된 2026년 10월 일정만 게시한다. 2027년 1월 25일은 틀렸다고 단정한 것이 아니라 공식 일정 미게시로 보류한 항목이다. 다음 공식 일정이 게시되면 갱신한다.
5. **운영 확인**: 실제 도메인의 CDN/cache/영상 전송·외부 대시보드/계약 앱·실기기 접근성·메일 배달을 검증한다. 신규 로그인·회원 관리·업무용 백엔드는 이번 영업 사이트 UI 개선에 추가하지 않았다.

`output/`의 기존 이미지·로그 43개는 Git 추적에서만 제외했고 로컬 파일은 보존했다. 이 항목들은 staged deletion으로 보일 수 있다. `prototypes/`, 개인 배포 설정, 자격 증명은 변경하지 않았다. 의존성 설치로 로컬의 extraneous 패키지는 정리되었고, 별도 미추적 Cloudflare 배포 설정은 홈페이지 TypeScript 검사에서 제외했다. 운영 배포 도구가 필요하면 해당 환경에서 별도 의존성을 구성해야 한다.

배포·push·merge는 수행하지 않았다. 이 결과는 프론트엔드 개선과 로컬 검증이며 사이트 전체의 운영 준비 완료 선언이 아니다.
