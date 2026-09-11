"use client";

/* 대표 회계사. 홈에서는 「펼쳐지는」 방식으로 보인다.

   ABOUT 에 같은 내용이 있으니 홈에서 처음부터 다 펴 놓으면 두 번 읽히는 꼴이다.
   이름과 한 문장만 먼저 두고, 업무 영역은 스크롤이 닿을 때 한 줄씩 열린다.
   히어로의 0° 선이 여기까지 내려와 왼쪽 세로선이 된다.

   움직임을 꺼 둔 사람에게는 전부 펼쳐진 채로 보인다. */

import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion as useReducedMotion } from "@/lib/use-media";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/constants";
import { members } from "@/lib/data";

const AREAS = [
  "세무 기장 · 세무 신고",
  "법인세 · 소득세 세무 조정",
  "비상장주식 가치평가",
  "M&A 재무실사 (FDD)",
  "IPO 사전 회계 정비 · K-IFRS 전환",
  "가치평가 모델링 (DCF · 시장접근법 · 자산접근법 · 파생상품)",
];

/* 먼저 보이는 줄 수. 나머지는 접혀 있다가 「자세히 보기」로 그 자리에서 열린다. */
const FOLD_AT = 3;

/* 펼쳤을 때 같이 나오는 나머지 이력. People 페이지에 있던 것과 같은 자료를 쓴다.
   두 군데에 따로 적어 두면 한쪽만 고쳐져 서로 달라진다. */
const LEAD = members[0];

export default function PrincipalUnfold() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  /* 펼침 방향. 넓은 화면에서는 오른쪽으로 열리고, 좁은 화면에서는 아래로 열린다.
     좁은 화면에서 옆으로 열면 글자가 한 자씩 끊겨 읽을 수 없다.
     CSS 로는 못 가른다 — 여는 값(width/height)이 인라인 스타일로 박히기 때문이다. */
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 981px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* 열고 닫는 값 한 벌. 방향만 바뀌고 나머지는 같다. */
  const fold = (extra: Record<string, number> = {}) =>
    reduced
      ? { initial: false as const, animate: {}, exit: {} }
      : wide
        ? {
            initial: { width: 0, opacity: 0, ...extra },
            animate: { width: "auto", opacity: 1, ...Object.fromEntries(Object.keys(extra).map((k) => [k, 0])) },
            exit: { width: 0, opacity: 0, ...extra },
          }
        : {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
          };

  /* 스프링으로 연다. 정해진 시간을 채우는 transition 과 달리
     중간에 스크롤이 되돌아와도 지금 있는 자리에서 이어진다. */
  const row = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, x: 28 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, amount: 0.6 },
          transition: {
            type: "spring" as const,
            stiffness: 210,
            damping: 26,
            delay: i * 0.07,
          },
        };

  return (
    <div className="pu">
      {/* 세 칸이다 — 사진 | 이름 | 업무 영역.
          이름은 사진 쪽으로 붙여 오른쪽 정렬한다. 사진과 이름이 한 덩어리로 읽히고,
          오른쪽 칸이 읽을거리 하나로 남는다. */}
      <div className="pu-head">
        <div className="pu-shot">
          <img src="/images/profile-chest.jpg" alt="박민상 공인회계사" />
        </div>
        <div className="pu-id">
          <p className="pu-name">박민상<span className="dot-b">.</span></p>
          <p className="pu-role">공인회계사 · Founder · KICPA</p>
        </div>

      {/* 업무 영역. 왼쪽 기준선에서 한 줄씩 밀려 나온다. */}
      <div className="pu-areas">
        <p className="pu-areas-lab">Service Areas</p>
        {/* 파란 기준선은 두 목록을 하나로 감싼 이 칸이 그린다.
            목록을 둘로 나눠 각각 선을 그리면 펼칠 때 선이 끊겨 보인다. */}
        <div className="pu-areas-list">
          <ul>
            {AREAS.slice(0, FOLD_AT).map((a, i) => (
              <motion.li key={a} {...row(i)}>
                {a}
              </motion.li>
            ))}
          </ul>

          {/* 접힌 나머지. 아래로 밀지 않고 앞 목록 오른쪽에 붙어서 열린다.
              바깥 칸이 폭을 0에서 늘리고, 안쪽 목록은 폭이 고정이라
              열리는 동안 글이 다시 접히지 않는다. */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                className="pu-areas-rest"
                {...fold()}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <ul className="pu-areas-rest-in">
                  {AREAS.slice(FOLD_AT).map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 업무 영역 말고도 펼칠 때 같이 나오는 것 — 자격과 경력.
            따로 People 페이지로 보내지 않고 여기서 다 읽게 한다. */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              className="pu-cv"
              initial={reduced ? false : { height: 0, opacity: 0, x: wide ? 48 : 0 }}
              animate={reduced ? {} : { height: "auto", opacity: 1, x: 0 }}
              exit={reduced ? {} : { height: 0, opacity: 0, x: wide ? 48 : 0 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pu-cv-in">
                {LEAD.credentials?.length ? (
                  <div className="pu-cv-grp">
                    <p className="pu-areas-lab">자격 · 학력</p>
                    <ul>
                      {LEAD.credentials.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="pu-cv-grp">
                  <p className="pu-areas-lab">경력</p>
                  <ul>
                    {LEAD.experience.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="pu-more"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "접기 ↑" : "자세히 보기 ↓"}
        </button>
      </div>

        {/* 사람이 하는 말. 사진 아래 왼쪽에 둔다.
            이름표가 아니라 이 사람의 태도라서, 오른쪽 목록과 섞지 않는다. */}
        <p className="pu-say">
          <span className="s">장부 한 줄을 어떻게 적느냐가 다음 결정의 근거가 됩니다.</span>
          <span className="s">계정 분류 하나, 증빙 하나도 그 무게로 다룹니다.</span>
        </p>
      </div>

      {/* 소속. 누구와 계약하는 것인지는 먼저 밝히는 편이 낫다.
          자랑이 아니라 사실이므로 조용한 글자로 둔다. */}
      <div className="pu-aff">
        <p className="pu-areas-lab">Affiliation</p>
        <div className="pu-aff-body">
          <p><b>메리디안 어드바이저리</b>는 박민상 공인회계사가 운영하는 개인 자문 브랜드이며, 별도의 법인이 아닙니다.</p>
          <p>박민상 공인회계사는 <b>동성회계법인</b> 소속이며, 메리디안 어드바이저리를 통해 수임하는 모든 업무는 동성회계법인과의 계약에 따라 수행됩니다.</p>
        </div>
        <div className="pu-aff-contact">
          <p className="pu-areas-lab">Direct Contact</p>
          <p>
            Kakao.{" "}
            <a href={siteConfig.kakaoChannelUrl} target="_blank" rel="noreferrer noopener">
              카카오톡 채널
            </a>
          </p>
          <p>Email. <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
          <p className="pu-aff-loc">{siteConfig.location}</p>
        </div>
      </div>
    </div>
  );
}
