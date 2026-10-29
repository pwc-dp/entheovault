'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const ShaderCanvas = dynamic(() => import('./ShaderCanvas'), { ssr: false })

export default function HomeShader(): JSX.Element {
  const pathname = usePathname()

  return pathname === '/' ? <HomeShaderBackground /> : null
}

function HomeShaderBackground(): JSX.Element {
  const [isReady, setIsReady] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null)
  const isPlaying = motionOverride ?? !prefersReducedMotion
  const canAnimate = isVisible && isPlaying
  const handleReady = useCallback(() => setIsReady(true), [])

  useEffect(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const updateMotionPreference = (): void => {
      setPrefersReducedMotion(motionPreference.matches)
    }
    const updateVisibility = (): void => {
      setIsVisible(!document.hidden)
    }

    updateMotionPreference()
    updateVisibility()
    motionPreference.addEventListener('change', updateMotionPreference)
    document.addEventListener('visibilitychange', updateVisibility)

    return () => {
      motionPreference.removeEventListener('change', updateMotionPreference)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  return (
    <>
      <div
        aria-hidden='true'
        className='home-shader pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background'
        data-animation={canAnimate ? 'enabled' : 'disabled'}
        data-ready={isReady}
      >
        <ShaderCanvas isPlaying={canAnimate} onReady={handleReady} />
        <div className='home-shader-scrim absolute inset-0' />
      </div>
      {/* {isReady && (
        <button
          type='button'
          aria-label={isPlaying ? '暫停背景動畫' : '播放背景動畫'}
          aria-pressed={!isPlaying}
          title={isPlaying ? '暫停背景動畫' : '播放背景動畫'}
          onClick={() => setMotionOverride(!isPlaying)}
          className='fixed bottom-5 right-5 z-20 flex size-11 items-center justify-center rounded-full bg-background/80 text-foreground transition-opacity hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground'
        >
          {isPlaying ? (
            <Pause size={17} aria-hidden />
          ) : (
            <Play size={17} aria-hidden />
          )}
        </button>
      )} */}
    </>
  )
}
