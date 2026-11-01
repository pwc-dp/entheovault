import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import type { SubstancePapersResult } from '@/api/substancePapers'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getSubstanceGuide } from '@/data/substances'
import type { CompiledSubstanceGuide } from '@/lib/substances/compile'

export default function SubstanceMdx({
  guide,
  relatedPapers,
}: {
  guide: CompiledSubstanceGuide
  relatedPapers: SubstancePapersResult
}): JSX.Element {
  const { Content, bundle, references, occurrences } = guide
  const substance = getSubstanceGuide(bundle.slug)
  if (!substance) throw new Error(`Unknown guide substance ${bundle.slug}`)

  function Cite({ occurrence: id }: { occurrence: string }): JSX.Element {
    const occurrence = occurrences.find((item) => item.id === id)
    if (!occurrence) throw new Error(`Missing compiled citation ${id}`)
    const reference = references.find(
      (item) => item.number === occurrence.number,
    )
    return (
      <sup className='ml-0.5 inline-block align-super text-xs leading-none'>
        <a
          id={id}
          href={`#ref-${reference.paper.key}`}
          data-evidence={occurrence.evidenceKeys.join(' ')}
          aria-label={`參考文獻 ${occurrence.number}：${reference.paper.authors[0]}，${reference.paper.year}`}
          className='inline-flex min-h-6 min-w-6 scroll-mt-36 items-center justify-center rounded-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          [{occurrence.number}]
        </a>
      </sup>
    )
  }

  function References(): JSX.Element {
    return (
      <ol className='space-y-6 text-base leading-7'>
        {references.map(({ number, paper }) => (
          <li
            id={`ref-${paper.key}`}
            key={paper.key}
            tabIndex={-1}
            className='scroll-mt-36 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <div className='flex gap-3'>
              <span className='w-7 shrink-0 tabular-nums text-muted-foreground'>
                [{number}]
              </span>
              <div className='min-w-0 flex-1 space-y-2'>
                <Link
                  href={`/research/${paper.slug}`}
                  className='block break-words font-medium underline-offset-4 hover:underline'
                >
                  <cite className='not-italic'>{paper.title}</cite>
                </Link>
                <p className='break-words text-sm leading-6 text-muted-foreground'>
                  {paper.authors.join(', ')}. {paper.journal}. {paper.year}.
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  function RelatedPapers(): JSX.Element {
    return (
      <div className='space-y-5'>
        <p>
          從本站收錄的 {substance.name}{' '}
          文獻繼續閱讀，也可以探索資料庫中的文章、影片與其他資源。
        </p>
        {relatedPapers.status === 'available' &&
          relatedPapers.papers.length > 0 && (
            <ul>
              {relatedPapers.papers.map((paper, index) => (
                <li key={paper.id}>
                  {index > 0 && <Separator />}
                  <div className='space-y-1 py-4'>
                    <Link
                      href={`/research/${paper.slug}`}
                      className='block text-base font-medium leading-7 underline-offset-4 hover:underline'
                    >
                      {paper.title}
                    </Link>
                    <p className='text-sm text-muted-foreground'>
                      {paper.journal} ·{' '}
                      {new Date(paper.publishedAt).getUTCFullYear()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        <div className='flex flex-wrap gap-3'>
          <Button asChild variant='outline'>
            <Link href={`/research?substance=${substance.slug}`}>
              瀏覽 {substance.name} 研究{' '}
              <ArrowRight className='ml-2 h-4 w-4' aria-hidden />
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/database'>
              探索知識資料庫 <ArrowRight className='ml-2 h-4 w-4' aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='space-y-2 text-sm leading-7 text-muted-foreground'>
        <p>
          更新於 {bundle.updatedAt} · 本文引用 {references.length} 篇文獻
        </p>
      </div>
      <Content
        components={{
          GuideSection: ({
            id,
            children,
          }: {
            id: string
            children: ReactNode
          }) => (
            <section id={id} className='scroll-mt-36 space-y-5'>
              {children}
            </section>
          ),
          h2: ({ children }: { children: ReactNode }) => (
            <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              {children}
            </h2>
          ),
          Cite,
          References,
          RelatedPapers,
        }}
      />
    </>
  )
}
