import React from 'react'

function Bone({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} aria-hidden />
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Bone className="h-3 w-40" />
        <Bone className="h-9 w-80 max-w-full" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>
      <div className="card-surface p-6 space-y-4">
        <Bone className="h-4 w-32" />
        <Bone className="h-8 w-64" />
        <Bone className="h-4 w-full max-w-lg" />
        <div className="flex gap-2 flex-wrap">
          <Bone className="h-6 w-24" />
          <Bone className="h-6 w-28" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={5} />
        </div>
        <div className="space-y-6">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={2} />
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card-surface p-6 space-y-3">
      <Bone className="h-5 w-40" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} className={`h-4 ${i === 0 ? 'w-full' : i === 1 ? 'w-11/12' : 'w-4/5'}`} />
      ))}
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-label="Loading workspace">
      <Bone className="h-3 w-36" />
      <Bone className="h-10 w-72 max-w-full" />
      <Bone className="h-4 w-full max-w-xl" />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={6} />
    </div>
  )
}

export function AuthSkeleton() {
  return (
    <div className="card-surface w-full max-w-md p-8 space-y-4 mx-auto" aria-busy="true">
      <Bone className="h-8 w-48 mx-auto" />
      <Bone className="h-4 w-64 mx-auto" />
      <Bone className="h-11 w-full mt-6" />
      <Bone className="h-11 w-full" />
      <Bone className="h-11 w-full" />
    </div>
  )
}

export default function Skeleton({ className = '' }) {
  return <Bone className={className} />
}
