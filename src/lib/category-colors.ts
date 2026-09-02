/**
 * 세법 카테고리별 컬러 매핑.
 * Tailwind purge 문제를 피하기 위해 inline style 객체를 반환합니다.
 */

export interface CategoryStyle {
  backgroundColor: string;
  color: string;
}

const LIGHT_STYLES: Record<string, CategoryStyle> = {
  /* 파랑만 브랜드 사다리(accent-50 / accent-700)를 쓴다.
     나머지 6색은 카테고리 구분용이라 그대로 둔다. */
  법인세: { backgroundColor: "#f1f5ff", color: "#1b40cc" },
  소득세: { backgroundColor: "#ecfdf5", color: "#047857" },
  부가가치세: { backgroundColor: "#fffbeb", color: "#b45309" },
  "상속·증여세": { backgroundColor: "#faf5ff", color: "#7e22ce" },
  "원천세·4대보험": { backgroundColor: "#fff1f2", color: "#be123c" },
  세무일반: { backgroundColor: "#f5f5f5", color: "#525252" },
  자문철학: { backgroundColor: "#f1f5f9", color: "#475569" },
};

const DARK_STYLES: Record<string, CategoryStyle> = {
  법인세: { backgroundColor: "rgba(43,91,255,0.2)", color: "#b9c8ff" },
  소득세: { backgroundColor: "rgba(16,185,129,0.2)", color: "#6ee7b7" },
  부가가치세: { backgroundColor: "rgba(245,158,11,0.2)", color: "#fcd34d" },
  "상속·증여세": { backgroundColor: "rgba(168,85,247,0.2)", color: "#c4b5fd" },
  "원천세·4대보험": { backgroundColor: "rgba(244,63,94,0.2)", color: "#fda4af" },
  세무일반: { backgroundColor: "rgba(255,255,255,0.1)", color: "#d4d4d4" },
  자문철학: { backgroundColor: "rgba(255,255,255,0.1)", color: "#cbd5e1" },
};

const FALLBACK_LIGHT: CategoryStyle = { backgroundColor: "#f5f5f5", color: "#525252" };
const FALLBACK_DARK: CategoryStyle = { backgroundColor: "rgba(255,255,255,0.1)", color: "#d4d4d4" };

export function getCategoryStyle(category: string, dark = false): CategoryStyle {
  if (dark) {
    return DARK_STYLES[category] ?? FALLBACK_DARK;
  }
  return LIGHT_STYLES[category] ?? FALLBACK_LIGHT;
}
