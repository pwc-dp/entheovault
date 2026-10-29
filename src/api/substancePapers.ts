import { cache } from 'react'
import qs from 'qs'

import 'server-only'
import type { SubstanceSlug } from '@/data/substances'
import type { Paper } from '@/payload-types'

export type SubstancePaper = Pick<
  Paper,
  'id' | 'slug' | 'title' | 'journal' | 'publishedAt' | 'doi'
>

export interface SubstancePapersResult {
  status: 'available' | 'unavailable'
  papers: SubstancePaper[]
  totalDocs: number | null
}

// Keep this reader independent of Payload initialization: its v2 MongoDB adapter
// exits the process on connection failure, which must not take a guide page down.
export const getSubstancePapers = cache(
  async (substance: SubstanceSlug): Promise<SubstancePapersResult> => {
    try {
      const baseUrl =
        process.env.PAYLOAD_CMS_API_URL ||
        process.env.PAYLOAD_PUBLIC_SERVER_URL ||
        process.env.PAYLOAD_PUBLIC_CMS_URL ||
        'http://localhost:3000'
      const query = qs.stringify({
        where: { substance: { in: [substance] } },
        limit: 12,
        depth: 0,
        sort: '-publishedAt',
      })
      const response = await fetch(new URL(`/api/papers?${query}`, baseUrl), {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 300 },
      })

      if (!response.ok) throw new Error('Paper source unavailable')

      const result: { docs?: Paper[]; totalDocs?: number } =
        await response.json()

      if (!Array.isArray(result.docs) || typeof result.totalDocs !== 'number') {
        throw new Error('Invalid paper response')
      }

      const seen = new Set<string>()
      const uniquePapers = result.docs.filter((paper) => {
        const key =
          paper.doi
            ?.trim()
            .toLowerCase()
            .replace(/^(?:https?:\/\/)?(?:dx\.)?doi\.org\//, '')
            .replace(/^doi:\s*/, '') ||
          paper.slug ||
          paper.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      return {
        status: 'available',
        totalDocs: result.totalDocs,
        papers: uniquePapers.slice(0, 6).map((paper) => ({
          id: paper.id,
          slug: paper.slug,
          title: paper.title,
          journal: paper.journal,
          publishedAt: paper.publishedAt,
          doi: paper.doi,
        })),
      }
    } catch {
      return { status: 'unavailable', papers: [], totalDocs: null }
    }
  },
)
