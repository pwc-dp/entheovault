import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { compileSubstanceGuide } from '../src/lib/substances/compile'
import { guideEvidenceSchema, normalizeDoi } from '../src/lib/substances/schema'
import { substanceSections } from '../src/lib/substances/sections'

const source = readFileSync('content/substances/mdma.mdx', 'utf8')
const input = JSON.parse(
  readFileSync('content/substances/mdma.evidence.json', 'utf8'),
)

test('baseline evidence keeps distinct study contexts, measures, and source versions', () => {
  const bundle = guideEvidenceSchema.parse(input)
  const result = bundle.evidence.find(
    (item) => item.key === 'huizink-2006-later-use',
  )
  assert.equal(result.result.measure, 'HR')
  assert.equal(result.result.estimate, 2.22)
  assert.equal(result.study.exposure, '兒童期焦慮／憂鬱症狀')
  assert.equal(
    bundle.evidence.find(
      (item) => item.key === 'patel-2015-insufficient-evidence',
    ).study.sampleSize,
    null,
  )
  const volunteerReview = bundle.evidence.find(
    (item) => item.key === 'patel-2015-volunteer-effects',
  )
  assert.equal(volunteerReview.study.design, 'literature-review')
  assert.equal(volunteerReview.study.sampleSize, null)
  assert.equal(volunteerReview.source.pdfPage, 5)
  const animalExperiments = bundle.evidence.filter(
    (item) => item.paperKey === 'pantoni-2022-dose-effects',
  )
  assert.equal(animalExperiments.length, 4)
  assert(
    animalExperiments.every(
      (item) => item.study.design === 'animal-dose-ranging',
    ),
  )
  assert(
    animalExperiments.every(
      (item) => item.study.context === 'preclinical-animal',
    ),
  )
  assert.equal(
    new Set(animalExperiments.map((item) => item.study.overlapFamily)).size,
    1,
  )
  assert.equal(
    animalExperiments.find((item) => item.key === 'pantoni-2022-fear-memory')
      .study.sampleSize,
    184,
  )
  assert.equal(
    animalExperiments.find((item) => item.key === 'pantoni-2022-forced-swim')
      .study.sampleSize,
    79,
  )
  assert.equal(
    bundle.papers.find((item) => item.key === 'pantoni-2022-dose-effects').doi,
    '10.1007/s00213-022-06086-9',
  )
})

test('canonical DOI identity rejects duplicate URL and bare-DOI forms', () => {
  assert.equal(
    normalizeDoi(' DOI: https://doi.org/10.1136/BMJ.38743.539398.3A '),
    '10.1136/bmj.38743.539398.3a',
  )
  const invalid = structuredClone(input)
  invalid.papers.push({
    ...invalid.papers[0],
    key: 'duplicate',
    doi: `https://doi.org/${invalid.papers[0].doi}`,
  })
  assert.throws(() => guideEvidenceSchema.parse(invalid), /Duplicate paper doi/)
})

test('invalid source pages, missing passages, and broken confidence intervals fail validation', () => {
  for (const mutate of [
    (value) => {
      value.evidence[0].source.pdfPage = 999
    },
    (value) => {
      value.evidence[0].source.quote = ''
    },
    (value) => {
      value.evidence.find((item) => item.result).result.ciLower = 8
    },
    (value) => {
      value.evidence.find((item) => item.result).result.confidenceLevel = null
    },
    (value) => {
      value.evidence[0].paperKey = 'missing-paper'
    },
  ]) {
    const invalid = structuredClone(input)
    mutate(invalid)
    assert.throws(() => guideEvidenceSchema.parse(invalid))
  }
})

test('citations follow first appearance and repeat the same paper number deterministically', async () => {
  const guide = await compileSubstanceGuide(source, input)
  assert.equal(guide.references.length, input.papers.length)
  assert.equal(guide.occurrences[0].evidenceKeys.length, 2)
  assert.equal(guide.references[0].paper.key, 'patel-titheradge-2015-review')
  assert.deepEqual(
    new Set(guide.references.map(({ paper }) => paper.key)),
    new Set(input.papers.map(({ key }) => key)),
  )
  assert.deepEqual(
    guide.references.map(({ number }) => number),
    Array.from({ length: guide.references.length }, (_, index) => index + 1),
  )
  assert.equal(
    new Set(guide.occurrences.map(({ id }) => id)).size,
    guide.occurrences.length,
  )
  for (const reference of guide.references) {
    assert(
      reference.occurrences.every(({ number }) => number === reference.number),
    )
  }
  const repeat = await compileSubstanceGuide(source, input)
  assert.deepEqual(guide.occurrences, repeat.occurrences)
})

