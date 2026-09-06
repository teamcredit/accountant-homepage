"use client";

/* 사업주들이 실제로 하는 말. 문단으로 늘어놓으면 남 얘기가 되니까
   아이메시지 대화창을 그대로 옮겼다. 회색 말풍선이 한 마디씩 올라오고,
   다 올라온 뒤에야 파란 말풍선(우리 답)이 붙는다.

   언제 몇 마디가 올라와 있는지는 시간이 아니라 「스크롤 위치」가 정한다.
   위(PromiseStage)가 step 을 세어 내려준다. 시간으로 돌리면 스크롤을 빨리
   내린 사람은 대화를 통째로 놓친다.

   말풍선은 두 개가 아니라 하나다. 점 세 개가 뜬 그 말풍선이 그대로 부풀면서
   말이 들어찬다. 점 풍선과 말 풍선을 따로 두면 둘이 같이 보여서 대화가 아니라
   목록이 된다 — 다시 나누지 말 것.

   마지막 한 마디는 느리게 켜지면서 살짝 부풀었다 가라앉는다. 거기가 이 대화의
   끝이라는 표시다. 그 다음 손님 말은 왼쪽으로, 우리 말은 오른쪽으로 날아간다.

   움직임을 꺼 둔 사람에게는 전부 켜진 상태로 한 번에 보인다. */

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Msg = {
  face: string;
  text: string;
};

const INCOMING: Msg[] = [
  {
    face: "growing-ceo",
    text: "세무사·회계사와 연락이 닿지 않고 직원과만 소통한다.",
  },
  {
    face: "early-stage-founder",
    text: "서류 요청이나 질의 사항에 회신이 지나치게 늦거나, 자주 내용이 틀려 내용을 믿기 어렵다.",
  },
  {
    face: "owner-in-transition",
    text: "직원의 응대가 불친절하다.",
  },
];

const OUTGOING = [
  "기준이 되어주어야 할 세무대리인이 오히려 사업주의 고민거리가 되는 현실.",
  "메리디안은 그 구조 자체를 다르게 두기로 했습니다.",
];

/* 「입력 중…」이 머무는 칸 수. 한 칸만 주면 점이 뜨자마자 말이 나와서
   쓰는 중이라는 게 안 읽힌다. 여러 칸을 비워 그만큼 붙잡아 둔다.
   손님 쪽은 세 마디가 이어지므로 우리 쪽보다 짧게 잡는다. */
const IN_HOLD = 4;
const TYPING_HOLD = 6;

/* 손님 말 한 마디가 차지하는 칸: 「입력 중」 + 말 한 줄. */
const IN_BLOCK = IN_HOLD + 1;

/* 세 마디가 다 올라온 다음에야 누가 한 말인지 밝힌다.
   먼저 밝히면 대화가 아니라 인용문 상자가 된다. */
const STAMP_AT = INCOMING.length * IN_BLOCK;
const STAMP_HOLD = 2;

/* 우리가 답을 쓰기 시작하는 칸. */
const TYPING_AT = STAMP_AT + STAMP_HOLD;
const OUT_FROM = TYPING_AT + 1 + TYPING_HOLD;

/* 스크롤로 하나씩 켜지는 칸 수 전체. */
export const THREAD_STEPS = OUT_FROM + OUTGOING.length + 1;

/* 마지막 한 마디만 느리게 켜진다. */
const LAST_DUR = 1.1;

/* 점 세 개 → 말. 같은 말풍선이 부푸는 시간. */
const GROW = 0.52;
/* 글자는 풍선이 웬만큼 커진 뒤에 들어온다. 같이 켜면 작은 칸에서 글자가 눌린다. */
const INK = { duration: 0.3, delay: 0.3 };

type Custom = { dir: number; slow?: boolean };

const rowVariants: Variants = {
  /* 크기는 건드리지 않는다. 이 대화에서 커지는 건 「점 → 말」 한 번뿐이라야
     한다. 들어올 때도 부풀면 뭐가 커진 건지 안 읽힌다. */
  hidden: { opacity: 0, y: 14, scale: 1, x: 0 },
  shown: ({ slow }: Custom) =>
    slow
      ? {
          /* 마지막 한 마디만 느리게 켜진다. 부풀리지 않는다. */
          opacity: 1,
          y: 0,
          scale: 1,
          x: 0,
          transition: { duration: LAST_DUR, ease: "easeOut" },
        }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          x: 0,
          transition: { duration: 0.42, ease: EASE },
        },
  /* 손님 말은 왼쪽, 우리 말은 오른쪽. 각자 왔던 쪽으로 되돌아 나간다. */
  gone: ({ dir }: Custom) => ({
    opacity: 0,
    /* 제 폭의 120% 만 움직이면 말풍선이 화면 한복판에서 사라진다.
       62vw 도 모자랐다 — 2560px 화면에서는 오른쪽 말풍선이 화면 끝
       196px 앞에서 멈춰 그 자리에서 사라졌다. 화면 폭 하나를 통째로
       움직이면 어디서 출발하든 반드시 밖으로 나간다. */
    x: `${dir * 105}vw`,
    scale: 0.96,
    /* 옅어지는 것과 날아가는 것을 따로 잡는다. 한 시각으로 묶어 두니
       화면을 벗어나기도 전에 투명해져서, 날아 나간 게 아니라 그 자리에서
       지워진 것처럼 보였다. 옅어지는 건 다 나간 뒤에 시작한다. */
    transition: {
      x: { duration: 1.05, ease: [0.35, 0, 1, 1] },
      scale: { duration: 1.05, ease: [0.35, 0, 1, 1] },
      opacity: { duration: 0.25, delay: 0.8, ease: "linear" },
    },
  }),
};

