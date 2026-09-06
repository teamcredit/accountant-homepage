export interface Service {
  slug: string;
  title: string;
  description: string;
  cta: string; // 서비스별 맥락 있는 CTA 문구
  icon: string;
  details: string[];
  deliverables: string[]; // 클라이언트가 받는 결과물 (보고서 · 모델 · 신고서 등)
  applicableScenarios: string[]; // 어떤 상황에 적용되는가
  regulations?: string[]; // 관련 법령 · 규정 (적용 가능 시)
  /* 이 서비스와 맞물리는 인사이트 갈래. 글 목록을 손으로 붙이지 않고
     갈래만 적어 둔다 — 글이 늘어도 여기는 안 고친다. */
  postTopics?: string[];
}

export interface Member {
  name: string;
  role: string;
  description?: string;
  image?: string;
  credentials?: string[]; // 학력 · 자격 · 수상 (위쪽)
  practiceAreas?: string[]; // 전문 영역 — 실제 specialization
  experience: string[]; // 직장 (아래쪽, 날짜 없음)
  placeholder?: boolean;
}

export interface Persona {
  slug: string;
  title: string;
  englishLabel: string;
  /* 「|」 는 줄을 끊는 자리다. 화면에서 그 표시로 나눠 세운다. */
  description: string;
  bottlenecks: string[];
  outputs: string[];
  fitServices: string[];
}

