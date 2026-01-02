'use client'

import { BackToTop } from '@/components/ui/back-to-top'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <BackToTop />
    </>
  )
}