export default function ComplaintThread({
  step = THREAD_STEPS,
  exit = false,
}: {
  step?: number;
  exit?: boolean;
}) {
  const reduced = useReducedMotion();

  /* i 번째 줄이 켜졌는지. 스크롤이 거기까지 왔으면 켠다. */
  const anim = (i: number, c: Custom) =>
    reduced
      ? {}
      : {
          custom: c,
          variants: rowVariants,
          initial: "hidden" as const,
          animate: exit ? "gone" : step > i ? "shown" : "hidden",
        };

  return (
    <div className="imsg">
      {INCOMING.map((m, i) => {
        const at = i * IN_BLOCK;
        /* 점 세 개가 뜨는 구간. 이 구간이 지나면 같은 풍선이 말로 부푼다. */
        const typing = !reduced && step > at && step <= at + IN_HOLD;
        return (
          <motion.div key={m.text} className="imsg-row" {...anim(at, { dir: -1 })}>
            <span className="imsg-face" aria-hidden>
              <img src={`/images/personas/${m.face}.svg`} alt="" />
            </span>
            <Bubble kind="in" typing={typing} reduced={reduced} text={m.text} />
          </motion.div>
        );
      })}

      {/* 누가 한 말인지는 세 마디를 다 읽은 뒤에 밝힌다.
          대화창 아래에 붙는 주석이라 왼쪽에 맞춘다. */}
      <motion.p className="imsg-stamp" {...anim(STAMP_AT, { dir: -1 })}>
        <b>사업주</b> 세 분이 말씀하신 것
      </motion.p>

      {/* 다 듣고 나서 답한다. 한 덩어리로 보내면 공지가 되니 두 마디로 나눈다.
          첫 마디는 점 세 개로 먼저 뜨고, 그 풍선이 그대로 말로 부푼다. */}
      {/* 우리 답 두 마디와 답하는 사람. 사람을 한 덩어리로 옆에 세운다 —
          동그란 프로필로 넣으면 아이콘이 되고, 누가 말하는지가 안 읽힌다. */}
      <div className="imsg-out">
        <div className="imsg-out-lines">
          {OUTGOING.map((t, i) => {
            const first = i === 0;
            const last = i === OUTGOING.length - 1;
            const at = first ? TYPING_AT : OUT_FROM + i;
            const typing = !reduced && first && step > at && step <= OUT_FROM;
            return (
              <motion.div
                key={t}
                className="imsg-row imsg-row--out"
                {...anim(at, { dir: 1, slow: last })}
              >
                <Bubble kind="out" typing={typing} reduced={reduced} text={t} tailless={!last} />
              </motion.div>
            );
          })}
        </div>

        <motion.div className="imsg-who" {...anim(OUT_FROM, { dir: 1 })} aria-hidden>
          <Image
            src="/images/founder-3d-idea.png"
            alt=""
            width={688}
            height={688}
            sizes="(max-width: 760px) 132px, 236px"
          />
        </motion.div>
      </div>

    </div>
  );
}

/* 말풍선 하나. 점 세 개로 떴다가, 같은 풍선이 그대로 부풀면서 말이 들어찬다.
   풍선을 둘로 나누면(점 풍선 + 말 풍선) 둘이 한 화면에 같이 남는다.
   motion 의 layout 이 폭·높이를 이어 준다 — 나누지 말 것. */
function Bubble({
  kind,
  text,
  typing,
  reduced,
  tailless = false,
}: {
  kind: "in" | "out";
  text: string;
  typing: boolean;
  reduced: boolean | null;
  tailless?: boolean;
}) {
  const cls = [
    "imsg-b",
    `imsg-b--${kind}`,
    tailless ? "imsg-b--tailless" : "",
    typing ? "imsg-b--typing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (reduced) return <p className={cls}>{text}</p>;

  return (
    <motion.p
      layout
      className={cls}
      transition={{ layout: { duration: GROW, ease: EASE } }}
    >
      {typing ? (
        <span className="imsg-dots" aria-label="입력 중">
          <span /><span /><span />
        </span>
      ) : (
        <motion.span
          className="imsg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={INK}
        >
          {text}
        </motion.span>
      )}
    </motion.p>
  );
}