export const services: Service[] = [
  {
    slug: "tax-bookkeeping",
    title: "세무 기장",
    description:
      "월별 장부를 정리하고, 부가세·원천세 신고 일정을 운영합니다. 매달 같은 기준으로 숫자가 떨어집니다. 대표가 그 자리에서 보고 판단합니다.",
    cta: "기장 범위 보기",
    icon: "ledger",
    details: [
      "법인 · 개인사업자 월별 장부 작성 및 계정 분류",
      "자료 요청 루틴 설계 및 증빙 누락 점검",
      "월별 시산표 · 재무제표 작성 및 주요 변동 검토",
      "부가가치세 · 원천세 신고 일정 운영",
      "인건비 · 4대 보험 관련 기본 신고 연동",
      "기장 이관 시 기존 장부 오류 · 누락 점검",
    ],
    deliverables: [
      "월별 시산표 · 재무제표",
      "자료 요청 리스트 및 마감 일정표",
      "부가가치세 신고서 · 납부 안내",
      "원천세 신고서 · 지급명세서",
      "계정 처리 기준 메모",
      "월별 주요 변동 리포트",
    ],
    applicableScenarios: [
      "결산 일정이 매번 밀리는 경우",
      "기장 이관 후 장부 기준을 다시 세워야 하는 경우",
      "대표가 직접 증빙을 모으느라 반복 손실이 발생하는 경우",
      "부가세 · 원천세 신고 일정이 자주 불안한 경우",
      "월별 숫자를 경영 판단에 바로 쓰고 싶은 경우",
    ],
    regulations: [
      "법인세법 제112조 (장부의 비치 · 기록)",
      "부가가치세법 제48조 · 제49조 (예정 · 확정신고)",
      "소득세법 제160조 (장부의 비치 · 기록)",
      "근로기준법 · 4대 보험 관련 규정",
    ],
    postTopics: ["부가가치세", "원천세·4대보험"],
  },
  {
    slug: "tax-adjustment",
    title: "세무 조정",
    description:
      "법인세·소득세 신고 전에 조정 항목을 정리하고, 공제·감면 적용 여부를 검토합니다. 근거는 문서로 남깁니다. 신고 후 소명 요청이 와도 그 자리에서 꺼낼 수 있도록.",
    cta: "조정 범위 보기",
    icon: "calculator",
    details: [
      "법인세 · 종합소득세 세무조정 검토",
      "익금산입 · 손금불산입 항목 검토",
      "이월결손금 · 세액공제 · 감면 적용 가능성 검토",
      "가지급금 · 특수관계자 거래 등 주요 세무 이슈 점검",
      "전기 대비 차이 분석 및 수정신고 · 경정청구 검토",
      "신고서 제출 전 쟁점 정리 및 최종 검토",
    ],
    deliverables: [
      "세무조정계산서 및 전자신고 자료",
      "주요 조정 항목 검토 메모",
      "공제 · 감면 적용 검토표",
      "전기 대비 차이 분석 메모",
      "신고 일정 및 제출 기준 정리",
    ],
    applicableScenarios: [
      "법인세 신고 직전 검토 기준이 없는 경우",
      "공제 · 감면 적용 여부를 다시 봐야 하는 경우",
      "전기 신고 오류를 정정해야 하는 경우",
      "외감대상 · 성실신고확인대상으로 검토 깊이가 필요한 경우",
      "세무조사 이후 후속 신고를 정리해야 하는 경우",
    ],
    regulations: [
      "법인세법 제60조 (신고와 납부)",
      "법인세법 제52조 (부당행위계산의 부인)",
      "법인세법 시행령 제89조 (시가의 범위 · 가지급금 인정이자)",
      "조세특례제한법 (각종 세액공제 · 감면)",
      "국세기본법 제45조 (수정신고) · 제45조의2 (경정청구)",
    ],
    postTopics: ["법인세", "소득세"],
  },
  {
    slug: "tax-advisory",
    title: "세무 자문",
    description:
      "지분 이동, 승계, 자산 이전, 특수관계자 거래처럼 실행 전에 세금을 먼저 따져야 하는 이슈를 다룹니다. 방안별 세부담을 표로 두고 비교합니다. 대표는 그 표를 보고 결정합니다.",
    cta: "자문 범위 보기",
    icon: "shield",
    details: [
      "법인 · 개인 세부담 시뮬레이션",
      "양도소득세 · 상속세 · 증여세 사전 검토",
      "지분 이동 · 가업승계 · 지배구조 개편 검토",
      "특수관계자 거래 · 부당행위계산 부인 리스크 점검",
      "세무조사 대응 기준 및 소명 방향 정리",
      "조세불복 가능성 및 쟁점 검토",
    ],
    deliverables: [
      "세무 검토 메모",
      "시나리오별 세부담 비교 워크북",
      "방안 비교표 · 권고안",
      "실행 순서 및 유의사항 체크리스트",
      "필요 시 신고 · 가치평가 · 거래 자문 연계안",
    ],
    applicableScenarios: [
      "양도 · 상속 · 증여 의사결정 전에 비교표가 필요한 경우",
      "가업승계 · 지분 정리 방안을 여러 안으로 검토해야 하는 경우",
      "특수관계자 거래 · 가지급금 처리 방향을 정해야 하는 경우",
      "세무조사 전에 대응 기준과 소명 자료를 정리해야 하는 경우",
      "이의신청 · 심사청구 · 심판청구 가능성을 검토해야 하는 경우",
    ],
    regulations: [
      "상속세 및 증여세법 (전반)",
      "소득세법 제104조 이하 (양도소득세)",
      "법인세법 제52조 (부당행위계산 부인)",
      "국세기본법 제55조 이하 (이의신청 · 심사청구 · 심판청구)",
    ],
    postTopics: ["세무일반", "상속·증여세"],
  },
  {
    slug: "valuation",
    title: "기업가치평가",
    description:
      "비상장주식, 투자유치, 승계, 합병 비율 판단에 필요한 평가를 다룹니다. 세법 기준과 거래 기준은 다릅니다. 둘을 구분해, 누가 봐도 같은 결론이 나오는 보고서로 남깁니다.",
    cta: "평가 범위 보기",
    icon: "scale",
    details: [
      "세법상 주식 · 자산 평가 (상속세 및 증여세법, 법인세법)",
      "비상장주식 공정가치 평가 (DCF · 시장접근법 · 자산접근법)",
      "무형자산 가치평가 (영업권, 특허권, 브랜드 등)",
      "스톡옵션 · 전환사채 등 주식연계증권 공정가치 평가",
      "합병 · 분할 시 합병비율 및 분할가액 산정",
      "감정평가법인 · 회계법인 평가 보고서 검토 자문",
    ],
    deliverables: [
      "기업가치평가 보고서 (방법론 · 가정 · 결과)",
      "DCF 모델 (Excel 워크북, 가정 변경 가능 구조)",
      "비교회사 분석 · Comparable Transaction 분석",
      "민감도 분석 (할인율 · 성장률 · 운영 가정)",
      "세법상 평가 의견서 (해당 시)",
    ],
    applicableScenarios: [
      "M&A 거래가격 산정 (Sell-side · Buy-side)",
      "투자 유치 라운드 가치평가",
      "상속 · 증여 시 비상장주식 평가 (상증세법)",
      "합병 · 분할 비율 산정",
      "스톡옵션 · 전환사채 공정가치 평가",
      "회계감사 목적의 손상 평가",
    ],
    regulations: [
      "상속세 및 증여세법 제63조 (보충적 평가방법)",
      "상속세 및 증여세법 시행령 제54조 ~ 제56조",
      "법인세법 시행령 제89조 (시가)",
      "K-IFRS 1113호 · 일반기업회계기준 (공정가치 측정)",
    ],
    postTopics: ["법인세", "상속·증여세"],
  },
  {
    slug: "transaction-advisory",
    title: "M&A · IPO 자문",
    description:
      "매수·매도 실사에서 우발부채와 정상화 조정을 찾고, 거래 구조별 세무·회계 함의를 정리합니다. 딜 전에 짚어둘 항목과 협상에서 부딪힐 쟁점을 문서로 묶어둡니다.",
    cta: "거래 자문 범위 보기",
    icon: "handshake",
    details: [
      "M&A 재무 실사 (Financial Due Diligence)",
      "거래 구조 설계 자문 (주식 양수도 · 영업양수도 · 합병 · 분할)",
      "Sell-side 매각 자문 / Buy-side 인수 자문",
      "IPO 사전 진단 (회계 · 내부통제 · 지배구조)",
      "K-IFRS 전환 준비 및 지정감사 대응 자문",
      "Pre-IPO 가치평가 및 자본구조 설계",
    ],
    deliverables: [
      "재무 실사 보고서 (FDD Report)",
      "Quality of Earnings 분석",
      "Net Debt · Working Capital 정상화 분석",
      "거래 구조 비교 (세무 · 회계 · 법률 함의 정리)",
      "IPO 사전 진단 보고서 (회계 · 내부통제 항목별)",
      "협상 단계 자료 · Q&A 지원",
    ],
    applicableScenarios: [
      "비상장사 매도 (Sell-side advisory)",
      "비상장사 인수 (Buy-side due diligence)",
      "합병 · 분할 시 거래 구조 설계",
      "IPO 준비 전 회계 정비 (Pre-IPO)",
      "K-IFRS 전환 (외감 → 상장 단계)",
      "지정감사 직전 사전 점검",
    ],
    regulations: [
      "자본시장과 금융투자업에 관한 법률",
      "주식회사 등의 외부감사에 관한 법률 (외감법)",
      "K-IFRS · 일반기업회계기준",
      "상법 제522조의3 (소규모합병) · 제530조의2 이하 (분할)",
    ],
    postTopics: ["법인세", "세무일반"],
  },
  {
    slug: "audit-advisory",
    title: "회계감사 · 회계자문",
    description:
      "감사인이 확인할 회계처리, 결산 자료, 내부통제 이슈를 미리 점검합니다. 자료 준비 기준을 잡아 감사 과정의 반복 질의를 줄입니다.",
    cta: "감사 대응 범위 보기",
    icon: "clipboard",
    details: [
      "외부감사 대응 지원 (감사인 커뮤니케이션 · 자료 준비)",
      "회계처리 이슈 사전 검토 · 자문",
      "내부통제 진단 및 개선 자문",
      "K-IFRS · 일반기업회계기준 적용 자문",
      "결산 검토 및 재무제표 작성 지원",
      "지정감사 · 감사인 변경 대응",
    ],
    deliverables: [
      "외부감사 대응 체크리스트",
      "회계처리 검토 의견서",
      "내부통제 진단 보고서",
      "결산 재무제표 (초안 · 최종)",
      "감사인 질의 응답 지원 자료",
    ],
    applicableScenarios: [
      "외감대상 법인의 연간 감사 대응",
      "외감 진입 직전 회계 정비",
      "회계처리 방법 변경 · 오류 수정 검토",
      "내부통제 구축이 필요한 성장기 법인",
      "감사인 지정 · 변경 시 사전 준비",
    ],
    regulations: [
      "주식회사 등의 외부감사에 관한 법률 (외감법)",
      "K-IFRS · 일반기업회계기준",
      "내부회계관리제도 운영규정",
    ],
    postTopics: ["법인세", "세무일반"],
  },
];

