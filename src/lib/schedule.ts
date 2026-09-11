export const scheduleSource = 'https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxMonth=10&taxYear=2026';
export const scheduleReviewedAt = '2026-09-11';
export const scheduleDates = [
  { what: '원천세 납부', when: '2026-10-12', period: '2026년 9월분' },
  { what: '부가세 2기 예정신고', when: '2026-10-26', period: '2026년 7~9월분' },
];
export type ScheduleItem = typeof scheduleDates[number];
const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
export function seoulToday(now = new Date()) {
  return seoulDateFormatter.format(now);
}
export function daysLeft(date: string, today = seoulToday()) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
}
export function dday(date: string, today = seoulToday()) {
  const days = daysLeft(date, today);
  return days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${-days}`;
}
