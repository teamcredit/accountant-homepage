"use client";
import Link from 'next/link';

export default function ErrorPage({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <section className="max-w-3xl mx-auto px-6 py-32" role="alert">
    <h1 className="t-h2">화면을 불러오지 못했습니다</h1>
    <p className="t-body mt-6 mb-8">잠시 후 다시 시도해 주세요.</p>
    <button onClick={unstable_retry} className="btn-blue rounded-[10px] px-6 py-3">다시 시도</button>
    <Link href="/" className="ml-6 underline">홈으로 이동</Link>
  </section>;
}
