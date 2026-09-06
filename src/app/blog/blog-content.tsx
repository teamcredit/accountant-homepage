"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimateOnScroll } from "@/components/motion";
import { insightCategories } from "@/lib/constants";
import { getCategoryStyle } from "@/lib/category-colors";
import { splitHeadline } from "@/lib/headline";
import type { PostMeta } from "@/lib/posts";
import type { FaqItem } from "@/lib/faq";

interface BlogContentProps {
  posts: PostMeta[];
  faq: FaqItem[];
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


/* 한 판에 몇 장. 12 는 3열 × 4줄 · 4열 × 3줄에 다 맞아떨어진다. */
const PER_PAGE = 12;
/* 맨 위에서 돌려 보는 글 수. */
const LEAD_N = 5;

export default function BlogContent({ posts, faq }: BlogContentProps) {
  /* 고른 갈래를 화면 안에만 담아 두면 상단 메뉴의 「인사이트 → 법인세」가
     아무 일도 못 한다. 주소에 적어 두면 메뉴도 링크도 되고, 그 화면을
     그대로 남에게 보낼 수도 있다. */
  const router = useRouter();
  const params = useSearchParams();
  const active =
    insightCategories.find((c) => c.slug === params.get("cat")) ??
    insightCategories[0];

  /* 찾는 말 · 몇 번째 판 · 어느 탭인지는 주소에 안 적는다 — 갈래와 달리
     남에게 보낼 일이 없고, 적으면 뒤로 가기가 글자 하나마다 쌓인다. */
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"posts" | "faq">("posts");
  const [lead, setLead] = useState(0);
  const [open, setOpen] = useState<number | null>(0);

  const countOf = (match: string[]) =>
    match.length === 0
      ? posts.length
      : posts.filter((p) => match.includes(p.category)).length;

  const filtered = useMemo(() => {
    const byCat =
      active.match.length === 0
        ? posts
        : posts.filter((p) => active.match.includes(p.category));
    const needle = q.trim().toLowerCase();
    if (!needle) return byCat;
    /* 제목 · 요약 · 열쇳말까지 본다. 제목만 보면 「가지급금」처럼 본문에만
       나오는 말로는 아무것도 안 걸린다. */
    return byCat.filter((p) =>
      [p.title, p.description, p.category, ...(p.keywords ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [posts, active, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  /* 맨 위 다섯 장은 늘 최신순이다 — 갈래를 골라도 안 바뀐다. 여기는
     「무엇이 새로 올라왔나」를 보는 자리고, 아래가 고르는 자리다. */
  const leads = posts.slice(0, LEAD_N);
  const heroPost = leads[lead];

  const pick = (slug: string) => {
    setPage(1);
    router.replace(slug === "all" ? "/blog" : `/blog?cat=${slug}`, { scroll: false });
  };

  return (
    <section className="ins">
      <div className="ins-in">
        {/* ── 맨 위 한 장. 글이 왼쪽, 표지가 오른쪽. ── */}
        {heroPost && (
          <AnimateOnScroll variant="fadeUp">
            <div className="ins-lead">
              <div className="ins-lead-text">
                {/* 위 묶음은 사진 윗변에, 아래 묶음은 사진 아랫변에 맞춘다.
                    가운데 정렬로 두면 제목이 사진 한복판에 떠서 두 칸이
                    따로 놀았다. */}
                <div className="ins-lead-top">
                <p className="ins-lead-tag">
                  <span>인사이트</span>
                  <i aria-hidden>|</i>
                  <b style={{ color: getCategoryStyle(heroPost.category, false).color }}>
                    {heroPost.category}
                  </b>
                </p>
                <h2 className="ins-lead-title">
                  <Link href={`/blog/${heroPost.slug}`}>
                    <TitleWithTail title={heroPost.title} />
                  </Link>
                </h2>
                </div>

                <div className="ins-lead-bot">
                <p className="ins-lead-excerpt">{heroPost.description}</p>

                {/* 다섯 장을 돌려 본다. 자동으로 넘어가지 않는다 —
                    읽는 중에 바뀌면 방금 본 글을 다시 찾아야 한다. */}
                <div className="ins-step">
                  <button
                    type="button"
                    onClick={() => setLead((v) => (v - 1 + LEAD_N) % LEAD_N)}
                    aria-label="이전 글"
                  >
                    <Chevron dir="left" />
                  </button>
                  <span>
                    <b>{lead + 1}</b> / {LEAD_N}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLead((v) => (v + 1) % LEAD_N)}
                    aria-label="다음 글"
                  >
                    <Chevron dir="right" />
                  </button>
                </div>
                </div>
              </div>

              <Link href={`/blog/${heroPost.slug}`} className="ins-lead-thumb">
                {heroPost.coverImage ? (
                  <Image
                    src={heroPost.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 55vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <CardNews post={heroPost} />
                )}
              </Link>
            </div>
          </AnimateOnScroll>
        )}

        {/* ── 탭 + 찾기 ── */}
        <div className="ins-bar">
          <div className="ins-tabs" role="tablist" aria-label="인사이트 갈래">
            {([
              ["posts", "인사이트"],
              ["faq", "자주 묻는 질문"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={tab === key ? "is-on" : undefined}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "posts" && (
            <div className="ins-search">
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="검색어를 입력하세요"
                aria-label="인사이트 검색"
              />
              <span className="ins-search-go" aria-hidden>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                     strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7.2" cy="7.2" r="4.4" />
                  <path d="m10.6 10.6 3 3" />
                </svg>
              </span>
            </div>
          )}
        </div>

        {tab === "posts" && (
          <>
            <nav className="ins-cats" aria-label="갈래">
              {insightCategories.map((c, i) => (
                <span key={c.slug} className="contents">
                  {i > 0 && <i aria-hidden>|</i>}
                  <button
                    type="button"
                    onClick={() => pick(c.slug)}
                    aria-current={active.slug === c.slug ? "page" : undefined}
                  >
                    {c.label}
                    <em>{countOf(c.match)}</em>
                  </button>
                </span>
              ))}
            </nav>

            {shown.length > 0 && (
              <ul className="ins-grid">
                {shown.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="ins-card">
                      <span className="ins-thumb">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt=""
                            fill
                            sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-top"
                          />
                        ) : (
                          <CardNews post={post} />
                        )}
                      </span>
                      <span className="ins-body">
                        <span className="ins-meta">
                          <b style={{ color: getCategoryStyle(post.category, false).color }}>
                            {post.category}
                          </b>
                          <i aria-hidden>|</i>
                          <time dateTime={post.date}>{post.date}</time>
                        </span>
                        <h3 className="ins-title">
                          <TitleWithTail title={post.title} />
                        </h3>
                        <span className="ins-excerpt">{post.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {filtered.length === 0 && (
              <p className="ins-empty">
                {q.trim()
                  ? `「${q.trim()}」에 걸리는 글이 없습니다.`
                  : "이 갈래엔 아직 글이 없습니다."}
              </p>
            )}

            {pages > 1 && (
              <nav className="ins-pager" aria-label="페이지">
                <button
                  type="button"
                  onClick={() => setPage(cur - 1)}
                  disabled={cur === 1}
                  aria-label="이전 판"
                >
                  <Chevron dir="left" />
                </button>
                <span className="ins-pager-n">
                  {Array.from({ length: pages }, (_, i) => i + 1)
                    /* 판이 많으면 앞뒤 한 칸과 처음 · 끝만 세운다. 마흔 칸을
                       다 세우면 그 줄이 목록보다 길어진다. */
                    .filter((n) => n === 1 || n === pages || Math.abs(n - cur) <= 1)
                    .map((n, i, arr) => (
                      <span key={n} className="contents">
                        {i > 0 && arr[i - 1] !== n - 1 && <em aria-hidden>…</em>}
                        <button
                          type="button"
                          onClick={() => setPage(n)}
                          aria-current={n === cur ? "page" : undefined}
                        >
                          {n}
                        </button>
                      </span>
                    ))}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(cur + 1)}
                  disabled={cur === pages}
                  aria-label="다음 판"
                >
                  <Chevron dir="right" />
                </button>
              </nav>
            )}
          </>
        )}

        {/* ── 자주 묻는 질문. 컨택트 페이지에 있던 것을 여기로 옮겼다. ── */}
        {tab === "faq" && (
          <ul className="ins-faq">
            {faq.map((item, i) => (
              <li key={item.q} className={open === i ? "is-open" : undefined}>
                <button
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="ins-faq-q">{item.q}</span>
                  <span className="ins-faq-mark" aria-hidden />
                </button>
                {open === i && <p className="ins-faq-a">{item.a}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* 화살괄호 하나. 앞뒤 · 페이지 · 돌려보기가 전부 이걸 쓴다. */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="M10 3 5 8l5 5" /> : <path d="m6 3 5 5-5 5" />}
    </svg>
  );
}
