'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

import type { SubstanceSlug } from '@/data/substances'

const SubstanceCardCanvas = dynamic(() => import('./SubstanceCardCanvas'), {
  ssr: false,
})

export default function SubstanceHeroBackground({
  slug,
}: {
  slug: SubstanceSlug
}): JSX.Element {
  const { resolvedTheme } = useTheme()
  const sourceRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0 })
  const [visible, setVisible] = useState(true)
  const [inView, setInView] = useState(false)
  const [motionAllowed, setMotionAllowed] = useState(false)

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
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    )
    if (sourceRef.current) observer.observe(sourceRef.current)

    return () => {
      preference.removeEventListener('change', updatePreference)
      document.removeEventListener('visibilitychange', updateVisibility)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const hero = sourceRef.current?.parentElement
    if (!hero) return
    const updateBounds = (): void => {
      const rect = hero.getBoundingClientRect()
      // Extend from the document top to the existing divider, independent of
      // the centered content container. clientWidth excludes the scrollbar.
      setBounds({
        left: -rect.left,
        top: -(rect.top + window.scrollY),
        width: document.documentElement.clientWidth,
      })
    }
    updateBounds()
    const observer = new ResizeObserver(updateBounds)
    observer.observe(hero)
    const header = document.querySelector('[data-site-header]')
    if (header) observer.observe(header)
    window.addEventListener('resize', updateBounds)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateBounds)
    }
  }, [])

  return (
    <div
      ref={sourceRef}
      aria-hidden
      data-substance-hero={slug}
      data-shader-ready={ready}
      className='pointer-events-none absolute bottom-0 -z-10 overflow-hidden transition-opacity duration-700 motion-reduce:transition-none'
      style={{
        left: bounds.left,
        top: bounds.top,
        width: bounds.width || '100%',
        opacity: ready ? 1 : 0,
        maskImage:
          'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
      }}
    >
      <SubstanceCardCanvas
        slug={slug}
        active={visible && inView && motionAllowed}
        sourceRef={sourceRef}
        theme={resolvedTheme}
        onReady={setReady}
      />
      <div
        className={
          slug === 'lsd'
            ? 'absolute inset-0 bg-background/60'
            : 'absolute inset-0 bg-background/20'
        }
      />
    </div>
  )
}
