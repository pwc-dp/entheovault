'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

import SubstanceCard from './SubstanceCard'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SubstanceSlug } from '@/data/substances'
import { substanceGuides } from '@/data/substances'

const HighlightContext = createContext<{
  highlighted: SubstanceSlug | null
  onHoverChange: Dispatch<SetStateAction<SubstanceSlug | null>>
} | null>(null)

export function SubstanceCardHighlights({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [hovered, setHovered] = useState<SubstanceSlug | null>(null)

  return (
    <HighlightContext.Provider
      value={{ highlighted: hovered, onHoverChange: setHovered }}
    >
      {children}
    </HighlightContext.Provider>
  )
}

export default function SubstanceCards({
  group,
}: {
  group: 'classic' | 'non-classic'
}): JSX.Element {
  const highlight = useContext(HighlightContext)
  if (!highlight) throw new Error('Substance cards require shared highlights.')
  const guides = substanceGuides.filter(({ slug }) =>
    group === 'classic' ? slug !== 'mdma' : slug === 'mdma',
  )
  // Hover overrides only its own group; each group restores its first card.
  const highlighted = guides.some(({ slug }) => slug === highlight.highlighted)
    ? highlight.highlighted
    : group === 'classic'
      ? 'lsd'
      : 'mdma'
  const upcoming =
    group === 'classic'
      ? ['Mescaline', 'Ayahuasca', 'DMT']
      : ['Ketamine', 'Ibogaine']

  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      {guides.map((substance) => (
        <SubstanceCard
          key={substance.slug}
          slug={substance.slug}
          name={substance.name}
          chineseName={substance.chineseName}
          highlighted={highlighted === substance.slug}
          onHoverChange={highlight.onHoverChange}
        />
      ))}
      {upcoming.map((name) => (
        <Card key={name} className='flex h-full min-w-0 flex-col'>
          <CardHeader>
            <CardTitle className='font-garamond text-4xl font-medium'>
              {name}
            </CardTitle>
            <CardDescription className='text-base'>文章整理中</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col'>
            <div className='flex h-40 items-end justify-end'>
              <Badge variant='outline' className='font-normal'>
                {group === 'classic'
                  ? 'Classic psychedelic'
                  : 'Non-classic psychedelic'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
