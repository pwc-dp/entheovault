import { Fragment } from 'react'
import * as runtime from 'react/jsx-runtime'

import type { GuidePaper, ResearchEvidence } from './schema'
import { guideEvidenceSchema } from './schema'
import { substanceSections } from './sections'

interface Attribute {
  type: string
  name?: string
  value?: string
}
interface Node {
  type: string
  name?: string
  attributes?: Attribute[]
  children?: Node[]
  depth?: number
  value?: string
}

export interface CitationOccurrence {
  id: string
  evidenceKeys: string[]
  number: number
}
export interface GuideReference {
  number: number
  paper: GuidePaper
  evidence: ResearchEvidence[]
  occurrences: CitationOccurrence[]
}

const literal = (node: Node, name: string): string | undefined => {
  const attribute = node.attributes?.find((item) => item.name === name)
  return typeof attribute?.value === 'string' ? attribute.value : undefined
}

/** Only compile checked-in editorial MDX, never uploaded PDFs or arbitrary CMS input. */
export async function compileSubstanceGuide(source: string, input: unknown) {
  const { compile, run } = await import('@mdx-js/mdx')
  const bundle = guideEvidenceSchema.parse(input)
  const references: GuideReference[] = []
  const occurrences: CitationOccurrence[] = []
  const sectionIds: string[] = []
  let referenceLists = 0

  function remarkGuide() {
    return (tree: Node): void => {
      const visit = (node: Node, parentSection?: string): void => {
        if (
          ['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression'].includes(
            node.type,
          )
        ) {
          throw new Error(
            'Guide MDX does not allow JavaScript expressions or imports.',
          )
        }
        let currentSection = parentSection
        if (
          node.type === 'mdxJsxFlowElement' ||
          node.type === 'mdxJsxTextElement'
        ) {
          if (
            !['GuideSection', 'Cite', 'RelatedPapers', 'References'].includes(
              node.name,
            )
          ) {
            throw new Error(`Unsupported guide component: ${node.name}`)
          }
          if (
            node.attributes?.some(
              (attribute) =>
                attribute.type !== 'mdxJsxAttribute' ||
                typeof attribute.value !== 'string',
            )
          ) {
            throw new Error(
              'Guide component attributes must be literal strings.',
            )
          }
          if (node.name === 'GuideSection') {
            currentSection = literal(node, 'id')
            if (
              parentSection ||
              !substanceSections.some(({ id }) => id === currentSection)
            )
              throw new Error('Unknown or nested guide section.')
            sectionIds.push(currentSection)
            const heading = node.children?.find(
              (child) => child.type === 'heading',
            )
            const title = heading?.children
              ?.map((child) => child.value || '')
              .join('')
            if (
              heading?.depth !== 2 ||
              title !==
                substanceSections.find(({ id }) => id === currentSection)?.title
            ) {
              throw new Error(
                `Section ${currentSection} must start with its matching level-two heading.`,
              )
            }
          } else if (node.name === 'Cite') {
            const evidenceKeys = Array.from(
              new Set((literal(node, 'evidence') || '').trim().split(/\s+/)),
            )
            const sources = evidenceKeys.map((evidenceKey) => {
              const evidence = bundle.evidence.find(
                (item) => item.key === evidenceKey,
              )
              if (!evidence)
                throw new Error(`Unknown evidence citation: ${evidenceKey}`)
              if (evidence.reviewStatus !== 'reviewed')
                throw new Error(`Unreviewed evidence: ${evidenceKey}`)
              if (!evidence.substances.includes(bundle.slug))
                throw new Error(
                  `Evidence ${evidenceKey} does not apply to ${bundle.slug}.`,
                )
              if (
                !evidence.sections.some((section) => section === currentSection)
              )
                throw new Error(
                  `Evidence ${evidenceKey} is not assigned to section ${currentSection}.`,
                )
              return evidence
            })
            const evidence = sources[0]
            if (sources.some((item) => item.paperKey !== evidence.paperKey))
              throw new Error(
                'Group evidence from the same paper in one Cite; use separate Cite markers for different papers.',
              )
            let reference = references.find(
              (item) => item.paper.key === evidence.paperKey,
            )
            if (!reference) {
              reference = {
                number: references.length + 1,
                paper: bundle.papers.find(
                  (paper) => paper.key === evidence.paperKey,
                ),
                evidence: [],
                occurrences: [],
              }
              references.push(reference)
            }
            for (const citedEvidence of sources) {
              if (
                !reference.evidence.some(
                  (item) => item.key === citedEvidence.key,
                )
              )
                reference.evidence.push(citedEvidence)
            }
            const occurrence = {
              id: `cite-${occurrences.length + 1}`,
              evidenceKeys,
              number: reference.number,
            }
            occurrences.push(occurrence)
            reference.occurrences.push(occurrence)
            // Resolve occurrence IDs at compile time so repeated React renders stay deterministic.
            node.attributes = [
              {
                type: 'mdxJsxAttribute',
                name: 'occurrence',
                value: occurrence.id,
              },
            ]
          } else if (
            node.name === 'RelatedPapers' &&
            currentSection !== 'related'
          ) {
            throw new Error('RelatedPapers must be inside the related section.')
          } else if (
            node.name === 'References' &&
            currentSection !== 'references'
          ) {
            throw new Error('References must be inside the references section.')
          }
          if (node.name === 'References') referenceLists++
        }
        if (node.type === 'heading' && node.depth < 2)
          throw new Error('The page owns the level-one heading.')
        node.children?.forEach((child) => visit(child, currentSection))
      }
      visit(tree)
      if (
        sectionIds.join(',') !== substanceSections.map(({ id }) => id).join(',')
      ) {
        throw new Error(
          'Guide sections must appear exactly once in the agreed order.',
        )
      }
      if (referenceLists !== 1)
        throw new Error('A guide must render its reference list exactly once.')
    }
  }

  const compiled = await compile(source, {
    outputFormat: 'function-body',
    development: false,
    remarkPlugins: [remarkGuide],
  })
  const { default: Content } = await run(compiled, { ...runtime, Fragment })
  return { Content, bundle, references, occurrences }
}

export type CompiledSubstanceGuide = Awaited<
  ReturnType<typeof compileSubstanceGuide>
>
