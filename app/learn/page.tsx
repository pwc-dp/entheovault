import type { Metadata } from 'next'

import GuideDisclaimer from '@/components/GuideDisclaimer'
import LearnBackground from '@/components/LearnBackground'
import SubstanceCards, {
  SubstanceCardHighlights,
} from '@/components/substances/SubstanceCards'
import { Separator } from '@/components/ui/separator'
import { SITE_NAME, SITE_OG_IMAGES, SITE_URL } from '@/constants/constants'

export const metadata: Metadata = {
  title: '知識指南',
  description: '以研究文獻為基礎，認識啟靈物質、理解研究發現與使用風險。',
  alternates: { canonical: `${SITE_URL}/learn` },
  openGraph: {
    title: '知識指南',
    description: '以研究文獻為基礎，認識啟靈物質、理解研究發現與使用風險。',
    url: `${SITE_URL}/learn`,
    siteName: SITE_NAME,
    images: [SITE_OG_IMAGES.learn],
  },
  twitter: {
    card: 'summary_large_image',
    title: '知識指南',
    description: '以研究文獻為基礎，認識啟靈物質、理解研究發現與使用風險。',
    images: [SITE_OG_IMAGES.learn],
  },
}

export const revalidate = 300

const upcomingCategories = [
  {
    id: 'mechanisms',
    title: '作用機制',
    description: '從受體到神經可塑性，理解啟靈物質的作用。',
    topics: ['血清素受體', '神經可塑性', 'BDNF'],
  },
  {
    id: 'harm-reduction',
    title: '減害與安全',
    description: '認識可能的不良反應，以及影響風險的條件。',
    topics: ['不良事件與潛在風險', '藥物交互作用'],
  },
  {
    id: 'set-and-setting',
    title: '心理與環境',
    description: '理解心理狀態、環境，以及經驗前後的支持。',
    topics: ['Set and setting', '準備與整合'],
  },
] as const

export default function LearnPage(): JSX.Element {
  return (
    <div className='relative isolate'>
      <LearnBackground />
      <div className='space-y-16 sm:space-y-20'>
        <div className='mb-64 mt-16'>
          <section className='relative'>
            <h1 className='mb-12 font-serif text-5xl md:mb-32 md:text-6xl'>
              <span>Psychedelic Compass</span>
            </h1>
            <div className='text-base text-secondary-foreground sm:text-lg md:ml-auto md:w-[45%]'>
              <p>以研究文獻為基礎，認識啟靈物質、理解研究發現與使用風險</p>
              <GuideDisclaimer />
            </div>
          </section>
        </div>
        <SubstanceCardHighlights>
          <div className='space-y-16 sm:space-y-20'>
            <section
              aria-labelledby='compounds-title'
              className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16'
            >
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <h2
                    id='compounds-title'
                    className='text-2xl font-semibold tracking-tight sm:text-3xl'
                  >
                    經典啟靈物質
                  </h2>
                  <p className='text-base tracking-wider text-muted-foreground'>
                    Classic psychedelics
                  </p>
                </div>
                <p className='text-base text-secondary-foreground sm:text-lg sm:leading-[1.8]'>
                  啟靈物質（psychedelics）是一類能明顯改變感知、情緒與思考方式的精神活性物質。這些變化可以表現在形狀與色彩的感受、時間感，以及對自身與周遭世界的體驗；「迷幻」並不表示每次都會看見不存在的事物。經典啟靈物質包括
                  LSD、psilocybin 與 mescaline
                  等，它們的共同藥理特徵，是啟靈作用主要透過活化血清素 5-HT₂A
                  受體產生。這裡的「經典」指的是這類作用特徵，而不是天然或合成的區別，因為其中既有天然化合物，像是
                  psilocybin 與 mescaline，也有像 LSD 這樣的半合成物質
                </p>
              </div>
              <SubstanceCards group='classic' />
            </section>
            <section
              aria-labelledby='non-classic-title'
              className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16'
            >
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <h2
                    id='non-classic-title'
                    className='text-2xl font-semibold tracking-tight sm:text-3xl'
                  >
                    非經典啟靈物質
                  </h2>
                  <p className='text-base tracking-wider text-muted-foreground'>
                    Non-classic psychedelics
                  </p>
                </div>
                <p className='text-base text-secondary-foreground sm:text-lg sm:leading-[1.8]'>
                  非經典啟靈物質（non-classic psychedelics）
                  用來概括其他作用機制的物質，他們可能具有不同的藥理作用機制。MDMA
                  雖然也可能改變時間感與視覺感受，主要作用卻涉及單胺轉運蛋白，與經典啟靈物質不同。
                  Ketamine 則以 NMDA 受體拮抗作用為特徵
                </p>
              </div>
              <SubstanceCards group='non-classic' />
            </section>
          </div>
        </SubstanceCardHighlights>

        {upcomingCategories.map(({ id, title, description, topics }) => (
          <section
            key={id}
            aria-labelledby={`${id}-title`}
            className='space-y-6'
          >
            <Separator />
            <div className='grid gap-6 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12'>
              <div className='space-y-3'>
                <h2
                  id={`${id}-title`}
                  className='text-2xl font-semibold tracking-tight sm:text-3xl'
                >
                  {title}
                </h2>
                <p className='max-w-sm text-base leading-7 text-muted-foreground'>
                  {description}
                </p>
                <p className='text-sm text-muted-foreground'>文章整理中</p>
              </div>
              <ul className='divide-y divide-border'>
                {topics.map((topic) => (
                  <li key={topic} className='py-4 text-lg first:pt-0'>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
