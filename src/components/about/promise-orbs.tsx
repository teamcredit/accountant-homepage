"use client";

/* 약속 두 개. 네모 칸 두 개 대신 원 두 개가 서로 물린다.
   물린 자리를 파란 세로선 하나가 위에서 아래로 가로지른다 —
   위 히어로에서 지구본을 지나던 그 0° 선이 여기까지 내려온 셈이다.

   원은 스크롤에 맞춰 각각 부풀고, 선은 그 다음에 위에서 아래로 그어진다.
   움직임을 꺼 둔 사람에게는 다 켜진 상태로 그대로 보인다. */

import { motion } from "motion/react";
import { usePrefersReducedMotion as useReducedMotion } from "@/lib/use-media";

const PROMISES = [
  {
    num: "01",
    title: "메리디안은 천천히 가겠습니다.",
    body: "욕심내지 않겠습니다. 빠르게 성장하기보다는, 고객과 직원 모두가 만족할 수 있는 속도로 성장하겠습니다.",
  },
  {
    num: "02",
    title: "회계사가 직접 책임 지겠습니다.",
    body: "직접 소통하겠습니다. 직원에게 책임을 전가하지 않겠습니다.",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/* show 를 켜는 시점은 위(PromiseStage)가 정한다. 대화가 다 날아간 다음이다. */
export default function PromiseOrbs({ show = false }: { show?: boolean }) {
  const reduced = useReducedMotion();

  const orb = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, scale: 0.9 },
          animate: show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
          /* 천천히 올라온다. 대화가 빠르게 나갔으니 여기서 속도를 늦춘다. */
          transition: { duration: 1.4, delay: show ? i * 0.35 : 0, ease: EASE },
        };

  return (
    <div className="promise-orbs">
      {PROMISES.map((p, i) => (
        <motion.div
          key={p.num}
          className={`promise-orb promise-orb--${i === 0 ? "a" : "b"}`}
          {...orb(i)}
        >
          <div className="promise-orb-in">
            <p className="promise-orb-num">
              <span className="promise-orb-label">약속</span>
              <span className="promise-orb-no">{p.num}</span>
            </p>
            <h3 className="promise-orb-title" style={{ wordBreak: "keep-all" }}>
              {p.title}
            </h3>
            <p className="promise-orb-body" style={{ wordBreak: "keep-all" }}>
              {p.body}
            </p>
          </div>
        </motion.div>
      ))}

      {/* 두 원 사이의 0° 선을 없앴다. 원 둘 사이를 세로로 가르니
          두 약속이 하나로 안 읽히고 갈라져 보였다. */}

    </div>
  );
}
