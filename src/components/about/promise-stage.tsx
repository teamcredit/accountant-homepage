"use client";

/* 「메리디안의 약속」 한 섹션. 대화와 약속이 같은 자리를 쓴다.

   1) 사업주 말이 한 마디씩 올라온다
   2) 마지막 우리 답이 느리게 켜지며 한 번 부풀었다 가라앉는다
   3) 손님 말은 왼쪽으로, 우리 말은 오른쪽으로 날아가 사라진다
   4) 비워진 그 자리에 약속 두 개가 천천히 올라온다

   이 네 장면은 「시간」이 아니라 「스크롤 위치」가 넘긴다. 시간으로 돌리면
   스크롤을 빨리 내린 사람은 대화를 통째로 놓친다. 무대를 화면에 붙여
   두고(sticky), 그 뒤로 남겨 둔 스크롤 길이만큼 장면이 넘어간다.

   두 덩어리를 위아래로 쌓지 않고 grid 한 칸에 겹쳐 둔다. 그래야 약속이
   「그 자리에」 나온다. 높이는 둘 중 큰 쪽을 따라간다.

   움직임을 꺼 둔 사람에게는 대화와 약속이 위아래로 그냥 놓인다. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import ComplaintThread, { THREAD_STEPS } from "./complaint-thread";
import PromiseOrbs from "./promise-orbs";

/* 스크롤을 어디까지 내렸을 때 무엇이 일어나는가.
   대화는 앞쪽 절반에서 한 마디씩 차오르고, 다 읽을 틈을 둔 다음 날아간다. */
const TALK_FROM = 0;
/* 판이 붙기 전(제목이 아래에서 올라오는 동안)에는 스크롤 진행이 0 이라
   화면 아래쪽이 통째로 비어 있었다. 제목이 보이는 순간 이미 대화가
   굴러가고 있게 바닥을 깔아 둔다.
   첫 마디가 다 올라오는 눈금이 5 다(말풍선 하나가 5 칸). 6 으로 두면
   첫 마디는 서 있고 두 번째 마디가 입력 중인 상태에서 시작한다. */
const STEP_FLOOR = 6;
/* 손님 말 세 마디가 여기까지 다 오른다. */
const TALK_TO = 0.46;
/* 우리 답 두 마디를 읽을 자리. 예전에는 0.5 에서 답이 나오고 0.62 에 벌써
   날아가서, 두 번째 마디(「구조 자체를 다르게 두기로 했습니다」)가
   화면에 떴다가 바로 사라졌다. */
const EXIT_AT = 0.7;
const ORBS_AT = 0.78;

/* head — 「Our Promise / 메리디안의 약속」 제목. 무대 안에 같이 붙인다.
   바깥에 두면 무대가 화면에 붙어 있는 동안 제목만 위로 흘러 나가서,
   지금 보고 있는 게 무엇에 대한 이야기인지 알 수 없게 된다. */
export default function PromiseStage({ head }: { head?: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [step, setStep] = useState(STEP_FLOOR);
  const [exit, setExit] = useState(false);
  const [orbs, setOrbs] = useState(false);

  /* 약속이 올라오는 순간 스크롤을 붙잡는다.
     여기서 안 잡으면 손가락 한 번에 약속 두 개가 통째로 지나가 버린다.

     ※ 잡는 건 아래 스크롤 콜백 안에서 곧바로 한다. useEffect 로 미루면
        그 사이 한 프레임이 더 흘러 관성이 이미 다음 섹션까지 밀고 간다.
        여기서는 「언제 놓을지」만 관리한다. */
  const held = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      lenis?.start();
    };
  }, [lenis]);

  /* 원은 0.35초 간격으로 두 개가 1.4초씩 부푼다 → 1.75초.
     파란 선은 0.25초 뒤 출발해 1.6초 동안 내려간다 → 1.85초.
     선이 다 그어진 뒤 한 박자 읽을 시간까지 두고 놓는다. */
  const HOLD_MS = 2500;
  const hold = () => {
    /* 손가락으로 미는 화면에서는 붙잡지 않는다. 관성으로 밀고 있는데
       중간에 멈춰 세우면 버벅이는 것으로 읽힌다. */
    if (held.current || reduced || !lenis) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    held.current = true;
    lenis.stop();
    holdTimer.current = setTimeout(() => lenis.start(), HOLD_MS);
  };

  /* motion 12 는 스크롤 값을 브라우저에 넘겨 버려서 style 로 엮으면
     구간(offset)이 무시된다. 값만 받아 상태로 바꾸면 그 문제가 없다. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const t = (v - TALK_FROM) / (TALK_TO - TALK_FROM);
    const next = Math.max(STEP_FLOOR, Math.min(THREAD_STEPS, Math.ceil(t * THREAD_STEPS)));
    setStep((prev) => (prev === next ? prev : next));
    setExit(v >= EXIT_AT);
    if (v >= ORBS_AT) hold();
    setOrbs(v >= ORBS_AT);
  });

  if (reduced) {
    return (
      <div ref={ref}>
        {head}
        <ComplaintThread />
        <div className="mt-16">
          <PromiseOrbs show />
        </div>
      </div>
    );
  }

  return (
    /* 이 통이 길다. 그 길이만큼 스크롤이 장면을 넘긴다. */
    <div ref={ref} className="promise-scroll">
      <div className="promise-pin">
        {head ? <div className="promise-head">{head}</div> : null}
        <div className="promise-stage">
          {/* 대화. 나간 뒤에는 자리를 차지하지 않도록 클릭도 막는다. */}
          <div
            className="promise-stage-layer"
            style={{ pointerEvents: exit ? "none" : undefined }}
          >
            <ComplaintThread step={step} exit={exit} />
          </div>
          {/* 약속. 대화가 나가기 시작할 때부터 천천히 올라온다. */}
          <div
            className="promise-stage-layer"
            style={{ pointerEvents: orbs ? undefined : "none" }}
          >
            <PromiseOrbs show={orbs} />
          </div>
        </div>
      </div>
    </div>
  );
}
