import { Metadata } from 'next'

import Footer from '@/components/Footer'
import { PsychedelicDBIcon } from '@/components/Icons'
import { SITE_NAME, SITE_OG_IMAGES, SITE_URL } from '@/constants/constants'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '關於',
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
      title: '關於',
      url: `${SITE_URL}/about`,
      siteName: SITE_NAME,
      images: [SITE_OG_IMAGES.default],
    },
    twitter: {
      title: '關於',
      images: [SITE_OG_IMAGES.default],
    },
  }
}

const AboutPage = (): JSX.Element => {
  return (
    <div className='flex w-full flex-1 flex-col justify-between'>
      <main className='relative flex flex-1 flex-col flex-wrap items-center justify-center gap-2 px-4 font-garamond text-lg sm:text-2xl md:gap-3'>
        <span className='z-10 text-center text-lg sm:text-2xl'>
          Ultimate Reality
        </span>
        <PsychedelicDBIcon className='absolute z-0 h-36 w-36 opacity-[5%] md:h-52 md:w-52' />
      </main>
      <Footer />
    </div>
  )
}
export default AboutPage
