'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTheme } from 'next-themes'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SubstanceSlug } from '@/data/substances'

const SubstanceCardCanvas = dynamic(() => import('./SubstanceCardCanvas'), {
  ssr: false,
})

export default function SubstanceCard({
  slug,
  name,
  chineseName,
  highlighted,
  onHoverChange,
}: {
  slug: SubstanceSlug
  name: string
  chineseName: string
  highlighted: boolean
  onHoverChange: Dispatch<SetStateAction<SubstanceSlug | null>>
}): JSX.Element {
  const { resolvedTheme } = useTheme()
  const cardSourceRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [hasActivated, setHasActivated] = useState(false)
  const [inView, setInView] = useState(false)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [motionAllowed, setMotionAllowed] = useState(false)
  const active = highlighted && visible && motionAllowed && inView
  const invertText = (slug === '5-meo-dmt' || slug === 'lsd') && active && ready
  const hoverTextStyle = {
    color: invertText ? 'hsl(var(--background))' : undefined,
  }

  useEffect(() => {
    const preference = window.matchMedia(
      '(prefers-reduced-motion: no-preference)',
    )
    const updatePreference = (): void => setMotionAllowed(preference.matches)
    const updateVisibility = (): void => setVisible(!document.hidden)
    updatePreference()
    updateVisibility()
    preference.addEventListener('change', updatePreference)
    document.addEventListener('visibilitychange', updateVisibility)
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
      if (!entry.isIntersecting) {
        onHoverChange((current) => (current === slug ? null : current))
      }
    })
    if (linkRef.current) observer.observe(linkRef.current)
    return () => {
      preference.removeEventListener('change', updatePreference)
      document.removeEventListener('visibilitychange', updateVisibility)
      observer.disconnect()
    }
  }, [onHoverChange, slug])

  useEffect(() => {
    if (active) setHasActivated(true)
  }, [active])

  const shaderOverlay =
    hasActivated || active ? (
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit] transition-opacity duration-200 motion-reduce:transition-none'
        style={{ opacity: active && ready ? 1 : 0 }}
      >
        <SubstanceCardCanvas
          slug={slug}
          active={active}
          sourceRef={cardSourceRef}
          theme={resolvedTheme}
          onReady={setReady}
        />
      </div>
    ) : null

  return (
    <Link
      ref={linkRef}
      href={`/learn/${slug}`}
      aria-label={`認識 ${name}：${chineseName}`}
      className='group relative isolate block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse' || !motionAllowed) return
        onHoverChange(slug)
      }}
      onPointerLeave={() =>
        onHoverChange((current) => (current === slug ? null : current))
      }
      onPointerCancel={() =>
        onHoverChange((current) => (current === slug ? null : current))
      }
    >
      <Card
        className='relative z-10 flex h-full flex-col overflow-hidden transition-transform motion-reduce:transition-none motion-safe:sm:group-hover:-translate-x-2 motion-safe:sm:group-hover:-translate-y-2 motion-safe:lg:group-hover:-translate-x-3 motion-safe:lg:group-hover:-translate-y-3'
        data-card-effect={slug}
        data-shader-ready={ready}
        data-shader-active={active}
      >
        <div
          ref={cardSourceRef}
          className='relative z-[2] flex h-full flex-col'
        >
          <CardHeader>
            <CardTitle
              className='font-garamond text-4xl font-medium transition-colors duration-200 motion-reduce:transition-none'
              style={hoverTextStyle}
            >
              {name}
            </CardTitle>
            <CardDescription
              className='text-base transition-colors duration-200 motion-reduce:transition-none'
              style={hoverTextStyle}
            >
              {chineseName}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col'>
            <div className='flex h-40 items-end justify-end'>
              <Badge
                variant='outline'
                className='font-normal transition-colors duration-200 motion-reduce:transition-none'
                style={{
                  ...hoverTextStyle,
                  borderColor: invertText
                    ? 'hsl(var(--background))'
                    : undefined,
                }}
              >
                {slug === 'mdma' ? 'Entactogen' : 'Classic psychedelic'}
              </Badge>
            </div>
          </CardContent>
        </div>
        {shaderOverlay}
      </Card>
      <div
        aria-hidden
        className='pointer-events-none absolute left-1 top-1 -z-10 h-[calc(100%-5px)] w-[calc(100%-5px)] rounded-lg bg-foreground'
      />
    </Link>
  )
}
