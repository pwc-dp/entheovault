'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface InvisibleRecaptchaProps {
  onVerify: (token: string | null) => void
  onError?: () => void
  onExpired?: () => void
}

export interface InvisibleRecaptchaRef {
  execute: () => void
  reset: () => void
}

const InvisibleRecaptcha = forwardRef<
  InvisibleRecaptchaRef,
  InvisibleRecaptchaProps
>(({ onVerify, onError, onExpired }, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  useImperativeHandle(ref, () => ({
    execute: () => {
      recaptchaRef.current?.execute()
    },
    reset: () => {
      recaptchaRef.current?.reset()
    },
  }))

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    console.warn(
      'reCAPTCHA site key not found. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.',
    )
    return null
  }

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      size='invisible'
      onChange={onVerify}
      onError={onError}
      onExpired={onExpired}
    />
  )
})

InvisibleRecaptcha.displayName = 'InvisibleRecaptcha'

export default InvisibleRecaptcha
