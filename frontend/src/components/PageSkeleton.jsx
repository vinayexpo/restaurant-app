import { SkeletonGrid } from './Skeleton'

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SkeletonGrid count={6} />
    </div>
  )
}
