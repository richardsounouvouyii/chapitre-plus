import type { ReactNode } from 'react'
import { AppPageHeader } from '@/components/layout/AppPageHeader'

type StudentPageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
}

/** Alias élève de `AppPageHeader` (eyebrow par défaut). */
export function StudentPageHeader({
  title,
  description,
  eyebrow = 'Espace élève',
  actions,
}: StudentPageHeaderProps) {
  return (
    <AppPageHeader
      title={title}
      description={description}
      eyebrow={eyebrow}
      actions={actions}
    />
  )
}
