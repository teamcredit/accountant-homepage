"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimateOnScroll } from "@/components/motion";
import { getCategoryStyle } from "@/lib/category-colors";
import { splitHeadline } from "@/lib/headline";
import type { PostMeta } from "@/lib/posts";

interface BlogContentProps {
  posts: PostMeta[];
}

/* 제목 마지막 글자만 브랜드색으로.
   레퍼런스가 마지막 글자를 주황으로 찍는데, 우리 브랜드색은 파랑이라 파랑을 쓴다.
   글자 하나에 색을 주면 줄 끝이 어디인지 눈이 먼저 잡는다. */
function TitleWithTail({ title }: { title: string }) {
  const head = title.slice(0, -1);
  const tail = title.slice(-1);
  return (
    <>
      {head}
      <span className="text-accent-bright">{tail}</span>
    </>
  );
}

/* 표지 이미지가 없는 글이 대부분이라(54개 중 51개) 카드가 비지 않게
   제목 앞 20글자로 카드뉴스를 만든다. 문구 자체가 표지다.
   어두운 판을 51장 깔면 화면이 무거워서, 밝은 바탕에 검은 글씨로 뒤집었다.
   카테고리색은 위쪽에 옅게 한 번만 번지게 두고 글자는 먹색으로 읽는다. */
function CardNews({ post }: { post: PostMeta }) {
  const tone = getCategoryStyle(post.category, false);
  const { head, tail } = splitHeadline(post.title);

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center px-4 pb-16 pt-12"
      style={{
        background: `radial-gradient(130% 100% at 15% 0%, ${tone.backgroundColor} 0%, rgba(255,255,255,0) 62%), #FFFFFF`,
      }}
    >
      {/* 앞 20글자. 카드에서 제일 큰 글자라 여기서 다 읽힌다. */}
      <p
        className="text-[19px] font-bold leading-[1.35] tracking-[-0.03em] text-foreground sm:text-[22px]"
        style={{ wordBreak: "keep-all", textWrap: "balance" }}
      >
        {head}
      </p>
      {tail && (
        <p
          className="mt-3 line-clamp-3 border-t pt-3 text-[11.5px] leading-relaxed sm:text-xs"
          style={{
            color: "rgba(0,0,0,0.5)",
            borderColor: "rgba(0,0,0,0.1)",
            wordBreak: "keep-all",
          }}
        >
          {tail}
        </p>
      )}
    </div>
  );
}

export default function BlogContent({ posts }: BlogContentProps) {
  const allCategories = Array.from(new Set(posts.map((p) => p.category)));
  const categories = ["전체", ...allCategories];
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered =
    activeCategory === "전체"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-6">
        <AnimateOnScroll variant="fadeUp">
          <div className="mb-14 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                /* 이건 버튼이 아니라 구분표다. 전역 10px 규칙에서 빼고 pill 로 둔다. */
                className={`rounded-full px-5 py-2.5 text-xs font-medium tracking-wider transition-all duration-200 ${
                  activeCategory === category
                    ? "btn-blue border border-transparent"
                    : "border border-border bg-card text-muted hover:bg-neutral-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </AnimateOnScroll>

        {filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((post) => {
              /* 사진이 있으면 어두운 카드, 없으면 흰 카드.
                 한 그리드에 두 톤이 섞이므로 위/아래 잔글씨 색도 같이 뒤집는다. */
              const light = !post.coverImage;
              const dim = light ? "text-black/45" : "text-white/45";
              const mid = light ? "text-black/60" : "text-white/70";
              const line = light ? "border-black/10" : "border-white/15";
              return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group relative block aspect-square overflow-hidden rounded-[16px] border ${
                  light ? "border-border bg-white" : "border-transparent bg-[#101216]"
                }`}
              >
                {post.coverImage ? (
                  <>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {/* 사진 위에 글씨를 올리니 아래쪽을 눌러 읽히게 한다. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60" />
                    <div className="absolute inset-x-0 bottom-0 px-4 pb-16">
                      <h2 className="line-clamp-3 text-[13px] font-bold leading-snug tracking-tight text-white sm:text-[15px]">
                        <TitleWithTail title={post.title} />
                      </h2>
                    </div>
                  </>
                ) : (
                  <CardNews post={post} />
                )}

                {/* 위: 브랜드 마크 + 카테고리 */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-semibold tracking-tight ${mid}`}>
                      meridian.
                    </span>
                    <span
                      className="text-[11px] font-semibold tracking-tight"
                      style={{ color: getCategoryStyle(post.category, !light).color }}
                    >
                      {post.category}
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs transition-colors duration-300 ${
                      light
                        ? "border-black/15 text-black/50 group-hover:border-accent group-hover:bg-accent group-hover:text-white"
                        : "border-white/30 text-white/80 group-hover:border-white group-hover:bg-white group-hover:text-black"
                    }`}
                  >
                    &#8599;
                  </span>
                </div>

                {/* 아래: 각주 줄 */}
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                  <div className={`flex items-end justify-between gap-3 border-t pt-3 ${line}`}>
                    <span className={`text-[11px] ${dim}`}>meridian.</span>
                    <span className={`text-[11px] tabular-nums ${mid}`}>
                      {post.date}
                    </span>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg text-muted">이 카테고리엔 아직 글이 없습니다.</p>
            <p className="mt-2 text-sm text-subtle">다른 카테고리를 눌러 보세요.</p>
          </div>
        )}
      </div>
    </section>
  );
}
