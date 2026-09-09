import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import { AnimateOnScroll, LineReveal } from "@/components/motion";
import BlogContent from "./blog-content";
import HeroVideo from "@/components/layout/hero-video";

export const metadata: Metadata = {
  title: "실무 메모",
  description:
    "사업을 굴리다 자주 부딪히는 세무·회계·거래 이슈를 현장 관점으로 풉니다.",
  openGraph: {
    title: "실무 메모",
    description:
      "사업을 굴리다 자주 부딪히는 세무·회계·거래 이슈를 현장 관점으로 풉니다.",
    type: "website",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="blog-hero page-hero relative overflow-hidden bg-deep text-white">
        {/* 히어로 배경 영상. 사이트 전체가 같은 소재를 쓴다. */}
        <HeroVideo opacity={0.38} />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute right-[-2.5rem] top-1/2 -translate-y-1/2 select-none text-[16rem] font-bold leading-none tracking-tighter">
            BLOG
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1600px] px-6">
          <AnimateOnScroll variant="fadeIn">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-on-deep-muted">
              Blog
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">
              인사이트
            </h1>
          </AnimateOnScroll>

          <div className="mt-6">
            <LineReveal className="h-0.5 w-20 bg-accent-bright" delay={0.3} />
          </div>

          <AnimateOnScroll variant="fadeUp" delay={0.4}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-400">
              사업을 굴리다 자주 부딪히는 세무·회계·거래 이슈.
              현장에서 본 대로 적습니다.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* BlogContent 가 주소의 ?cat= 을 읽는다. 이 페이지는 미리 만들어 두는
          정적 페이지라, Suspense 로 감싸지 않으면 프로덕션 빌드가 깨진다.
          (node_modules/next/dist/docs .../use-search-params.md 의 Prerendering) */}
      <Suspense fallback={null}>
        <BlogContent posts={posts} />
      </Suspense>
    </>
  );
}
