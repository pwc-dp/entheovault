import dotenv from 'dotenv'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import payload from 'payload'
import type { InitOptions } from 'payload/config'

import { guideEvidenceSchema, normalizeDoi } from '../src/lib/substances/schema'

async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
  process.env.PAYLOAD_DROP_DATABASE = 'false'
  process.env.PAYLOAD_PUBLIC_SEED = 'false'
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(
    process.cwd(),
    'src/payload.config.ts',
  )
  if (!process.env.PAYLOAD_SECRET) throw new Error('PAYLOAD_SECRET is missing.')

  const slugIndex = process.argv.indexOf('--slug')
  const slug = slugIndex === -1 ? 'mdma' : process.argv[slugIndex + 1]
  if (!['mdma', 'lsd', 'psilocybin', '5-meo-dmt'].includes(slug))
    throw new Error('Provide a supported substance with --slug.')
  const bundle = guideEvidenceSchema.parse(
    JSON.parse(
      await readFile(`content/substances/${slug}.evidence.json`, 'utf8'),
    ),
  )
  if (bundle.slug !== slug) throw new Error('Guide substance does not match.')
  const apply = process.argv.includes('--apply')
  // This local import never needs an external mail service.
  const disabledMailTransport = {
    verify: async () => true,
    sendMail: async () => {
      throw new Error('Email is disabled during evidence import.')
    },
  }
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    local: true,
    disableOnInit: true,
    email: {
      fromName: 'Evidence import',
      fromAddress: 'no-reply@example.invalid',
      transport: disabledMailTransport as Extract<
        InitOptions['email'],
        { transport: unknown }
      >['transport'],
    },
  })

  try {
    const papers = await payload.find({
      collection: 'papers',
      pagination: false,
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    const relations = new Map<string, string>()
    // Resolve all source relations before creating any evidence; reject ambiguous matches.
    for (const paper of bundle.papers) {
      const matches = papers.docs.filter(
        (item) =>
          item.doi &&
          normalizeDoi(item.doi) === paper.doi &&
          (!paper.cmsId || item.id === paper.cmsId),
      )
      if (matches.length !== 1)
        throw new Error(
          `Expected one existing paper for ${paper.doi}; found ${matches.length}.`,
        )
      if (matches[0].slug !== paper.slug)
        throw new Error(
          `Paper slug changed for ${paper.doi}; review the published reference link first.`,
        )
      relations.set(paper.key, matches[0].id)
    }
    const existing = await payload.find({
      collection: 'research-evidence',
      pagination: false,
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    const existingKeys = new Set(existing.docs.map((item) => item.key))
    const additions = bundle.evidence.filter(
      (item) => !existingKeys.has(item.key),
    )
    process.stdout.write(
      JSON.stringify({
        mode: apply ? 'apply' : 'dry-run',
        matchedPapers: relations.size,
        create: additions.length,
        preserveExisting: bundle.evidence.length - additions.length,
      }) + '\n',
    )

    if (!apply) return
    for (const evidence of additions) {
      await payload.create({
        collection: 'research-evidence',
        overrideAccess: true,
        data: {
          ...evidence,
          result: evidence.result ?? undefined,
          paper: relations.get(evidence.paperKey),
          paperSource: bundle.papers.find(
            (paper) => paper.key === evidence.paperKey,
          ).source,
          limitations: evidence.limitations.map((text) => ({ text })),
        },
      })
    }
    process.stdout.write(
      `Imported ${additions.length} evidence records; existing records were preserved.\n`,
    )
  } finally {
    await payload.db.destroy?.(payload)
  }
}

main().catch((error: Error) => {
  // Avoid printing a database URI or other configuration values on connection errors.
  process.stderr.write(
    `${error.name}: ${error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, '[redacted database URI]')}\n`,
  )
  process.exitCode = 1
})
