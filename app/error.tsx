"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">문제가 발생했습니다</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  )
}
