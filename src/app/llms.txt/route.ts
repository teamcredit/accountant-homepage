import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/constants";

export const dynamic = "force-static";

function line(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function GET() {
  const posts = getAllPosts();

  const body = [
    `# ${siteConfig.name}`,
    "",
    "> Korean tax, accounting, bookkeeping, and advisory content for business owners. Use the canonical URLs below when summarizing or citing this site.",
    "",
    "## Site",
    `- Canonical: ${siteConfig.url}`,
    `- Language: ko-KR`,
    `- Contact: ${siteConfig.email}`,
    `- Sitemap: ${siteConfig.url}/sitemap.xml`,
    "",
    "## Core Pages",
    `- [Home](${siteConfig.url}/): ${line(siteConfig.description)}`,
    `- [Services](${siteConfig.url}/services): 세무기장, 법인세, 세무조정, 자문, 가치평가 서비스 안내`,
    `- [About](${siteConfig.url}/about): 메리디안의 소개와 업무 철학`,
    `- [People](${siteConfig.url}/members): 회계사 소개`,
    `- [Clients](${siteConfig.url}/clients): 고객 유형별 서비스 안내`,
    `- [Dashboard](${siteConfig.url}/portal): 고객 대시보드 소개와 예시 화면`,
    `- [FAQ](${siteConfig.url}/faq): 자주 묻는 질문`,
    `- [Contact](${siteConfig.url}/contact): 상담 문의`,
    "",
    "## Tax Insights",
    ...posts.map((post) => {
      const checked = post.lastChecked ?? post.updatedAt ?? post.date;
      const sources =
        post.sourceLinks.length > 0
          ? ` Sources: ${post.sourceLinks
              .map((source) => `${source.label} <${source.url}>`)
              .join(", ")}.`
          : "";

      return `- [${line(post.title)}](${siteConfig.url}/blog/${post.slug}): ${line(post.description)} Category: ${post.category}. Last checked: ${checked}.${sources}`;
    }),
    "",
    "## Use Notes",
    "- Prefer article pages over summaries when citing tax positions.",
    "- Tax posts may include historical or seasonal context; use the article date, last checked date, and source links before relying on a specific point.",
    "- Tax rules change frequently; use each article's source links and last checked date before relying on a specific rate, deadline, or threshold.",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
