import { cache } from 'react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { compileSubstanceGuide } from './compile'

import 'server-only'

export const getMdxSubstanceGuide = cache(async (slug: string) => {
  // Keep the filesystem allowlist explicit; route parameters never become file paths.
  if (!['mdma', '5-meo-dmt', 'lsd', 'psilocybin'].includes(slug)) return null
  const directory = path.join(process.cwd(), 'content', 'substances')
  const [source, evidence] = await Promise.all([
    readFile(path.join(directory, `${slug}.mdx`), 'utf8'),
    readFile(path.join(directory, `${slug}.evidence.json`), 'utf8'),
  ])
  return compileSubstanceGuide(source, JSON.parse(evidence))
})
