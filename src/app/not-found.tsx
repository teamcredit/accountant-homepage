import Link from 'next/link';

export default function NotFound() {
  return <section className="max-w-3xl mx-auto px-6 py-32">
    <p className="t-label mb-4">404</p>
    <h1 className="t-h2">페이지를 찾을 수 없습니다</h1>
    <p className="t-body mt-6 mb-8">주소가 변경되었거나 없는 페이지입니다. 홈에서 필요한 서비스를 찾아보세요.</p>
    <Link href="/" className="btn-blue rounded-[10px] px-6 py-3 inline-block">홈으로 이동</Link>
    <Link href="/contact" className="ml-6 underline">문의하기</Link>
  </section>;
}
