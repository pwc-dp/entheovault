'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { HamburgerIcon, PsychedelicDBIcon, TelegramIcon } from './Icons'
import ThemeSwitch from './ThemeSwitch'

import type { SidebarRecordMap } from '@/components/SidebarAccordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { GOOGLE_FORM_URL, SITE_NAME } from '@/constants/constants'
import { substanceGuides } from '@/data/substances'
import { cn } from '@/lib/utils'
import type { CategoryOptionsType } from '@/types'

const AlgoliaSearchComponent = dynamic(
  () => import('@/components/algolia/AlgoliaSearchComponent'),
  { ssr: false },
)

const SidebarAccordion = dynamic(
  () => import('@/components/SidebarAccordion'),
  {
    ssr: false,
  },
)

type MobileNavData = {
  categoriesMap: Partial<Record<CategoryOptionsType, string>>
  recordsMapEn: SidebarRecordMap
  recordsMapZh: SidebarRecordMap
}

const Header = (): JSX.Element => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mobileNavData, setMobileNavData] = useState<MobileNavData | null>(null)
  const [isMobileNavLoading, setIsMobileNavLoading] = useState(false)
  const [mobileNavError, setMobileNavError] = useState<string | null>(null)
  const pathname = usePathname()
  const isRoot = pathname === '/'
  const hasSubstanceHero = substanceGuides.some(
    ({ slug }) => pathname === `/learn/${slug}`,
  )
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    if (!hasSubstanceHero) return
    const updateScroll = (): void => setHasScrolled(window.scrollY > 16)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [hasSubstanceHero])
  const currentCategory = pathname?.split('/')[1]

  useEffect(() => {
    if (!sheetOpen || mobileNavData || isMobileNavLoading) return

    let mounted = true

    const fetchMobileNav = async (): Promise<void> => {
      setIsMobileNavLoading(true)
      setMobileNavError(null)

      try {
        const response = await fetch('/api/mobile-nav')

        if (!response.ok) {
          throw new Error('Failed to fetch mobile nav')
        }

        const data = (await response.json()) as MobileNavData

        if (mounted) {
          setMobileNavData(data)
        }
      } catch (_error: unknown) {
        if (mounted) {
          setMobileNavError('Unable to load the database list right now.')
        }
      } finally {
        if (mounted) {
          setIsMobileNavLoading(false)
        }
      }
    }

    void fetchMobileNav()

    return () => {
      mounted = false
    }
  }, [sheetOpen, mobileNavData, isMobileNavLoading])

  return (
    <header
      data-site-header
      className={cn(
        'sticky top-0 z-50 w-full items-center pb-6 pt-[1.85rem]',
        isRoot
          ? 'bg-transparent'
          : hasSubstanceHero && !hasScrolled
            ? 'border-b border-transparent bg-transparent py-3 sm:py-6'
            : 'border-b bg-background/90 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:py-6',
      )}
    >
      <div className='container flex w-full items-center justify-between gap-3 px-6 lg:pl-10 lg:pr-8'>
        <div className='flex items-center gap-2'>
          <Link
            className='flex items-center gap-1 transition-opacity hover:opacity-40 md:gap-1.5'
            href={'/'}
            title={`${SITE_NAME}`}
          >
            <PsychedelicDBIcon className='h-6 w-6 md:h-7 md:w-7' />
            <span className='font-garamond text-base sm:text-lg md:text-xl'>
              {SITE_NAME}
            </span>
          </Link>
        </div>
        <div className='flex items-center gap-1.5 md:gap-3 lg:gap-5'>
          {!isRoot && (
            <AlgoliaSearchComponent
              searchBarClassName='md:hidden xl:flex xl:w-52'
              searchIconClassName='md:inline-flex xl:hidden'
            />
          )}
          <div className='hidden items-center justify-around gap-3 md:flex lg:gap-5'>
            <div className='items-center gap-3 whitespace-nowrap text-foreground/70 md:flex lg:gap-5'>
              <Link
                href='/learn'
                className={cn(
                  currentCategory === 'learn' &&
                    'text-foreground underline underline-offset-4',
                  'whitespace-nowrap transition-opacity hover:opacity-40',
                )}
              >
                知識指南
              </Link>
              <Link
                href={'/database'}
                className={cn(
                  currentCategory === 'database' &&
                    'text-foreground underline underline-offset-4',
                  'transition-opacity hover:opacity-40',
                )}
              >
                資料庫
              </Link>
              <Link
                href={'/research'}
                className={cn(
                  currentCategory === 'research' &&
                    'text-foreground underline underline-offset-4',
                  'transition-opacity hover:opacity-40',
                )}
              >
                研究論文
              </Link>
              <Link
                href={'/about'}
                prefetch={false}
                className={cn(
                  currentCategory === 'about' &&
                    'text-foreground underline underline-offset-4',
                  'transition-opacity hover:opacity-40',
                )}
              >
                關於
              </Link>
            </div>
            <Separator orientation='vertical' className='h-6 w-[1.6px]' />
            <div className='flex items-center gap-3 lg:gap-5'>
              <ThemeSwitch />
              <Link
                href={GOOGLE_FORM_URL}
                target='_blank'
                aria-label='提供意見（另開分頁）'
                className='group block'
                prefetch={false}
              >
                <TelegramIcon className='text-primary transition-colors group-hover:text-primary/50' />
              </Link>
            </div>
          </div>
          <Link
            href={GOOGLE_FORM_URL}
            target='_blank'
            aria-label='提供意見（另開分頁）'
            className='mr-3 block md:hidden'
            prefetch={false}
          >
            <TelegramIcon className='h-5 w-5 text-primary' />
          </Link>
          <div className='flex md:hidden'>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger aria-label='開啟導覽選單'>
                <HamburgerIcon />
              </SheetTrigger>
              <SheetContent className='grid w-[85%] grid-rows-[calc(100dvh-6rem)_1fr] sm:w-[540px]'>
                <ScrollArea className='h-full'>
                  <div className='mb-8 text-muted-foreground'>
                    <PsychedelicDBIcon className='h-9 w-9' />
                  </div>
                  <div className='mb-4 flex flex-col gap-3 text-base sm:mb-6 sm:gap-3 sm:text-lg'>
                    <Link
                      href='/learn'
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        currentCategory === 'learn' &&
                          'underline underline-offset-4',
                        'transition-opacity hover:opacity-40',
                      )}
                    >
                      知識指南
                    </Link>
                    <Link
                      href={'/database'}
                      className='transition-opacity hover:opacity-40'
                    >
                      <span
                        onClick={(): void => setSheetOpen(false)}
                        className={cn(
                          currentCategory === 'database' &&
                            'underline underline-offset-4',
                        )}
                      >
                        資料庫
                      </span>
                    </Link>
                    <Link
                      href={'/research'}
                      className='transition-opacity hover:opacity-40'
                    >
                      <span
                        onClick={(): void => setSheetOpen(false)}
                        className={cn(
                          currentCategory === 'research' &&
                            'underline underline-offset-4',
                        )}
                      >
                        研究論文
                      </span>
                    </Link>
                    <Link
                      href={'/about'}
                      className='transition-opacity hover:opacity-40'
                      prefetch={false}
                    >
                      <span
                        onClick={(): void => setSheetOpen(false)}
                        className={cn(
                          currentCategory === 'about' &&
                            'underline underline-offset-4',
                        )}
                      >
                        關於
                      </span>
                    </Link>
                  </div>
                  {isMobileNavLoading && (
                    <div className='py-4 text-sm text-muted-foreground'>
                      Loading database list...
                    </div>
                  )}
                  {mobileNavError && (
                    <div className='py-4 text-sm text-destructive'>
                      {mobileNavError}
                    </div>
                  )}
                  {mobileNavData && (
                    <SidebarAccordion
                      recordsMapEn={mobileNavData.recordsMapEn}
                      recordsMapZh={mobileNavData.recordsMapZh}
                      categoriesMap={mobileNavData.categoriesMap}
                      onCategoryClickedAndCloseSheet={() => setSheetOpen(false)}
                    />
                  )}
                  <div className='my-4 flex items-center gap-4'>
                    Switch Theme
                    <ThemeSwitch />
                  </div>
                </ScrollArea>
                <div className='flex items-center justify-center font-garamond text-muted-foreground'>
                  {SITE_NAME}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
