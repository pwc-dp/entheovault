export const substanceSections = [
  { id: 'basics', title: '基本認識' },
  { id: 'history', title: '歷史' },
  { id: 'benefits', title: '潛在益處' },
  { id: 'risks', title: '風險與副作用' },
  { id: 'therapy', title: '治療研究' },
  { id: 'related', title: '延伸閱讀' },
  { id: 'references', title: '參考文獻' },
] as const

export type SubstanceSection = (typeof substanceSections)[number]['id']

export const studyDesignLabels = {
  'cross-sectional-survey': '橫斷面問卷研究',
  'observational-group-comparison': '觀察性組間比較',
  'prospective-population-cohort': '前瞻性族群研究',
  'literature-review': '文獻綜述',
  'systematic-review-meta-analysis': '系統性綜述與統合分析',
  'pooled-trial-analysis': '多試驗合併分析',
  'randomized-controlled-trial': '隨機對照試驗',
  'controlled-crossover-study': '安慰劑對照交叉研究',
  'prospective-observational': '前瞻性觀察研究',
  'case-report': '個案報告',
  'open-label-program': '無對照開放式臨床方案',
  'analytical-chemistry': '分析化學研究',
  'animal-dose-ranging': '動物劑量反應實驗',
  'animal-experiment': '動物實驗',
  'mechanistic-experiment': '細胞與動物機制實驗',
  'qualitative-interview': '質性訪談研究',
  'secondary-trial-analysis': '隨機試驗次級分析',
  'clinical-support-model': '臨床心理支持模型說明',
} as const
