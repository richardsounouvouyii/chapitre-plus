import { cn } from '@/lib/utils'

type SkeletonCardProps = {
  className?: string
}

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5',
        className,
      )}
      aria-hidden
    >
      <SkeletonLine className="h-3 w-1/3" />
      <SkeletonLine className="h-6 w-4/5" />
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="h-4 w-1/2" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <SkeletonLine className="h-5 w-24" />
        <div className="skeleton h-8 w-28" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4"
        >
          <div className="skeleton size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-2/3" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
          <div className="skeleton h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
