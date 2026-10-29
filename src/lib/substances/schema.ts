import { z } from 'zod'

import { substanceOptions } from '../../config/options'
import { studyDesignLabels } from './sections'

const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const text = z.string().trim().min(1)
const substance = z.enum(
  Object.keys(substanceOptions) as [
    keyof typeof substanceOptions,
    ...Array<keyof typeof substanceOptions>,
  ],
)
const section = z.enum([
  'basics',
  'history',
  'benefits',
  'risks',
  'therapy',
  'related',
  'references',
])

export const normalizeDoi = (value: string): string =>
  value
    .trim()
    .replace(/^doi:\s*/i, '')
    .replace(/^(?:https?:\/\/)?(?:dx\.)?doi\.org\//i, '')
    .toLowerCase()

export const paperSourceSchema = z.object({
  filename: text,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  pdfPageCount: z.number().int().positive(),
})

export const researchEvidenceSchema = z
  .object({
    key,
    paperKey: key,
    substances: z.array(substance).min(1),
    sections: z.array(section).min(1),
    kind: z.enum(['background', 'result', 'limitation']),
    statement: text,
    source: z.object({
      pdfPage: z.number().int().positive(),
      section: text,
      quote: text,
    }),
    study: z.object({
      design: z.enum(
        Object.keys(studyDesignLabels) as [
          keyof typeof studyDesignLabels,
          ...Array<keyof typeof studyDesignLabels>,
        ],
      ),
      context: z.enum([
        'naturalistic-use',
        'clinical-treatment',
        'review',
        'preclinical-animal',
        'laboratory',
      ]),
      population: text,
      sampleSize: z.number().int().positive().nullish(),
      exposure: text,
      comparator: text,
      timeframe: text,
      overlapFamily: text.nullish(),
    }),
    result: z
      .object({
        outcome: text,
        measure: z.enum(['OR', 'aOR', 'HR', 'Cohens-d']),
        estimate: z.number().finite(),
        ciLower: z.number().finite().nullish(),
        ciUpper: z.number().finite().nullish(),
        confidenceLevel: z.number().gt(0).lt(100).nullish(),
      })
      .nullish(),
    limitations: z.array(text).min(1),
    reviewStatus: z.enum(['draft', 'reviewed']),
  })
  .superRefine((evidence, context) => {
    const result = evidence.result
    if (!result) return
    if (result.measure !== 'Cohens-d' && result.estimate <= 0)
      context.addIssue({
        code: 'custom',
        path: ['result', 'estimate'],
        message: 'Ratio estimates must be positive.',
      })
    if (result.ciLower != null && result.confidenceLevel == null)
      context.addIssue({
        code: 'custom',
        path: ['result', 'confidenceLevel'],
        message: 'Record the reported confidence level.',
      })
    if ((result.ciLower == null) !== (result.ciUpper == null)) {
      context.addIssue({
        code: 'custom',
        path: ['result'],
        message: 'Provide both confidence interval bounds, or neither.',
      })
    } else if (
      result.ciLower != null &&
      result.ciUpper != null &&
      (result.ciLower > result.estimate || result.ciUpper < result.estimate)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['result'],
        message:
          'The estimate must be within the reported confidence interval.',
      })
    }
  })

export const guideEvidenceSchema = z
  .object({
    schemaVersion: z.literal(1),
    slug: substance,
    revision: z.number().int().positive(),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    scopeNote: text,
    papers: z
      .array(
        z.object({
          key,
          doi: text
            .transform(normalizeDoi)
            .refine((value) => /^10\.\d{4,9}\/\S+$/.test(value), 'Invalid DOI'),
          title: text,
          authors: z.array(text).min(1),
          journal: text,
          year: z.number().int().min(1800),
          slug: key,
          cmsId: text.optional(),
          source: paperSourceSchema,
        }),
      )
      .min(1),
    evidence: z.array(researchEvidenceSchema).min(1),
  })
  .superRefine((bundle, context) => {
    for (const field of ['key', 'doi'] as const) {
      const seen = new Set<string>()
      bundle.papers.forEach((paper, index) => {
        if (seen.has(paper[field]))
          context.addIssue({
            code: 'custom',
            path: ['papers', index, field],
            message: `Duplicate paper ${field}`,
          })
        seen.add(paper[field])
      })
    }
    const keys = new Set<string>()
    bundle.evidence.forEach((evidence, index) => {
      const paper = bundle.papers.find((item) => item.key === evidence.paperKey)
      if (keys.has(evidence.key))
        context.addIssue({
          code: 'custom',
          path: ['evidence', index, 'key'],
          message: 'Duplicate evidence key',
        })
      keys.add(evidence.key)
      if (!paper)
        context.addIssue({
          code: 'custom',
          path: ['evidence', index, 'paperKey'],
          message: 'Unknown source paper',
        })
      if (paper && evidence.source.pdfPage > paper.source.pdfPageCount)
        context.addIssue({
          code: 'custom',
          path: ['evidence', index, 'source', 'pdfPage'],
          message: 'Source page is outside the PDF',
        })
    })
  })

export type ResearchEvidence = z.infer<typeof researchEvidenceSchema>
export type GuideEvidence = z.infer<typeof guideEvidenceSchema>
export type GuidePaper = GuideEvidence['papers'][number]