test('unknown, unreviewed, wrong-substance and wrong-section citations are rejected', async () => {
  await assert.rejects(
    compileSubstanceGuide(
      source.replace('patel-2015-identity', 'unknown-evidence'),
      input,
    ),
    /Unknown evidence/,
  )
  await assert.rejects(
    compileSubstanceGuide(
      source.replace('patel-2015-identity', 'jones-nock-2022-lsd-ideation'),
      input,
    ),
    /does not apply/,
  )
  await assert.rejects(
    compileSubstanceGuide(
      source.replace('patel-2015-identity', 'huizink-2006-later-use'),
      input,
    ),
    /not assigned/,
  )
  const unreviewed = structuredClone(input)
  unreviewed.evidence.find(
    (item) => item.key === 'patel-2015-identity',
  ).reviewStatus = 'draft'
  await assert.rejects(
    compileSubstanceGuide(source, unreviewed),
    /Unreviewed evidence/,
  )
})

test('the agreed seven sections and reference list are required', async () => {
  assert.deepEqual(
    substanceSections.map(({ id }) => id),
    [
      'basics',
      'history',
      'benefits',
      'risks',
      'therapy',
      'related',
      'references',
    ],
  )
  await assert.rejects(
    compileSubstanceGuide(
      source
        .replace('id="history"', 'id="basics"')
        .replace('## 歷史', '## 基本認識'),
      input,
    ),
    /not assigned|agreed order/,
  )
  await assert.rejects(
    compileSubstanceGuide(source.replace('<References />', ''), input),
    /reference list exactly once/,
  )
})

test('editorial MDX disallows imports, expressions, and unsupported components', async () => {
  await assert.rejects(
    compileSubstanceGuide(`export const arbitrary = 1\n\n${source}`, input),
    /does not allow JavaScript/,
  )
  await assert.rejects(
    compileSubstanceGuide(
      source.replace('<RelatedPapers />', '{1 + 2}'),
      input,
    ),
    /does not allow JavaScript/,
  )
  await assert.rejects(
    compileSubstanceGuide(
      source.replace('<RelatedPapers />', '<script />'),
      input,
    ),
    /Unsupported guide component/,
  )
})

test('5-MeO-DMT guide compiles six sources and keeps combined treatment, case, and laboratory evidence distinct', async () => {
  const guideSource = readFileSync('content/substances/5-meo-dmt.mdx', 'utf8')
  const guideInput = JSON.parse(
    readFileSync('content/substances/5-meo-dmt.evidence.json', 'utf8'),
  )
  const guide = await compileSubstanceGuide(guideSource, guideInput)
  assert.equal(guide.bundle.slug, '5-meo-dmt')
  assert.equal(guide.references.length, 6)
  assert.deepEqual(
    guide.references.map(({ number }) => number),
    [1, 2, 3, 4, 5, 6],
  )
  const byKey = (key: string) =>
    guide.bundle.evidence.find((item) => item.key === key)
  assert.equal(
    byKey('sherwood-2020-characterization').study.context,
    'laboratory',
  )
  assert.equal(byKey('sherwood-2020-characterization').study.sampleSize, null)
  assert.equal(byKey('ragnhildstveit-2023-pcl5').study.design, 'case-report')
  assert.equal(byKey('ragnhildstveit-2023-pcl5').study.sampleSize, 1)
  assert.match(byKey('davis-2023-symptoms').study.exposure, /ibogaine/)
  assert.match(byKey('davis-2023-symptoms').study.comparator, /未設對照組/)
  assert.equal(byKey('davis-2023-symptoms').result, null)
  assert.equal(
    byKey('tap-2024-aud-mechanisms').study.design,
    'literature-review',
  )
  assert(
    guide.occurrences.every(({ evidenceKeys }) =>
      evidenceKeys.every((key) => byKey(key)),
    ),
  )
})
