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

export const navLinks = [
  { href: "/", label: "HOME" },
  /* ABOUT 도 메뉴에서 뺐다. 어바웃의 히어로·약속·지켜가는 방식이
     전부 홈 위쪽으로 올라와서 메뉴로 또 들어갈 이유가 없다.
     /about 페이지 자체는 남아 있다 — 링크만 없앤 것이다. */
  { href: "/services", label: "PRACTICE" },
  /* PEOPLE 은 메뉴에서 뺐다. 대표 회계사 한 사람이라 ABOUT 과 겹친다.
     /members 페이지 자체는 남아 있다 — 링크만 없앤 것이다. */
  { href: "/clients", label: "WHO" },
  { href: "/portal", label: "PORTAL" },
  { href: "/blog", label: "INSIGHTS" },
  { href: "/contact", label: "CONTACT" },
];
