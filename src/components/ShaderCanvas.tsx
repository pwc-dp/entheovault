'use client'

import { useEffect, useRef, useState } from 'react'
import type { ShaderInstance } from 'shaders/js'
import { createShader } from 'shaders/js'

export default function ShaderCanvas({
  isPlaying,
  onReady,
}: {
  isPlaying: boolean
  onReady: () => void
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shaderRef = useRef<ShaderInstance | null>(null)
  const playingRef = useRef(isPlaying)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    playingRef.current = isPlaying
    const shader = shaderRef.current
    if (!shader || !isReady) return
    if (isPlaying) shader.resume()
    else shader.pause()
  }, [isPlaying, isReady])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let hasRendered = false
    let shader: ShaderInstance | null = null

    const initialize = async (): Promise<void> => {
      try {
        shader = await createShader(
          canvas,
          {
            components: [
              {
                type: 'Swirl',
                props: {
                  colorA: '#ed986f',
                  colorB: '#286d74',
                  colorSpace: 'oklch',
                  blend: 45,
                  detail: 1.4,
                  speed: 0.6,
                },
              },
              {
                type: 'WaveDistortion',
                props: {
                  angle: 25,
                  edges: 'stretch',
                  frequency: 1.2,
                  speed: 0.35,
                  strength: 0.12,
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
              hasRendered = true
              if (!playingRef.current) shader?.pause()
              setIsReady(true)
              onReady()
            },
          },
        )
        if (disposed) {
          shader.destroy()
          return
        }
        shaderRef.current = shader
        if (hasRendered && !playingRef.current) shader.pause()
      } catch {
        // Keep the theme background if this browser cannot render the effect.
        shader?.destroy()
      }
    }

    // Discard Strict Mode's preliminary mount before creating a GPU context.
    const paintFrame = requestAnimationFrame(() => void initialize())
    return () => {
      disposed = true
      cancelAnimationFrame(paintFrame)
      shader?.destroy()
      shaderRef.current = null
    }
  }, [onReady])

  return (
    <div className='absolute inset-0'>
      <canvas
        ref={canvasRef}
        data-renderer='shaders'
        data-ready={isReady}
        className='block h-full w-full transition-opacity duration-700 ease-out motion-reduce:transition-none'
        style={{ width: '100%', height: '100%', opacity: isReady ? 1 : 0 }}
      />
    </div>
  )
}
