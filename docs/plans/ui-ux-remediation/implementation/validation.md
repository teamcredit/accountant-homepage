# 최종 검증 결과

2026-09-11, macOS 로컬 production build. Chromium 153, Playwright 1.63.0의 Firefox/WebKit 엔진. WebKit 모바일 에뮬레이션은 실제 iPhone 검사를 대체하지 않는다.

| 검사 | 결과 |
|---|---|
| production build | 통과. Next 16.3.4, TypeScript 검사 포함 |
| ESLint | 오류 0, 기존 raw img 사용 경고 3 |
| 기능 E2E | **60/60 통과**, 최종 실행 51.7초. 15개 시나리오 × 4개 브라우저/viewport 프로젝트 |
| reduced-motion | 네 프로젝트 모두 hydration 오류 없이 본문 표시. 런타임 설정 변경도 별도 확인 |
| 문의 | 9개 서비스 맥락, 견적 요약, 200/429/503/20초 응답 지연, 입력 보존·전송 중 비활성 확인. 실제 전송은 mock으로 차단 |
| 반응형 | 48개 경로/폭 조합 가로 넘침 0. 별도 동일 페이지 1440→390→844 가로→720→1440 변경에서도 넘침·JS 오류 0 |
| 영상 실패 | mp4 요청 차단 후 poster 존재 및 동작 줄이기 정적 화면 확인 |
| 공개 URL | 71개 응답 검사. 정상 70개 200, 없는 페이지 404 |
| 수명주기 | 10회 client navigation, 대기 RAF 3~4개, JS 오류 0. 전면적인 heap 누수 검사는 아님 |
| axe | 8개 경로 × 2개 폭. JS 오류 0, overflow 0. 남은 대비 예외와 moderate 경고는 아래 설명 |
| npm audit | 알려진 취약점 0 |
| 패키지 서명 | registry signature 518개, attestation 91개 검증 |
| 콘텐츠 감사 | 오류 0, 편집 검토가 오래된 글 51개 경고 |
| git diff --check | 통과 |
| 원격 CI/배포 | 실행하지 않음 |

## 접근성 잔여 항목

`/clients`의 장식용 대형 단계 숫자 `.text-5xl`에서 대비 경고가 데스크톱·모바일 각각 한 건 남는다. `aria-hidden`으로 장식 처리되어 있고 단계 정보는 읽을 수 있는 탭·본문으로 별도 제공된다. 디자인을 유지하는 예외로 기록했다. 이외에는 heading-order 및 skip-link가 landmark 밖에 있다는 moderate 경고가 남는다. 모든 axe 규칙 0건 또는 접근성 인증 통과를 주장하지 않는다. 원본은 [accessibility.json](./evidence/accessibility.json)이다.

실제 200% 브라우저 확대, 스크린리더 실사용, iPhone 실기기, 모든 장면의 정확한 진행률별 픽셀 비교는 완료하지 않았다. 모바일 폭·가로 방향 확인을 이 검사들의 대체 증거로 표시하지 않는다.

## 모바일 성능 — 목표 미달

Lighthouse 13.4.1, Chrome 153, 모바일 기본 에뮬레이션, simulated throttling(RTT 150ms, 1638.4Kbps, CPU 4배), 로컬 production 서버. 다른 브라우저 검사가 끝난 뒤 독립적인 3회를 사용했다. 첫 실행은 마지막 기능 테스트와 일부 겹쳐 제외했다.

| 실행 | Performance | LCP | CLS | TBT |
|---|---:|---:|---:|---:|
| 2 | 62 | 8.67초 | 0 | 35ms |
| 3 | 62 | 8.49초 | 0 | 112.5ms |
| 4 | 63 | 8.40초 | 0 | 33ms |
| 중앙값 | **62** | **8.49초** | **0** | **35ms** |

이전 검토의 단일 측정은 62점/LCP 약 9.5초/CLS 0이었다. 이전 브라우저 버전과 표본 수가 달라 엄밀한 동일 조건 전후 실험은 아니다. **LCP 2.5초 목표는 달성하지 못했다.** 화면 안정성과 스크롤 수명주기 개선이 초기 로드 성능까지 해결했다는 뜻은 아니다.

후속 우선순위:

1. 초기 폰트 요청을 줄인다. 현재 한국어 본문/제목 두 서체의 unicode subset 요청이 많이 발생한다. 브랜드 서체를 무조건 교체하기보다 첫 화면에서 필요한 글리프·스타일의 우선순위와 나머지 본문의 로딩 방식을 분리해 측정한다.
2. 첫 모바일 화면이 클라이언트 초기화 후 레이아웃을 선택하는 비용을 줄인다. 동일한 DOM과 CSS로 모바일·데스크톱 첫 화면을 표현하는 별도 변경을 설계하고 현재 정상 모션과 다시 비교한다.
3. 첫 화면에 필요 없는 장면 코드의 지연 로딩, 실제 사용하지 않는 JS 및 렌더링을 막는 스타일 요청을 줄인다. Lighthouse의 미사용 JS 추정은 약 78KB이며 실제 제거 가능한 양과 동일하지 않다.
4. poster를 WebP/AVIF 등으로 최적화하고 운영 CDN의 캐시·압축·실제 영상 range 전송을 함께 측정한다. 운영 환경을 로컬 결과로 추정하지 않는다.

[측정 요약 JSON](./evidence/performance.json). 전체 Lighthouse JSON은 로컬 `artifacts/acceptance/lighthouse-{2,3,4}.json`에 보관한다.

## 증거와 판정 범위

- [최종 기능 테스트 로그](./evidence/browser-tests.txt)
- [빌드 로그](./evidence/build.txt), [lint 로그](./evidence/lint.txt), [콘텐츠 감사 로그](./evidence/content-audit.txt)
- [반응형](./evidence/responsive.json), [동적 크기 변경·미디어 실패](./evidence/resize-media.json), [URL 검사](./evidence/routes.json), [수명주기](./evidence/lifecycle.json)

프론트엔드의 주요 결함 수정과 기능 회귀 검증은 완료했다. 초기 로드 성능 목표, 전체 접근성 수동 검증, 백엔드 실제 연동과 운영 검증은 남아 있다. 계획의 모든 인수 조건을 충족한 것으로 표시하지 않는다.
