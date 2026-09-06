"use client";

/* About 페이지 첫 화면. 스크롤 한 번에 세 장면이 이어진다.

   ① 로고만 있다. 뒤에는 아무것도 없다.
   ② 로고가 사라지고 지구본이 켜지면서 왼쪽으로 물러난다.
      비는 오른쪽 자리에 본초자오선이 무엇인지가 들어온다.
   ③ 파란 광선이 오른쪽에서 왼쪽으로 훑고 지나가며 지구본을 지우고,
      "메리디안이 그 기준선이 되어드리겠습니다" 만 남는다.

   화면은 붙어 있고(sticky) 스크롤 양이 시간 역할을 한다.
   움직임을 꺼 둔 사람에게는 세 장면을 그냥 위아래로 쌓아서 보여준다. */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import MeridianGlobe from "@/components/about/meridian-globe";
import Wordmark from "@/components/brand/wordmark";

export default function AboutOpening() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  /* 화면이 붙었는지. 서버와 첫 렌더를 같게 두려고 쓴다. */

  /* 좁은 화면인지. 지구본을 옆으로 밀 자리가 없으면 위로 올린다. */
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 900px)");
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  /* 이 구간을 지나는 동안 0 → 1. 그게 아래 모든 값의 시계다. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* 값을 한 번 옮겨 담는다.
     useScroll 이 준 값을 opacity 에 바로 물리면 브라우저의 스크롤 타임라인으로
     넘어가는데, 그쪽은 target/offset 을 안 보고 문서 전체를 구간으로 잡는다.
     그래서 장면이 실제보다 세 배 늘어졌다. 평범한 값으로 옮기면 그 경로를
     안 타고 우리가 준 구간대로 돈다. 다시 그리지 않으니 값도 안 든다. */
  const p = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => p.set(v));

  /* 장면 시각. 아래 숫자는 다 이 0~1 위의 눈금이다.
     끝(1.0)까지 다 쓰지 않고 0.76 쯤에서 장면을 끝낸다. 남는 뒤쪽은
     일부러 비워 둔 여백이다 — 마지막 문장을 읽는 동안 화면이 붙어 있고,
     그 다음 섹션이 훅 올라오지 않는다. */

  /* ⓪ 첫 화면 영상. 스크롤이 시작되면 위아래에서 셔터가 닫히듯 높이가
     줄어들며 꺼지고, 그 자리에서 지구본이 켜진다.
     닫히는 구간(0.05~0.20)과 지구본이 켜지는 구간(0.15~0.27)을 조금
     겹쳐 둔다. 완전히 끊어 두면 빈 흰 화면이 한 박자 낀다. */
  /* 자르는 건 mask 가 아니라 clip-path 다. 마스크는 그림만 지우고 자리는
     남겨서, 헤더가 「내 밑에 어두운 판이 있다」로 읽은 채 흰 화면 위에서
     흰 글씨가 됐다. clip-path 는 잘린 자리가 손에도 안 잡힌다. */
  const shutTop = useTransform(p, [0.05, 0.2], [0, 50]);
  const shutBot = useTransform(p, [0.05, 0.2], [0, 50]);
  const videoClip = useMotionTemplate`inset(${shutTop}% 0% ${shutBot}% 0%)`;
  /* 마지막에 남는 한 줄까지 끈다. 셔터만으로는 1px 짜리 띠가 남는다. */
  const videoFade = useTransform(p, [0.17, 0.21], [1, 0]);

  /* 영상이 살아 있는 동안만 DOM 에 둔다. 헤더는 자기 아래 요소의 배경색을
     읽어 밝기를 정하는데, 다 꺼진 영상 판이 남아 있으면 흰 화면인데도
     계속 「어둡다」로 읽어 로고가 흰색으로 사라진다. */
  const [videoOn, setVideoOn] = useState(true);
  useMotionValueEvent(p, "change", (v) => setVideoOn(v < 0.215));
  /* 헤더는 자기 밑에 깔린 배경색을 「스크롤할 때」 다시 잰다. 영상이
     사라지는 순간은 스크롤이 아니라 렌더라, 한 박자 늦게 흰 화면 위에
     흰 글씨가 남았다. 사라진 뒤 한 번 알려 준다. */
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, [videoOn]);

  /* ① 로고. 영상 위에서는 흰색, 영상이 꺼지면 검정으로 넘어간다.
     흐려져 사라지지 않는다 — 지구본과 같은 궤도로 왼쪽에 붙어 가다가
     ③ 광선이 지구본을 지울 때 같이 지워진다(아래 globeMask 를 같이 쓴다).
     그래서 여기에는 opacity 가 없다. 크기만 줄어 지구본 위 이름표가 된다. */
  const logoScale = useTransform(p, [0, 0.21, 0.41], [1, 1, 0.34]);
  const logoColor = useTransform(p, [0.11, 0.2], ["#FFFFFF", "#000000"]);

  /* ② 지구본 — 켜지고, 왼쪽으로 물러난다.
     사라지는 건 흐려져서가 아니라 ③ 광선이 지나가며 지워서다(아래 마스크). */
  const globeOpacity = useTransform(p, [0.15, 0.27], [0, 1]);
  const globeX = useTransform(p, [0.21, 0.41], ["0%", narrow ? "0%" : "-26%"]);
  const globeY = useTransform(p, [0.21, 0.41], ["0%", narrow ? "-20%" : "0%"]);
  const globeScale = useTransform(p, [0.15, 0.41], [1.12, 0.9]);

  /* ② 본초자오선의 뜻 */
  const meaningOpacity = useTransform(p, [0.3, 0.4, 0.52, 0.58], [0, 1, 1, 0]);
  const meaningY = useTransform(p, [0.3, 0.4], [40, 0]);

  /* ③ 광선. 오른쪽 끝에서 왼쪽 끝으로 한 번 지나간다.
     이 장면이 이 화면에서 제일 볼 만한 대목인데 0.18 구간으로는 훅 지나갔다.
     구간을 0.21 로 넓히고 아래 .about-stage 높이도 같이 늘려서
     실제 스크롤 거리로 1.3배쯤 느리게 지나간다. */
  const laserPos = useTransform(p, [0.52, 0.73], [160, -60]);
  const laserX = useMotionTemplate`${laserPos}vw`;
  const laserOpacity = useTransform(p, [0.51, 0.55, 0.70, 0.75], [0, 1, 1, 0]);

  /* 지구본을 지우는 마스크. 광선 왼쪽은 남고 오른쪽은 지워진다.
     광선이 오른쪽에서 와서 왼쪽으로 빠지니, 지나간 자리가 차례로 비는 셈이다.
     경계에 2vw 를 풀어 두면 잘린 자국 대신 광선이 녹여 낸 것처럼 보인다.
     ※ 마스크는 옮겨지지 않는 바깥 껍데기에 건다. 지구본을 왼쪽으로 미는
        transform 과 같은 요소에 걸면 마스크까지 같이 밀려간다. */
  const globeMask = useMotionTemplate`linear-gradient(90deg, #000 ${laserPos}vw, transparent calc(${laserPos}vw + 2vw))`;

  /* ③ 남는 문장. 광선 꽁무니를 바짝 따라 붙는다.
     그리고 ④ 가 올라올 때 자리를 넘겨준다 — 작아지고 흐려진다.
     같은 크기로 둘이 나란히 서면 어느 쪽을 읽어야 할지 알 수 없다. */
  /* 아래 문단이 올라오면 완전히 사라진다. 0.4 로 남겨 두니 다음 글과 겹쳤다.
     머무는 구간이 0.72~0.78, 여섯 칸뿐이라 읽기도 전에 넘어갔다.
     0.70~0.86 으로 세 배 가까이 늘린다. */
  const lastOpacity = useTransform(p, [0.63, 0.7, 0.86, 0.92], [0, 1, 1, 0]);
  const lastY = useTransform(p, [0.63, 0.74], [36, 0]);
  /* 올라가는 것과 작아지는 것은 한 동작이다. 시각을 어긋내면 두 번 움직여 보인다. */
  const lastScale = useTransform(p, [0.86, 0.95], [1, 0.6]);

  /* .about-close 는 「문장 + 회사 설명」을 한 덩어리로 가운데 세운다.
     그런데 문장 혼자 떠 있는 동안에는 아래 설명의 높이만큼 위로 밀려 있다 —
     화면 한가운데가 아니라 위쪽에 뜬다. 그래서 설명이 나오기 전까지는
     그 높이의 절반만큼 통째로 내려 두고, 설명이 올라올 때 제자리로 돌린다.
     높이는 글꼴이 실리고 화면 폭이 바뀌면 달라지므로 재서 쓴다. */
  const whatRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  useEffect(() => {
    const el = whatRef.current;
    if (!el) return;
    const measure = () => {
      /* 2rem = .about-what 의 위 여백 */
      setShift((el.offsetHeight + 32) / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const closeY = useTransform(p, [0.86, 0.95], [shift, 0]);

  /* ④ 그래서 이게 뭐 하는 회사인지. 문장 하나로는 안 보였다.
     남겨 둔 뒤쪽 여백(0.76~1.0)을 여기에 쓴다. 여기가 이 화면의 결론이라
     위 문장보다 크게 선다. */
  /* 0.91 에서 끝내 두니 남은 9% 동안 붙은 채로 흰 화면만 굴렀다.
     끝까지 쓴다 — 다 읽히는 순간 판이 풀리고 다음 장이 올라온다. */
  const whatOpacity = useTransform(p, [0.88, 0.95], [0, 1]);
  const whatY = useTransform(p, [0.88, 1], [28, 0]);

  /* 움직임을 꺼 둔 화면.
     예전에는 이름·본초자오선·마지막 문장을 한 판에 다 쌓았다. 스크롤로
     넘기던 세 장면이 한 화면에 겹쳐 보여서, 「기준선이 되어드리겠습니다」가
     나올 때도 본초자오선 설명이 그대로 남아 있었다.
     장면을 두 판으로 끊는다 — 앞 판이 화면 밖으로 나간 뒤에 뒷 판이 온다.
 */
  if (reduced) {
    return (
      <div className="about-stage-static">
        <section className="ass-scene">
          <h1 className="about-logo">
            <Wordmark mark={false} />
          </h1>
          <MeridianGlobe />
          <Meaning />
        </section>

        <section className="ass-scene">
          <div className="about-close">
            <p className="about-last">
              <span className="text-accent">메리디안</span>이 그 기준선이
              되어드리겠습니다.
            </p>
            <What />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div ref={ref} className="about-stage">
      <div className="about-stage-pin">
        {/* ⓪ 첫 화면 영상. 제일 뒤에 깐다. */}
        {videoOn && (
          <motion.div
            className="about-video"
            style={{
              clipPath: videoClip,
              WebkitClipPath: videoClip,
              opacity: videoFade,
            }}
          >
            {/* webm 이 먼저다 — 같은 화질에 mp4 보다 15% 작다.
                7.8MB 원본을 crf 27 로 다시 떠서 1.1MB 로 줄였다. */}
            <video autoPlay muted loop playsInline preload="metadata">
              <source src="/home-hero.webm" type="video/webm" />
              <source src="/home-hero.mp4" type="video/mp4" />
            </video>
            {/* 흰 로고가 얹히는 자리를 눌러 준다. 안 누르면 밝은 장면에서
              이름이 사라진다. 헤더도 이 색을 읽어 밝기를 정한다. */}
            <div className="about-video-veil" />
          </motion.div>
        )}

        {/* 지구본. 자기 자리를 잡는 건 .mglobe 가 하고, 여기서는 밀고 끄기만 한다. */}
        <motion.div
          className="about-globe"
          style={{ maskImage: globeMask, WebkitMaskImage: globeMask }}
        >
          <motion.div
            className="about-globe-move"
            style={{
              opacity: globeOpacity,
              x: globeX,
              y: globeY,
              scale: globeScale,
            }}
          >
            <MeridianGlobe className="mglobe--xl" />
          </motion.div>
        </motion.div>

        {/* ① 로고. 지구본과 같은 마스크를 쓴다 — 광선이 둘을 함께 지운다.
            바깥 껍데기는 움직이지 않는다(마스크가 같이 밀려가면 안 된다). */}
        <motion.div
          className="about-logo-shell"
          style={{ maskImage: globeMask, WebkitMaskImage: globeMask }}
        >
          <motion.div
            className="about-logo-move"
            style={{ x: globeX, y: globeY, scale: logoScale, color: logoColor }}
          >
            <h1 className="about-logo">
              <Wordmark mark={false} />
            </h1>
          </motion.div>
        </motion.div>

        {/* ② */}
        <motion.div
          className="about-meaning"
          style={{ opacity: meaningOpacity, y: meaningY }}
        >
          <Meaning />
        </motion.div>

        {/* ③ 광선 */}
        <motion.div
          className="about-laser"
          style={{ x: laserX, opacity: laserOpacity }}
          aria-hidden
        />

        {/* ③ + ④ */}
        <motion.div className="about-close" style={{ y: closeY }}>
          <motion.p
            className="about-last"
            style={{ opacity: lastOpacity, y: lastY, scale: lastScale }}
          >
            <span className="text-accent">메리디안</span>이 그 기준선이
            되어드리겠습니다.
          </motion.p>

          <motion.div ref={whatRef} style={{ opacity: whatOpacity, y: whatY }}>
            <What />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* 두 번째 장면의 글. 정지 화면에서도 같은 걸 쓴다. */
function Meaning() {
  return (
    <>
      <p className="about-eyebrow">Prime Meridian</p>
      <h2 className="about-term">
        본초자오선<span className="text-accent">.</span>
      </h2>
      <div className="about-rule" />
      <p className="about-body">
        영국 그리니치 천문대를 지나는 <strong>경도 0°선</strong>.
        <br />
        세계의 시간은 여기서 출발합니다.
        <br />
        런던도, 서울도, 뉴욕도 이 한 선에 시각을 맞춥니다.
      </p>
      <p className="about-body about-body-2">
        사업의 모든 결정에도 <strong>기준선</strong>이 필요합니다.
      </p>
    </>
  );
}

/* 그래서 무슨 회사인가. 기준선 이야기만 남기면 이게 뭐 하는 곳인지 안 보인다. */
function What() {
  return (
    <div className="about-what">
      {/* 위에 있던 파란 세로선은 뺐다. 로고 바로 위를 가른다. */}
      {/* 회사 이름은 글자가 아니라 로고로 선다. 이 화면의 마지막 장면이고,
          바로 위에서 지구본이 지워진 자리라 마크가 그 자리를 이어받는다. */}
      <p className="about-what-name">
        <Wordmark />
      </p>
      <p className="about-what-body">
        <span className="s">매일의 기장부터 세무조정, 세무자문, 가치평가까지</span>
        <span className="s"><strong>회계사가 직접 맡습니다.</strong></span>
      </p>
      {/* 여기까지가 「무엇을 하는가」. 한 줄 더 — 그 일이 어디에 모이는지. */}
      <p className="about-what-more">
        <span className="s">그리고 그 모든 것을 한 화면에서 보는</span>
        <span className="s">
          회사 전용 <strong className="hl">세무 대시보드</strong>까지.
        </span>
      </p>
      <div className="about-what-cta">
        <a className="about-btn about-btn--fill" href="/contact">
          상담하기
        </a>
        <a className="about-btn about-btn--line" href="/services">
          하는 일 자세히 보기
        </a>
      </div>
    </div>
  );
}
