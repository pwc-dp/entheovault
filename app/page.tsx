import type { Metadata } from 'next'

import { TheEye } from '@/components/Icons'
import { SITE_URL } from '@/constants/constants'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

const Home = async (): Promise<JSX.Element> => {
  return (
    <main className='relative z-10 flex min-h-[calc(100svh-5.25rem)] flex-1 flex-col'>
      <div className='container relative flex flex-1 flex-col justify-end px-6 pb-10 pt-36 sm:px-10 sm:pb-16 md:pb-20'>
        <div className='flex max-w-xl flex-col'>
          <div
            aria-hidden='true'
            className='relative mb-7 h-16 md:mb-9 md:h-24'
          >
            <TheEye className='absolute top-0 w-12 text-primary/80 md:w-20' />
            <TheEye className='absolute top-3 w-12 text-primary/65 md:top-5 md:w-20' />
            <TheEye className='absolute top-6 w-12 text-primary/20 md:top-10 md:w-20' />
          </div>
          <h1 className='mb-5 text-4xl font-semibold tracking-tight sm:mb-6 sm:text-6xl'>
            <span>
              The Doors <br /> of Perception
            </span>
          </h1>
          <p className='max-w-80 text-base leading-relaxed text-foreground/80 sm:text-xl'>
            Welcome to EntheoVault, a comprehensive resource for all things
            about psychedelics.
          </p>
        </div>
      </div>
    </main>
  )
}

export default Home
