'use client'

import type { Dispatch, RefObject, SetStateAction } from 'react'
import { useEffect, useRef } from 'react'
import type { ComponentConfig, ShaderInstance } from 'shaders/js'
import { createShader } from 'shaders/js'

import type { SubstanceSlug } from '@/data/substances'

function layers(slug: SubstanceSlug, dark: boolean): ComponentConfig[] {
  const colorA =
    slug === 'lsd'
      ? dark
        ? '#102f52'
        : '#164c7e'
      : slug === 'mdma'
        ? dark
          ? '#532f40'
          : '#e8adb7'
        : dark
          ? '#23464c'
          : '#b8d3d0'
  const colorB =
    slug === 'lsd'
      ? dark
        ? '#20555d'
        : '#397f85'
      : slug === 'mdma'
        ? dark
          ? '#443d55'
          : '#cdb0c6'
        : dark
          ? '#674438'
          : '#efa77f'
  if (slug === 'psilocybin' || slug === 'mdma')
    return [
      {
        type: 'MeshGradient',
        props: {
          colorA,
          colorB,
          colorSpace: 'oklch',
          stops: [
            { color: colorA, position: 0 },
            {
              color:
                slug === 'mdma'
                  ? dark
                    ? '#573f3c'
                    : '#f6e3d5'
                  : dark
                    ? '#3e4452'
                    : '#e7e8de',
              position: 0.5,
            },
            { color: colorB, position: 1 },
          ],
          speed: 3,
          count: 5,
          drift: 1,
          swirl: 0.3,
        },
      },
    ]
  return [
    {
      type: 'Swirl',
      props: {
        colorA,
        colorB,
        colorSpace: 'oklch',
        detail: 1.4,
        speed: 0.7,
        blend: 50,
      },
    },
  ]
}

export default function SubstanceCardCanvas({
  slug,
  active,
  sourceRef,
  theme,
  onReady,
}: {
  slug: SubstanceSlug
  active: boolean
  sourceRef: RefObject<HTMLDivElement>
  theme?: string
  onReady: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shaderRef = useRef<ShaderInstance | null>(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
    if (active) shaderRef.current?.resume()
    else shaderRef.current?.pause()
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const source = sourceRef.current
    if (!canvas || !source) return
    let disposed = false
    let instance: ShaderInstance | null = null
    let observer: ResizeObserver | null = null
    onReady(false)
    const resize = (): void => {
      const box = source.getBoundingClientRect()
      // resize() takes CSS dimensions and applies the renderer's pixel ratio.
      instance?.resize(Math.round(box.width), Math.round(box.height))
    }
    const initialize = async (): Promise<void> => {
      try {
        if (disposed) return
        instance = await createShader(
          canvas,
          { components: layers(slug, theme === 'dark') },
          {
            colorSpace: 'srgb',
            disableTelemetry: true,
            enablePerformanceTracking: false,
            observeElement: false,
            onReady: () => {
              if (disposed) return
              onReady(true)
              if (!activeRef.current) instance?.pause()
            },
            onError: () => {
              if (!disposed) onReady(false)
            },
          },
        )
        if (disposed) {
          instance.destroy()
          return
        }
        shaderRef.current = instance
        resize()
        observer = new ResizeObserver(resize)
        observer.observe(source)
        if (!activeRef.current) instance.pause()
      } catch {
        instance?.destroy()
        if (!disposed) onReady(false)
      }
    }
    const frame = requestAnimationFrame(() => void initialize())
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      instance?.destroy()
      shaderRef.current = null
    }
  }, [slug, sourceRef, theme, onReady])

  return (
    <canvas
      ref={canvasRef}
      data-card-shader={slug}
      className='block h-full w-full'
    />
  )
}
