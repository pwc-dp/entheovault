export const substanceGuides = [
  {
    slug: 'lsd',
    name: 'LSD',
    chineseName: '麥角酸二乙醯胺',
    fullName: 'Lysergic acid diethylamide',
    category: '經典啟靈物質',
    description:
      '認識 LSD（麥角酸二乙醯胺）的基本作用與研究歷史，了解主觀經驗、腦部活動、潛在治療用途及風險與副作用。',
    basics: [
      'LSD 是一種以麥角相關化合物為基礎合成的物質，通常被歸入經典啟靈物質。它會改變感官經驗與時間知覺。',
      '理解 LSD 時，需要同時考慮物質本身、個人的心理狀態，以及經驗發生的環境。',
    ],
    history:
      'Albert Hofmann 在 1938 年首次合成 LSD，並於 1943 年辨識其精神活性。此後，它成為精神醫學與意識研究的重要對象。',
    research:
      '相關研究涵蓋腦部活動、主觀經驗，以及心理治療情境。閱讀文獻時，應區分健康受試者研究、臨床試驗與自然情境的觀察。',
    risks:
      'LSD 可能使心率、血壓與體溫上升。研究中的受試者篩選與支持條件，也會影響如何解讀安全性結果。',
    source: 'https://psychedelics.berkeley.edu/substance/lsd/',
  },
  {
    slug: 'mdma',
    name: 'MDMA',
    chineseName: '亞甲二氧基甲基安非他命',
    fullName: '3,4-Methylenedioxymethamphetamine',
    category: '促進情感連結的精神活性物質',
    description:
      '認識 MDMA 的作用與研究歷史，了解 MDMA 輔助心理治療對創傷後壓力症的臨床研究，以及情緒、記憶與使用風險的研究結果。',
    basics: [
      'MDMA 是一種合成的精神活性物質，會影響血清素、正腎上腺素與多巴胺等神經傳導系統。',
      '它常被描述為促進同理與情感連結的物質，其作用特徵與 LSD、psilocybin 等經典啟靈物質有所不同。',
    ],
    history:
      'MDMA 於 1912 年由 Merck 首次合成。1970 年代，它逐漸進入部分心理治療工作者的實務與討論，之後也成為臨床研究的對象。',
    research:
      'MDMA 輔助心理治療是重要的研究方向。閱讀結果時，應一起檢視藥物、心理治療、受試者條件與研究設計，而不能只看單一效果數字。',
    risks:
      'MDMA 會活化交感神經系統，可能使心率與血壓暫時上升。臨床研究的結果需要放回其監測與支持條件下理解。',
    source: 'https://psychedelics.berkeley.edu/substance/mdma/',
  },
  {
    slug: 'psilocybin',
    name: 'Psilocybin',
    chineseName: '裸蓋菇素',
    fullName: 'Psilocybin',
    category: '經典啟靈物質',
    description:
      '認識 Psilocybin（裸蓋菇素）的作用與研究歷史，了解憂鬱症、癌症相關心理困擾及酒精使用障礙的研究結果，以及風險與副作用。',
    basics: [
      'Psilocybin 是存在於多種真菌中的天然化合物，通常被歸入經典啟靈物質。它可能改變感官與時間知覺。',
      '討論時應區分 psilocybin 這個化合物、含有它的真菌，以及研究使用的製劑與支持條件。',
    ],
    history:
      '含有 psilocybin 的真菌，在墨西哥與中美洲原住民族的文化中具有長久歷史。1950 與 1960 年代，研究者開始探索其心理與治療相關作用。',
    research:
      '當代文獻包含主觀經驗、腦部活動，以及心理治療情境的研究。不同研究的參與者、比較組與追蹤時間，會影響結果能回答的問題。',
    risks:
      'Psilocybin 可能引起噁心、頭痛，以及心率或血壓上升。對其潛在用途的討論，也需要同時檢視不良反應與研究限制。',
    source: 'https://psychedelics.berkeley.edu/substance/psilocybin/',
  },
  {
    slug: '5-meo-dmt',
    name: '5-MeO-DMT',
    chineseName: '5-甲氧基-N,N-二甲基色胺',
    fullName: '5-Methoxy-N,N-dimethyltryptamine',
    category: '血清素性啟靈物質',
    description:
      '認識 5-MeO-DMT 的基本作用與研究歷史，了解主觀經驗、情緒變化與潛在治療用途的研究，以及風險與副作用。',
  },
] as const

export type SubstanceSlug = (typeof substanceGuides)[number]['slug']

export const getSubstanceGuide = (slug: string) =>
  substanceGuides.find((substance) => substance.slug === slug)
