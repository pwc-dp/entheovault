import clsx from 'clsx'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import localFont from 'next/font/local'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import './globals.css'
import CategoriedHeader from '@/components/CategoriedHeader'
import HomeShader from '@/components/Shader'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  SITE_META_KEYWORDS,
  SITE_NAME,
  SITE_NAME_ZH,
  SITE_OG_IMAGES,
  SITE_URL,
} from '@/constants/constants'

const PostHogInit = dynamic(
  () => import('@/components/PostHogProvider').then((mod) => mod.PostHogInit),
  { ssr: false },
)

const Toaster = dynamic(
  () => import('@/components/ui/sonner').then((mod) => mod.Toaster),
  { ssr: false },
)

const siteTitle = `${SITE_NAME_ZH}\u00A0${SITE_NAME}`
const siteDescription = `${siteTitle} 以啟靈物質的科學研究與公共教育為核心，收錄研究論文、教育資源與專業見解，協助大眾理解啟靈物質對心理健康、個人成長與社會福祉的潛在影響，以及相關風險。本資料庫由台灣啟靈意識研究學會維護與管理。`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  keywords: SITE_META_KEYWORDS,
  title: {
    default: siteTitle,
    template: `%s – ${SITE_NAME_ZH} ${SITE_NAME}`,
  },
  description: siteDescription,
  openGraph: {
    title: {
      default: `${siteTitle} – 通往啟靈研究與知識之門`,
      template: `%s – ${SITE_NAME_ZH} ${SITE_NAME}`,
    },
    description: siteDescription,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'zh_TW',
    type: 'website',
    images: [SITE_OG_IMAGES.default],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: `${siteTitle} – 通往啟靈研究與知識之門`,
      template: `%s – ${SITE_NAME_ZH} ${SITE_NAME}`,
    },
    description: siteDescription,
    images: [SITE_OG_IMAGES.default],
  },
}

// loading local fonts
const garamond = localFont({
  src: [
    {
      path: '../public/fonts/cormorant-garamond-medium.woff2',
      weight: '500',
    },
  ],
  variable: '--font-garamond',
})

// const notoTc = localFont({
//   src: [
//     {
//       path: '../public/fonts/noto-sans-tc-regular.woff2',
//       weight: '400',
//     },
//     {
//       path: '../public/fonts/noto-sans-tc-semi-bold.woff2',
//       weight: '600',
//     },
//   ],
//   variable: '--font-noto',
// })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html
      lang='zh-TW'
      suppressHydrationWarning
      className={clsx(garamond.variable)}
    >
      <body className='relative flex min-h-[100dvh] flex-col font-noto antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          disableTransitionOnChange
        >
          <HomeShader />
          <CategoriedHeader />
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </ThemeProvider>
        <PostHogInit />
      </body>
    </html>
  )
}
