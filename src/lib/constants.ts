import { services } from "./data";

/* 서비스를 나누는 기준. 원본은 여기 하나다.
 *
 * 헤더 메뉴만 「정기 / 사안별」로 갈라 놓고 /services 목록은 01~06 한 줄로
 * 세워 뒀더니, 같은 여섯 개가 화면마다 다르게 묶였다. 메뉴·목록·이동 띠가
 * 전부 이 배열을 본다. */
export const serviceGroups: Array<{ title: string; slugs: string[] }> = [
  {
    title: "정기",
    slugs: ["tax-bookkeeping", "tax-adjustment", "tax-advisory"],
  },
  {
    title: "사안별",
    slugs: ["valuation", "transaction-advisory", "audit-advisory"],
  },
];

/* 묶음 순서대로 편 여섯 개. 목록과 띠는 이 순서로 선다. */
export const orderedServices = serviceGroups.flatMap((g) =>
  g.slugs.map((slug) => {
    const found = services.find((x) => x.slug === slug);
    if (!found) throw new Error(`serviceGroups 에 없는 서비스: ${slug}`);
    return found;
  })
);

export const siteConfig = {
  name: "메리디안 택스 어드바이저리",
  title: "MERIDIAN",
  tagline: "좋은 장부가, 좋은 결정을 만듭니다.",
  description:
    "단순 신고 대행이 아닌 세무 관리. 매일의 장부에서 신고와 자문까지, 한 사람이 끝까지 책임지는 부티크 세무·재무 자문.",
  url: "https://www.meridianco.kr",
  email: "mscpa@dscpa.co.kr",
  kakaoChannelUrl: "https://pf.kakao.com/_xcAyvn",
  location: "Seoul · Online Meeting",
  founder: "박민상 회계사",
  affiliation:
    "박민상 공인회계사는 동성회계법인 소속이며, 본 사이트는 자문 · 인사이트 활동을 소개하기 위한 개인 브랜드 공간입니다. 회계감사 · 세무 기장 · 세무 조정 · 세무 신고 등 법정 업무는 모두 동성회계법인 명의로 정식 수행됩니다.",
  clientPortalUrl: "https://hometax-dashboard.vercel.app",
  pricingUrl: "/pricing",
};

/**
 * Hero background images.
 * 빌딩숲 사진을 public/images/ 아래에 올린 후 경로를 채워주세요.
 * null이면 현재처럼 솔리드 다크 배경 유지.
 *
 * 권장 파일 경로:
 *   public/images/hero-home.jpg     — 1920x1080+ 가로 (홈 히어로)
 *   public/images/hero-about.jpg    — 1920x1080+ 가로 (어바웃 히어로)
 *   public/images/hero-cta.jpg      — 1920x1080+ 가로 (CTA 야경)
 */
export const heroImages = {
  home: null as string | null,
  about: null as string | null,
  cta: null as string | null,
};

/**
 * Image credits — CC BY/CC BY-SA 사진의 attribution.
 * 사진을 다시 추가할 때 채워주세요.
 */
export const imageCredits: Array<{
  title: string;
  photographer: string;
  license: string;
  source: string;
  sourceUrl: string;
}> = [];

/* ─────────────────────────────────────────────────────────────
   글 갈래.

   실제 글은 여섯 갈래인데 뒤 둘이 3편·1편뿐이라 목록에서 한 줄을 차지할
   값을 못 한다. 「세무일반」이 그 셋을 데리고 간다.
   메뉴와 /blog 의 거르는 단추가 이 표 하나를 같이 본다.
   ───────────────────────────────────────────────────────────── */
export const insightCategories = [
  { slug: "all", label: "전체", match: [] as string[] },
  { slug: "corporate", label: "법인세", match: ["법인세"] },
  { slug: "vat", label: "부가가치세", match: ["부가가치세"] },
  { slug: "income", label: "소득세", match: ["소득세"] },
  {
    slug: "general",
    label: "세무일반",
    match: ["세무일반", "원천세·4대보험", "상속·증여세", "기타"],
  },
];

