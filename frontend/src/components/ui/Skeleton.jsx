import React from 'react'
import clsx from 'clsx'

const Skeleton = ({ className, width, height, circle = false }) => {
  return (
    <div
      className={clsx(
        'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%]',
        circle ? 'rounded-full' : 'rounded-xl',
        className
      )}
      style={{ width, height }}
    />
  )
}

export const SkeletonCard = () => (
  <div className="bg-white border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton circle width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  </div>
)

export const SkeletonBalance = () => (
  <div className="bg-gradient-to-br from-primary to-primary-800 rounded-2xl p-5 space-y-4">
    <Skeleton width="40%" height={14} className="bg-white/20" />
    <Skeleton width="70%" height={36} className="bg-white/20" />
    <div className="flex gap-3 pt-2">
      <Skeleton width="50%" height={44} className="bg-white/20 rounded-xl" />
      <Skeleton width="50%" height={44} className="bg-white/20 rounded-xl" />
    </div>
  </div>
)

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export default Skeleton
