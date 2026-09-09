/* 검색어와 항목을 맞춰 보는 규칙.
 *
 * 예전에는 소문자로만 바꿔 놓고 그대로 포함 여부를 봤다. 그래서
 * 「세무기장」을 치면 항목 이름이 「세무 기장」이라 하나도 안 나왔다.
 * 띄어쓰기 하나 때문에 검색이 통째로 안 되는 셈이다.
 *
 * 세 가지를 본다.
 *   1. 띄어쓰기 · 가운뎃점 · 붙임표를 다 지우고 견준다 → 「세무기장」 ○
 *   2. 첫 자음만 쳐도 찾는다 → 「ㅅㅁㄱㅈ」 ○
 *   3. 글자 하나가 틀려도 찾는다 → 「세무기창」 ○
 */

/* 띄어쓰기와 사이 기호를 지운다. 검색어와 항목 양쪽에 같이 쓴다. */
export function norm(s: string): string {
  return s.toLowerCase().replace(/[\s·・.,()[\]{}/\\|~!@#$%^&*_+=:;"'`?<>-]+/g, "");
}

/* 한글 첫 자음. 「세무 기장」 → 「ㅅㅁㄱㅈ」.
   한글이 아닌 글자는 그대로 둔다 — 「IPO 자문」 → 「ipoㅈㅁ」. */
const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export function chosung(s: string): string {
  let out = "";
  for (const ch of norm(s)) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += CHO[Math.floor((code - 0xac00) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

/* 글자 하나 차이까지 봐준다(넣기 · 빼기 · 바꾸기 한 번).
   두 글자 이상 틀린 건 다른 말로 본다 — 봐주기 시작하면 아무거나 걸린다. */
function within1(a: string, b: string): boolean {
  if (a === b) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  if (l.length - s.length > 1) return false;
  let i = 0;
  let j = 0;
  let slack = 1;
  while (i < s.length && j < l.length) {
    if (s[i] === l[j]) {
      i += 1;
      j += 1;
      continue;
    }
    if (slack === 0) return false;
    slack = 0;
    if (s.length === l.length) {
      i += 1;
      j += 1;
    } else {
      j += 1;
    }
  }
  return true;
}

/* 글자 하나 틀린 게 이름 어딘가에 있나. 검색어가 두 글자 아래면 안 본다 —
   한 글자에서 하나를 봐주면 모든 항목이 걸린다. */
function fuzzyIn(needle: string, hay: string): boolean {
  if (needle.length < 2) return false;
  const n = needle.length;
  for (let i = 0; i + n - 1 <= hay.length; i += 1) {
    if (within1(needle, hay.slice(i, i + n))) return true;
    if (within1(needle, hay.slice(i, i + n + 1))) return true;
  }
  return false;
}

/* 낮을수록 위에 선다. -1 이면 안 걸린 것. */
export function rankOf(rawNeedle: string, title: string, terms: string): number {
  const q = norm(rawNeedle);
  if (!q) return -1;

  const t = norm(title);
  if (t.startsWith(q)) return 0;
  if (t.includes(q)) return 1;

  const tc = chosung(title);
  if (tc.startsWith(q)) return 2;
  if (tc.includes(q)) return 3;

  if (norm(terms).includes(q)) return 4;
  if (fuzzyIn(q, t)) return 5;
  return -1;
}