/* ─────────────────────────────────────────────────────────────
   상단 메뉴.

   여섯 칸이다. HOME 과 CONTACT 는 없앴다 — 왼쪽 로고가 이미 홈으로 가고,
   오른쪽 파란 버튼이 이미 문의로 간다. 한 줄에 같은 목적지를 두 번 두지
   않는다. 그 두 자리에 수임료와 대시보드를 넣었다.

   앞에서부터 「누구냐 → 뭘 하냐 → 얼마냐 → 누가 썼냐 → 뭘 아냐 → 어떻게
   보여주냐」 순서다. 수임료가 세 번째인 건, 처음 온 사람이 제일 먼저
   돌아서는 지점이 값을 모를 때라서다.

   자세한 근거는 docs/IA_MENU_PLAN.md.
   ───────────────────────────────────────────────────────────── */
export interface NavItem {
  href: string;
  label: string;
  hint?: string;
}

export interface NavColumn {
  title: string;
  items: NavItem[];
}

export interface NavEntry {
  href: string;
  label: string;
  /* 드롭다운 패널 위에 얹는 영어 눈금. 상단 줄은 한글로만 읽힌다. */
  eyebrow: string;
  items?: NavItem[];
  columns?: NavColumn[];
}

export const navMenu: NavEntry[] = [
  /* ABOUT 은 원페이지다. 앵커뿐이라 펼침판을 둘 게 없다 —
     칸 하나로 두고 눌러서 바로 간다. */
  { href: "/about", label: "ABOUT", eyebrow: "About" },
  {
    href: "/services",
    label: "SERVICE",
    eyebrow: "Service",
    /* 매달 돌아오는 일과 결정할 때만 있는 일은 사는 이유가 다르다.
       한 줄로 여섯 개를 세우면 그 차이가 안 보인다. */
    /* 메뉴도 같은 배열에서 나온다. 손으로 적어 두면 서비스가 하나
       늘었을 때 메뉴만 그대로 남는다. */
    columns: serviceGroups.map((g) => ({
      title: g.title,
      items: g.slugs.map((slug) => {
        const svc = orderedServices.find((x) => x.slug === slug)!;
        return { href: `/services/${slug}`, label: svc.title };
      }),
    })),
  },
  { href: "/members", label: "PEOPLE", eyebrow: "People" },
  { href: "/clients", label: "FOR WHO", eyebrow: "For Who" },
  {
    href: "/blog",
    label: "INSIGHTS",
    eyebrow: "Insights",
    items: insightCategories.map((c) => ({
      href: c.slug === "all" ? "/blog" : `/blog?cat=${c.slug}`,
      label: c.label,
    })),
  },
  { href: "/portal", label: "DASHBOARD", eyebrow: "Portal" },
];

/* 예전 이름. 푸터와 검색이 아직 평면 목록을 쓴다. */
export const navLinks = navMenu.map(({ href, label }) => ({ href, label }));

/* ─────────────────────────────────────────────────────────────
   사람이 도착할 수 있는 모든 페이지.

   검색 색인이 이걸 본다.
   /pricing 과 /preview 는 일부러 뺀다 — robots.ts 가 검색엔진에서 막는
   페이지라, 사이트 안 검색에만 나오면 앞뒤가 안 맞는다.
   ───────────────────────────────────────────────────────────── */
export const sitePages: Array<{ href: string; label: string; hint: string }> = [
  { href: "/", label: "홈", hint: "메리디안" },
  { href: "/about", label: "회사 소개", hint: "메리디안" },
  { href: "/members", label: "회계사 소개", hint: "박민상 회계사" },
  { href: "/services", label: "서비스", hint: "하는 일 여섯 가지" },
  { href: "/clients", label: "고객사", hint: "대표의 단계별" },
  { href: "/blog", label: "INSIGHTS", hint: "글 모음" },
  { href: "/portal", label: "대시보드", hint: "고객 전용 화면" },
  { href: "/contact", label: "문의", hint: "상담 신청" },
];


/* ─────────────────────────────────────────────────────────────
   이번 분기 주요 일정.

   D-day 는 적어 두지 않는다. 하루만 지나도 틀린 숫자가 화면에 남는다.
   날짜만 두고 남은 날은 볼 때마다 센다.
   홈의 팝업과 헤더의 큐브가 이 목록 하나를 같이 본다.
   ───────────────────────────────────────────────────────────── */
export const scheduleDates = [
  { what: "원천세 납부", when: "2026-09-10" },
  { what: "원천세 납부", when: "2026-10-10" },
  { what: "부가세 2기 예정신고", when: "2026-10-25" },
  { what: "부가세 2기 확정신고", when: "2027-01-25" },
];
