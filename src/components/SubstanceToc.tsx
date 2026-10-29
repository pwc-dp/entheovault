'use client'

import { useEffect, useRef, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const legacyChapters = [
  { id: 'basics', title: '基本認識' },
  { id: 'history', title: '研究歷程' },
  { id: 'research', title: '如何閱讀研究' },
  { id: 'risks', title: '風險與限制' },
  { id: 'studies', title: '相關文獻' },
]

export default function SubstanceToc({
  chapters = legacyChapters,
}: {
  chapters?: readonly { id: string; title: string }[]
}): JSX.Element {
  const [active, setActive] = useState(chapters[0].id)
  const [open, setOpen] = useState('')
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frame = 0
    const update = (): void => {
      const first = document.getElementById(chapters[0].id)
      const offset = first
        ? parseFloat(getComputedStyle(first).scrollMarginTop)
        : 0
      const threshold = Math.max(Math.min(innerHeight * 0.3, 200), offset + 4)
      let current = chapters[0].id
      for (const { id } of chapters) {
        if (
          (document.getElementById(id)?.getBoundingClientRect().top ??
            Infinity) <= threshold
        )
          current = id
      }
      setActive(current)
      frame = 0
    }
    const onScroll = (): void => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [chapters])

  const chapterLinks = (mobile = false): JSX.Element[] =>
    chapters.map(({ id, title }) => (
      <Button
        key={id}
        variant='ghost'
        asChild
        className={cn(
          'h-auto min-h-11 w-full justify-start whitespace-normal text-left text-base',
          active === id && 'bg-accent text-accent-foreground',
        )}
      >
        <a
          href={`#${id}`}
          aria-current={active === id ? 'location' : undefined}
          onClick={() => {
            setActive(id)
            if (mobile) {
              setOpen('')
              requestAnimationFrame(() =>
                trigger.current?.focus({ preventScroll: true }),
              )
            }
          }}
        >
          {title}
        </a>
      </Button>
    ))

  return (
    <>
      <aside className='sticky top-28 hidden self-start lg:block'>
        <p className='mb-3 px-4 text-sm font-medium text-muted-foreground'>
          本頁章節
        </p>
        <nav aria-label='本頁章節' className='space-y-1'>
          {chapterLinks()}
        </nav>
        <Button variant='link' asChild className='mt-4 text-muted-foreground'>
          <a href='#guide-main'>回到頁首</a>
        </Button>
      </aside>
      <Accordion
        type='single'
        collapsible
        value={open}
        onValueChange={setOpen}
        className='rounded-lg border bg-card text-card-foreground lg:hidden'
      >
        <AccordionItem value='chapters' className='border-0'>
          <AccordionTrigger
            ref={trigger}
            isOpen={open === 'chapters'}
            className='gap-4 px-4 py-2'
          >
            <span>本頁章節</span>
            <span className='ml-auto text-sm text-muted-foreground'>
              {chapters.find(({ id }) => id === active)?.title}
            </span>
          </AccordionTrigger>
          <AccordionContent className='px-2'>
            <nav aria-label='本頁章節' className='space-y-1'>
              {chapterLinks(true)}
            </nav>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}
