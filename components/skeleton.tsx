import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("skeleton rounded-lg", className)} />
  )
}

export function AppointmentCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
      <Skeleton className="w-12 h-6" />
      <div className="w-px h-10 bg-[var(--border)]" />
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
      <Skeleton className="w-10 h-10 rounded-lg mb-3" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function ClientCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}