export const members: Member[] = [
  {
    name: "박민상",
    role: "공인회계사 · Founder",
    image: "/images/founder.webp",
    credentials: [
      "공인회계사 (KICPA)",
      "성균관대학교 경영학과 졸업",
      "한국공인회계사회 기본 실무 연수 최우수 수료 · 기본 실무 평가 전국 수석",
    ],
    practiceAreas: [
      "세무 기장 · 세무 신고",
      "법인세 · 소득세 세무 조정",
      "비상장주식 가치평가",
      "M&A 재무실사 (FDD)",
      "IPO 사전 회계 정비 · K-IFRS 전환",
      "가치평가 모델링 (DCF · 시장접근법 · 자산접근법 · 파생상품)",
    ],
    experience: [
      "동성회계법인 소속 공인회계사",
      "메리디안 택스 어드바이저리 Founder",
    ],
  },
];

export const personas: Persona[] = [
  {
    slug: "early-stage-founder",
    title: "법인을 막 세운 대표",
    englishLabel: "Early-stage Founder",
    description:
      "설립 직후엔 신고 일정도, 증빙 기준도, 비용 처리 원칙도 비어 있습니다.|이때 기준을 잡아두면 이후 기장과 신고가 가볍습니다.",
    bottlenecks: [
      "부가세 · 원천세 일정과 자료 제출 방식이 정리되지 않음",
      "대표 급여, 비용 처리, 법인카드 사용 기준이 없음",
      "장부가 뒤엉키기 전에 기장 기준을 잡아야 함",
    ],
    outputs: [
      "월별 자료 요청 리스트와 마감 일정표",
      "기본 계정 처리 기준 메모",
      "첫 신고까지 이어지는 기장 세팅",
    ],
    fitServices: ["tax-bookkeeping", "tax-adjustment", "tax-advisory"],
  },
  {
    slug: "growing-ceo",
    title: "매출이 커진 대표",
    englishLabel: "Growing CEO",
    description:
      "거래와 인력이 늘면, 장부를 맞추는 것만으론 부족합니다.|월별 보고와 세무조정이 제때 돌아야 대표가 숫자를 믿습니다.",
    bottlenecks: [
      "결산 일정이 밀리고 월별 숫자 확인이 늦어짐",
      "기장 누락 · 계정 오분류가 누적됨",
      "법인세 신고 전 조정 포인트가 늦게 드러남",
    ],
    outputs: [
      "월별 재무 리포트와 주요 변동 정리",
      "세무조정 검토 메모",
      "리스크 항목과 보완 체크리스트",
    ],
    fitServices: ["tax-bookkeeping", "tax-adjustment", "tax-advisory"],
  },
  {
    slug: "owner-in-transition",
    title: "중요한 결정을 앞둔 대표",
    englishLabel: "Owner in Transition",
    description:
      "지분 이동, 승계, 매각. 큰 결정은 실행 전에 세금과 구조부터 비교합니다.|기장 데이터를 자문까지 이어 쓰면 판단이 빠릅니다.",
    bottlenecks: [
      "법인과 개인 세부담을 따로 봐서 전체 판단이 늦어짐",
      "지분 이동 · 증여 · 승계 안별 차이를 숫자로 비교하지 못함",
      "거래 전 소명 리스크와 실행 순서가 정리되지 않음",
    ],
    outputs: [
      "시나리오별 세부담 비교표",
      "구조 검토 메모와 권고안",
      "실행 순서안 및 후속 신고 체크리스트",
    ],
    fitServices: ["tax-advisory", "tax-adjustment", "valuation", "transaction-advisory"],
  },
];
