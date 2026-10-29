'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ShaderInstance } from 'shaders/js'

export default function LearnBackground(): JSX.Element {
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !resolvedTheme) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let rendered = false
    let shader: ShaderInstance | null = null
    setReady(false)

    const updatePlayback = (): void => {
      if (!rendered) return
      if (document.hidden || preference.matches) shader?.pause()
      else shader?.resume()
    }

    const initialize = async (): Promise<void> => {
      try {
        const { createShader } = await import('shaders/js')
        if (disposed) return
        const dark = resolvedTheme === 'dark'
        shader = await createShader(
          canvas,
          {
            components: [
              {
                type: 'Blob',
                props: {
                  center: { x: 0.5, y: 0.5 },
                  colorA: '#59CAC4',
                  colorB: dark ? '#8558bf' : '#b693df',
                  colorSpace: 'oklab',
                  size: 0.4,
                  deformation: 0.65,
                  softness: 0.55,
                  highlightIntensity: 0.2,
                  highlightColor: dark ? '#a0c9ec' : '#e0ecff',
                  speed: 0.3,
                  seed: 1,
                },
              },
            ],
          },
          {
            colorSpace: 'srgb',
            disableTelemetry: true,
            enablePerformanceTracking: false,
            onReady: () => {
              if (disposed) return
              rendered = true
              setReady(true)
              updatePlayback()
            },
            onError: () => {
              if (!disposed) setReady(false)
            },
          },
        )
        if (disposed) shader.destroy()
        else updatePlayback()
      } catch {
        shader?.destroy()
        // The normal theme background remains visible without WebGPU support.
        if (!disposed) setReady(false)
      }
    }

    preference.addEventListener('change', updatePlayback)
    document.addEventListener('visibilitychange', updatePlayback)
    const frame = requestAnimationFrame(() => void initialize())
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      preference.removeEventListener('change', updatePlayback)
      document.removeEventListener('visibilitychange', updatePlayback)
      shader?.destroy()
    }
  }, [resolvedTheme])

  return (
    <div
      aria-hidden='true'
      data-learn-background='blob'
      data-shader-ready={ready}
      className='pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden transition-opacity duration-700 motion-reduce:transition-none'
      style={{ opacity: ready ? (resolvedTheme === 'dark' ? 0.45 : 0.4) : 0 }}
    >
      <div
        className='aspect-square w-[min(120vmin,1000px)] max-w-none shrink-0'
        style={{
          // Blob deformation can reach the canvas bounds. Fade before those
          // bounds so animation never exposes the rectangular drawing surface.
          maskImage:
            'radial-gradient(circle closest-side, black 45%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle closest-side, black 45%, transparent 100%)',
        }}
      >
        <canvas ref={canvasRef} className='block h-full w-full' />
      </div>
    </div>
  )
}
