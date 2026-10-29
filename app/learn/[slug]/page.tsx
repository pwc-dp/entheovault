import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getSubstancePapers } from '@/api/substancePapers'
import GuideDisclaimer from '@/components/GuideDisclaimer'
import SubstanceHeroBackground from '@/components/substances/SubstanceHeroBackground'
import SubstanceMdx from '@/components/substances/SubstanceMdx'
import { FiveMeoDmt, Lsd, Mdma, Psilocybin } from '@/components/SubstancesSvg'
import SubstanceToc from '@/components/SubstanceToc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SITE_NAME, SITE_OG_IMAGES, SITE_URL } from '@/constants/constants'
import { getSubstanceGuide, substanceGuides } from '@/data/substances'
import { getMdxSubstanceGuide } from '@/lib/substances/readGuide'
import { substanceSections } from '@/lib/substances/sections'

type Props = { params: { slug: string } }

export const revalidate = 300
const molecules = {
  lsd: Lsd,
  mdma: Mdma,
  psilocybin: Psilocybin,
  '5-meo-dmt': FiveMeoDmt,
}
const sectionClassName = 'scroll-mt-36 space-y-5'
const headingClassName = 'text-2xl font-semibold tracking-tight sm:text-3xl'

export function generateStaticParams(): { slug: string }[] {
  return substanceGuides.map(({ slug }) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const substance = getSubstanceGuide(params.slug)
  if (!substance) return { title: '找不到物質介紹' }
  return {
    title: `${substance.name} ${substance.chineseName}`,
    description: substance.description,
    alternates: { canonical: `${SITE_URL}/learn/${substance.slug}` },
    openGraph: {
      title: `${substance.name} ${substance.chineseName}`,
      description: substance.description,
      url: `${SITE_URL}/learn/${substance.slug}`,
      siteName: SITE_NAME,
      images: [SITE_OG_IMAGES.learn],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${substance.name} ${substance.chineseName}`,
      description: substance.description,
      images: [SITE_OG_IMAGES.learn],
    },
  }
}

export default async function SubstancePage({
  params,
}: Props): Promise<JSX.Element> {
  const substance = getSubstanceGuide(params.slug)
  if (!substance) notFound()
  const [result, guide] = await Promise.all([
    getSubstancePapers(substance.slug),
    getMdxSubstanceGuide(substance.slug),
  ])
  const Molecule = molecules[substance.slug]
  const researchUrl = `/research?substance=${substance.slug}`

  return (
    <div className='space-y-10'>
      <div className='relative isolate'>
        <SubstanceHeroBackground slug={substance.slug} />
        <div className='space-y-10'>
          <nav aria-label='物質導覽'>
            <Button asChild variant='ghost' size='sm' className='-ml-3'>
              <Link href='/learn'>
                <ArrowLeft className='mr-2 h-4 w-4' aria-hidden />
                所有指南
              </Link>
            </Button>
          </nav>

          <header className='grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_240px]'>
            <div className='min-w-0 space-y-5'>
              <div className='space-y-2'>
                <h1 className='break-words font-garamond text-5xl font-medium tracking-tight sm:text-6xl'>
                  {substance.name}
                </h1>
                <p className='text-xl'>{substance.chineseName}</p>
              </div>
              <Badge
                variant='secondary'
                className='max-w-full whitespace-normal text-sm font-normal'
              >
                {substance.category}
              </Badge>
              <p className='max-w-2xl text-lg leading-8 text-muted-foreground'>
                {substance.description}
              </p>
            </div>
            <figure>
              <Card>
                <CardContent className='space-y-4 p-6 text-center'>
                  <div
                    role='img'
                    aria-label={`${substance.name} 化學結構`}
                    className='flex h-36 items-center justify-center text-foreground'
                  >
                    <Molecule className='h-full w-full max-w-44 sm:h-full sm:w-full' />
                  </div>
                  <figcaption className='text-sm text-muted-foreground'>
                    化學結構
                  </figcaption>
                </CardContent>
              </Card>
            </figure>
          </header>

          <Separator />
        </div>
      </div>
      <GuideDisclaimer />
      <div className='grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12'>
        <SubstanceToc chapters={guide ? substanceSections : undefined} />
        <article className='min-w-0 max-w-3xl space-y-12 text-base leading-8 sm:text-lg'>
          {guide ? (
            <SubstanceMdx guide={guide} relatedPapers={result} />
          ) : 'basics' in substance ? (
            <>
              <section id='basics' className={sectionClassName}>
                <h2 className={headingClassName}>基本認識</h2>
                {substance.basics.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
              <section id='history' className={sectionClassName}>
                <h2 className={headingClassName}>研究歷程</h2>
                <p>{substance.history}</p>
              </section>
              <section id='research' className={sectionClassName}>
                <h2 className={headingClassName}>如何閱讀研究</h2>
                <p>{substance.research}</p>
                <Card className='bg-muted/30'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-base leading-7'>
                      閱讀時，一起留意
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 text-base'>
                    <ul className='list-disc space-y-1 pl-5'>
                      <li>研究對象與樣本數</li>
                      <li>對照方式與追蹤時間</li>
                      <li>研究限制與不良反應</li>
                    </ul>
                    <p className='text-muted-foreground'>
                      單篇研究呈現的是特定條件下的結果。
                    </p>
                  </CardContent>
                </Card>
              </section>
              <section id='risks' className={sectionClassName}>
                <h2 className={headingClassName}>風險與限制</h2>
                <p>{substance.risks}</p>
                <p className='text-base text-muted-foreground'>
                  本頁提供研究與教育資訊，不能取代個別醫療評估。
                </p>
              </section>
              <section id='studies' className='scroll-mt-36'>
                <Card>
                  <CardHeader className='space-y-3'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <h2 className={headingClassName}>相關文獻</h2>
                      {result.status === 'available' && (
                        <Badge
                          variant='secondary'
                          className='text-sm font-normal'
                        >
                          收錄 {result.totalDocs} 筆文獻
                        </Badge>
                      )}
                    </div>
                    <CardDescription className='text-base leading-7'>
                      從本站收錄文獻中，閱讀近期發表的研究。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.status === 'unavailable' ? (
                      <div role='status' className='space-y-4 text-base'>
                        <p>文獻暫時無法載入，請稍後重新整理。</p>
                        <Button variant='outline' asChild>
                          <Link href={researchUrl}>前往研究論文</Link>
                        </Button>
                      </div>
                    ) : result.papers.length === 0 ? (
                      <div className='space-y-4 text-base'>
                        <p>目前尚未收錄這個物質的相關文獻。</p>
                        <Button variant='outline' asChild>
                          <Link href='/research'>瀏覽其他研究</Link>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ul>
                          {result.papers.map((paper, index) => (
                            <li key={paper.id}>
                              <div className='flex flex-col gap-2 py-5 sm:flex-row sm:gap-5'>
                                <p className='shrink-0 text-sm tabular-nums text-muted-foreground sm:w-12'>
                                  {paper.publishedAt
                                    ? new Date(
                                        paper.publishedAt,
                                      ).getUTCFullYear()
                                    : '年份未提供'}
                                </p>
                                <div className='min-w-0 space-y-2'>
                                  <Link
                                    href={`/research/${paper.slug}`}
                                    className='block break-words text-base font-medium leading-7 underline-offset-4 hover:underline'
                                  >
                                    {paper.title}
                                  </Link>
                                  <p className='break-words text-sm leading-6 text-muted-foreground'>
                                    {paper.journal}
                                  </p>
                                </div>
                              </div>
                              {index < result.papers.length - 1 && (
                                <Separator />
                              )}
                            </li>
                          ))}
                        </ul>
                        <Button
                          asChild
                          variant='outline'
                          className='mt-4 h-auto min-h-10 whitespace-normal text-left'
                        >
                          <Link href={researchUrl}>
                            瀏覽 {substance.name} 研究論文{' '}
                            <ArrowRight
                              className='ml-2 h-4 w-4 shrink-0'
                              aria-hidden
                            />
                          </Link>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </section>
              <section aria-labelledby='sources-title' className='space-y-4'>
                <h2 id='sources-title' className='text-xl font-semibold'>
                  介紹資料來源
                </h2>
                <p className='text-base leading-7 text-muted-foreground'>
                  基本介紹、歷史與風險資訊參考 UC Berkeley Center for the
                  Science of Psychedelics
                  的公開教育資料。研究列表來自本站收錄文獻。
                </p>
                <Button
                  asChild
                  variant='link'
                  className='h-auto min-h-10 whitespace-normal px-0 text-left'
                >
                  <a href={substance.source} target='_blank' rel='noreferrer'>
                    BCSP：{substance.name}{' '}
                    <ArrowUpRight
                      className='ml-2 h-4 w-4 shrink-0'
                      aria-hidden
                    />
                    <span className='sr-only'>（另開分頁）</span>
                  </a>
                </Button>
              </section>
            </>
          ) : null}
        </article>
      </div>
      <Separator />
      <section aria-labelledby='continue-title' className='space-y-6'>
        <h2
          id='continue-title'
          className='text-2xl font-semibold tracking-tight'
        >
          繼續認識
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          {substanceGuides
            .filter(({ slug }) => slug !== substance.slug)
            .map(({ slug, name, chineseName }) => (
              <Card key={slug}>
                <CardHeader>
                  <CardTitle className='text-xl'>
                    <Link
                      href={`/learn/${slug}`}
                      className='inline-flex min-h-10 items-center gap-2 underline-offset-4 hover:underline'
                    >
                      {name}
                      <ArrowRight className='h-4 w-4' aria-hidden />
                    </Link>
                  </CardTitle>
                  <CardDescription className='text-base'>
                    {chineseName}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
