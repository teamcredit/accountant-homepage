# 문의 페이지 Cloudflare 1102 대응

기존 배포 `c112e11` 이후 `/contact`에서 1102 오류가 보고됐다. Cloudflare의 최근 24시간 Worker 통계에는 `exceededResources` 9건이 있었다. 이는 Worker 전체 집계로, 해당 9건 전부의 URL이 `/contact`였다고 단정하지 않는다. 조사 중 직접 요청 8회는 200이었지만, 실시간 로그에서 기존 `/contact` 요청의 CPU 사용 시간이 249ms로 확인됐다. 정상 응답이 한 번 나왔다고 한도 초과 가능성이 해소되는 것은 아니다.

기존 구현은 문의 초안을 URL에서 읽기 위해 서버 페이지에서 `await searchParams`를 호출했다. 그 결과 고정된 문의 화면까지 매 요청마다 렌더링됐다. 회원별 서버 데이터가 필요 없는 페이지이므로 이 비용을 제거했다.

- `/contact`의 고정 화면과 기본 폼을 빌드 시 생성한다.
- 서비스·견적·기존 message 쿼리 해석을 작은 `ContactInquiry` 클라이언트 컴포넌트로 이동한다.
- Suspense 범위는 폼에 한정하고 기존 폼을 fallback으로 제공한다. JavaScript가 꺼져도 입력 화면과 직접 연락처는 표시된다.
- URL 변경 시 초안을 새로 적용하고, 같은 URL의 일반 입력·오류 재시도에서는 입력 상태를 유지한다.
- 문의 발송 API와 Cloudflare 요금제·리소스 한도는 변경하지 않는다.
- Wrangler가 만든 `.wrangler/` 임시 번들은 소스 lint 대상에서 제외한다.

빌드의 `/contact`가 `ƒ`에서 `○`로 바뀌었고, prerender manifest에 재검증 없는 정적 경로로 등록됐다. 이 조건과 JS 비활성 기본 폼을 회귀 테스트로 추가했다. 서비스 9개 맥락과 견적 전달, 성공·오류·429·timeout의 기존 브라우저 검사도 수행한다. 실제 메일 발송은 mock으로 차단한다.

1102의 정의는 [Cloudflare 오류 문서](https://developers.cloudflare.com/workers/observability/errors/) 참조. 이번 수정은 문의 페이지의 요청별 렌더링 비용을 제거하며, 검색·실제 문의 API 등 다른 동적 경로의 CPU 한도까지 해결했다는 의미는 아니다.
