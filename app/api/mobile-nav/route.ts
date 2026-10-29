import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/getPayload'
import type { CategoryOptionsType } from '@/types'

interface MobileNavRecord {
  id: string
  slug: string
  title: string
  category: CategoryOptionsType
  language: 'zh-tw' | 'en'
}

type MobileNavRecordMap = Partial<
  Record<CategoryOptionsType, MobileNavRecord[]>
>

export async function GET(): Promise<NextResponse> {
  try {
    const payload = await getPayloadClient()

    const [recordsResult, categoriesResult] = await Promise.all([
      payload.find({
        collection: 'records',
        where: {
          isRecordShow: {
            equals: true,
          },
        },
        limit: 300,
      }),
      payload.find({
        collection: 'categories',
        limit: 300,
      }),
    ])

    const records = recordsResult.docs as MobileNavRecord[]
    const recordsMapEn: MobileNavRecordMap = {}
    const recordsMapZh: MobileNavRecordMap = {}

    const categoriesMap = categoriesResult.docs.reduce(
      (acc, category) => {
        acc[category.value as CategoryOptionsType] = category.displayName
        return acc
      },
      {} as Partial<Record<CategoryOptionsType, string>>,
    )

    const assignRecordsToMap = (
      data: MobileNavRecord[],
      map: MobileNavRecordMap,
    ): void => {
      data
        .sort((a, b) => a.title.localeCompare(b.title))
        .forEach((record) => {
          map[record.category] = map[record.category] || []
          map[record.category].push({
            id: record.id,
            slug: record.slug,
            title: record.title,
            category: record.category,
            language: record.language,
          })
        })
    }

    assignRecordsToMap(
      records.filter((record) => record.language === 'zh-tw'),
      recordsMapZh,
    )
    assignRecordsToMap(
      records.filter((record) => record.language === 'en'),
      recordsMapEn,
    )

    return NextResponse.json({
      categoriesMap,
      recordsMapEn,
      recordsMapZh,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to load mobile navigation.' },
      { status: 500 },
    )
  }
}
