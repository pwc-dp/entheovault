import { Fragment } from 'react'
import * as runtime from 'react/jsx-runtime'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import 'server-only'

export default async function PsychedelicsIntroduction(): Promise<JSX.Element> {
  const { compile, run } = await import('@mdx-js/mdx')
  // Only this fixed, reviewed repository file is executable MDX. Never compile
  // uploaded papers or CMS/user input through this entry point.
  const source = await readFile(
    path.join(process.cwd(), 'content/learn/psychedelics-introduction.mdx'),
    'utf8',
  )
  const compiled = await compile(source, { outputFormat: 'function-body' })
  const { default: Content } = await run(String(compiled), {
    ...runtime,
    Fragment,
  })

  return (
    <div className='space-y-5 text-base leading-8 text-secondary-foreground sm:text-lg'>
      <Content />
    </div>
  )
}
