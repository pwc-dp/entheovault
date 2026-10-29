import { ValidationError } from 'payload/errors'
import type {
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload/types'

import { PAYLOAD_SUBSTANCE_OPTIONS } from '../config/options'
import {
  paperSourceSchema,
  researchEvidenceSchema,
} from '../lib/substances/schema'
import {
  studyDesignLabels,
  substanceSections,
} from '../lib/substances/sections'

const validateEvidence: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const candidate = {
    ...originalDoc,
    ...data,
    source: { ...originalDoc?.source, ...data?.source },
    study: { ...originalDoc?.study, ...data?.study },
    limitations: (data?.limitations ?? originalDoc?.limitations ?? []).map(
      (item: { text: string }) => item.text,
    ),
  }
  if (
    candidate.result &&
    Object.values(candidate.result).every(
      (value) => value == null || value === '',
    )
  )
    candidate.result = null
  const result = researchEvidenceSchema.safeParse(candidate)
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }
  const source = paperSourceSchema.safeParse({
    ...originalDoc?.paperSource,
    ...data?.paperSource,
  })
  if (!source.success || candidate.source.pdfPage > source.data.pdfPageCount) {
    throw new ValidationError([
      {
        field: 'paperSource',
        message: 'Provide a valid PDF version and an existing source page.',
      },
    ])
  }
  return data
}

const ResearchEvidence: CollectionConfig = {
  slug: 'research-evidence',
  labels: { singular: '研究證據', plural: '研究證據' },
  admin: {
    useAsTitle: 'statement',
    defaultColumns: ['key', 'paper', 'kind', 'reviewStatus'],
    description:
      '每項研究發現與原文位置。介紹頁發布時使用與 MDX 一起版控的證據快照。',
  },
  versions: { maxPerDoc: 25 },
  access: {
    read: ({ req }) =>
      req.user ? true : { reviewStatus: { equals: 'reviewed' } },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: { beforeValidate: [validateEvidence] },
  fields: [
    {
      name: 'key',
      label: '證據固定識別碼',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'paper',
      label: '來源文獻',
      type: 'relationship',
      relationTo: 'papers',
      required: true,
      index: true,
    },
    {
      name: 'paperKey',
      label: '文獻引用鍵',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'statement',
      label: '研究發現或背景敘述',
      type: 'textarea',
      required: true,
    },
    {
      name: 'kind',
      label: '證據類型',
      type: 'select',
      required: true,
      options: [
        { value: 'background', label: '背景' },
        { value: 'result', label: '結果' },
        { value: 'limitation', label: '限制' },
      ],
    },
    {
      name: 'substances',
      label: '適用物質',
      type: 'select',
      hasMany: true,
      required: true,
      options: PAYLOAD_SUBSTANCE_OPTIONS,
    },
    {
      name: 'sections',
      label: '影響章節',
      type: 'select',
      hasMany: true,
      required: true,
      options: substanceSections.map(({ id, title }) => ({
        value: id,
        label: title,
      })),
    },
    {
      name: 'source',
      label: '原文定位',
      type: 'group',
      fields: [
        {
          name: 'pdfPage',
          label: 'PDF 實體頁碼（含封面，從 1 起算）',
          type: 'number',
          min: 1,
          required: true,
        },
        { name: 'section', label: '原文章節', type: 'text', required: true },
        {
          name: 'quote',
          label: '支持此敘述的原文',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'paperSource',
      label: '來源 PDF 版本',
      type: 'group',
      fields: [
        { name: 'filename', type: 'text', required: true },
        { name: 'sha256', type: 'text', required: true },
        { name: 'pdfPageCount', type: 'number', min: 1, required: true },
      ],
    },
    {
      name: 'study',
      label: '研究條件',
      type: 'group',
      fields: [
        {
          name: 'design',
          label: '研究設計',
          type: 'select',
          required: true,
          options: Object.entries(studyDesignLabels).map(([value, label]) => ({
            value,
            label,
          })),
        },
        {
          name: 'context',
          label: '研究情境',
          type: 'select',
          required: true,
          options: [
            { value: 'naturalistic-use', label: '自然使用情境' },
            { value: 'clinical-treatment', label: '臨床治療' },
            { value: 'review', label: '文獻綜述' },
            { value: 'preclinical-animal', label: '臨床前動物實驗' },
            { value: 'laboratory', label: '實驗室研究' },
          ],
        },
        {
          name: 'population',
          label: '研究對象',
          type: 'textarea',
          required: true,
        },
        {
          name: 'sampleSize',
          label: '總樣本數（未報告或不適用時留白）',
          type: 'number',
          min: 1,
        },
        {
          name: 'exposure',
          label: '暴露或介入',
          type: 'textarea',
          required: true,
        },
        {
          name: 'comparator',
          label: '比較組',
          type: 'textarea',
          required: true,
        },
        { name: 'timeframe', label: '時間範圍', type: 'text', required: true },
        { name: 'overlapFamily', label: '可能重疊的資料來源', type: 'text' },
      ],
    },
    {
      name: 'result',
      label: '量化結果（如有）',
      type: 'group',
      fields: [
        { name: 'outcome', label: '結果指標', type: 'text' },
        {
          name: 'measure',
          label: '統計量',
          type: 'select',
          options: ['OR', 'aOR', 'HR', 'Cohens-d'],
        },
        { name: 'estimate', label: '估計值', type: 'number' },
        { name: 'ciLower', label: '信賴區間下界', type: 'number' },
        { name: 'ciUpper', label: '信賴區間上界', type: 'number' },
        {
          name: 'confidenceLevel',
          label: '信賴水準（百分比）',
          type: 'number',
          min: 0,
          max: 100,
        },
      ],
    },
    {
      name: 'limitations',
      label: '研究限制',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'text', label: '限制', type: 'textarea', required: true },
      ],
    },
    {
      name: 'reviewStatus',
      label: '審閱狀態',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { value: 'draft', label: '待審閱' },
        { value: 'reviewed', label: '已核對原文' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}

export default ResearchEvidence
