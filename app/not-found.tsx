import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">페이지를 찾을 수 없습니다</h2>
      <Link href="/" className="text-sm underline">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
