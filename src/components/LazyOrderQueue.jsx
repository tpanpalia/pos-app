import React, { lazy, Suspense } from 'react'

const OrderQueue = lazy(() => import('./OrderQueue'))

export default function LazyOrderQueue(props) {
  return (
    <Suspense fallback={<div className="loading">Loading orders...</div>}>
      <OrderQueue {...props} />
    </Suspense>
  )
}