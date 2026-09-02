/**
 * 카드뉴스용 제목 쪼개기.
 *
 * 목록 카드는 표지 이미지가 있는 글이 3개뿐이다.
 * 나머지는 제목만으로 카드 한 장을 채워야 해서 제목을 두 토막으로 나눈다.
 *
 *   앞토막(head) — 20글자 이내. 카드에 크게 박히는 문구.
 *   뒷토막(tail) — 나머지. 밑에 작게 한 줄로 깐다.
 *
 * 제일 중요한 규칙: 앞토막이 조사로 끝나면 안 된다.
 * "1세대1주택 비과세의" 처럼 끊기면 문장이 잘린 티가 난다.
 * 그래서 자른 자리가 길이 때문이든 쉼표 때문이든 언제나 끝말을 검사한다.
 */

export const HEAD_MAX = 20;
const HEAD_MIN = 7;

/* 이 꼬리로 끝나는 낱말은 뒤에 올 말이 있다는 뜻이다. 앞토막 끝에 두지 않는다.
   한 글자 조사는 낱말이 3글자 이상일 때만 본다.
   ("논의"의 '의'는 조사가 아니라 낱말의 일부다.) */
const SUFFIX = [
  "이라는", "에서", "으로", "까지", "부터", "보다", "하는", "되는", "라는",
  "처럼", "마다", "조차", "밖에", "지만", "는데", "이며", "에게", "한테",
  "같이", "이나", "거나", "든지", "하고", "위한", "통한", "대한", "관한",
  "해야", "하여", "되어", "이란", "라도", "면서",
  "의", "을", "를", "은", "는", "이", "가", "와", "과", "에", "로",
];

/* 그 자체로 끝맺지 못하는 낱말. 꾸미는 말이라 뒤에 반드시 명사가 온다. */
const WORDS = new Set([
  "및", "할", "한", "위한", "대한", "관한", "그", "이", "저", "새", "더",
  "왜", "꼭", "반드시", "어떤", "어떻게", "언제", "무엇",
  "이런", "그런", "저런", "모든", "각", "살", "볼", "낼", "쓸",
]);

function isDangling(word: string): boolean {
  if (WORDS.has(word)) return true;
  return SUFFIX.some(
    (s) => word.endsWith(s) && word.length > s.length + (s.length === 1 ? 1 : 0),
  );
}

export interface Headline {
  head: string;
  tail: string;
}

export function splitHeadline(title: string): Headline {
  const t = title.trim();

  /* 1. 글쓴이가 쉼표·대시로 나눠 둔 자리가 있으면 거기서 먼저 자른다. */
  const m = t.match(/^(.{1,40}?)\s*[,—–:]\s*(.+)$/);
  let head = m ? m[1].trim() : t;
  let tail = m ? m[2].trim() : "";

  /* 2. 그래도 20글자를 넘으면 띄어쓰기 자리에서 자른다. */
  if (head.length > HEAD_MAX) {
    const space = head.lastIndexOf(" ", HEAD_MAX);
    const at = space > 8 ? space : HEAD_MAX;
    tail = `${head.slice(at).trim()}${tail ? ` ${tail}` : ""}`.trim();
    head = head.slice(0, at).trim();
  }

  /* 3. 끝말이 조사면 뒤로 넘긴다. 자른 방법과 상관없이 언제나 돈다. */
  for (let i = 0; i < 4; i += 1) {
    const words = head.split(" ");
    if (words.length > 1 && isDangling(words[words.length - 1])) {
      tail = `${words[words.length - 1]}${tail ? ` ${tail}` : ""}`.trim();
      head = words.slice(0, -1).join(" ");
    } else break;
  }

  /* 4. 너무 짧아졌거나 여전히 조사로 끝나면 뒷토막에서 한 마디씩 끌어온다. */
  for (let i = 0; i < 4; i += 1) {
    if (!tail) break;
    const words = head.split(" ");
    if (head.length >= HEAD_MIN && !isDangling(words[words.length - 1])) break;
    const next = tail.split(" ")[0];
    if (head.length + next.length + 1 > HEAD_MAX) break;
    head = `${head} ${next}`.trim();
    tail = tail.split(" ").slice(1).join(" ");
  }

  /* 5. 뒷토막이 한 마디밖에 안 남으면 도로 붙인다. 밑줄에 "5가지"만 떠 있으면 어색하다. */
  if (
    tail &&
    tail.length <= 4 &&
    head.length + tail.length + 1 <= HEAD_MAX &&
    !isDangling(tail)
  ) {
    head = `${head} ${tail}`;
    tail = "";
  }

  /* 낫표·따옴표가 뒷토막 맨 앞에 홀로 남으면 지운다. 짝이 안 맞으면 오타로 보인다. */
  tail = tail.replace(/^[」』"'”’)\]]+\s*/, "");

  return { head, tail };
}
