# Project instructions

## Substance guides

These editorial rules apply to substance guides under `/learn/<slug>` and the MDX content used by those pages.

- 凡是生成、擴寫、改寫或審查物質介紹頁面，開始前必須讀取 [物質介紹編輯規範與 MDX 維護](docs/substances/authoring.md)；完成後必須按照其中的「完稿檢查表」審查實際成稿並修正問題。
- Maintain the introduction text in MDX, using connected, descriptive prose.
- 正文優先呈現研究問題、關鍵設計與具體結果；必要限定及內容取捨依上述編輯規範。
- Use the following sections in this order:
  1. 基本認識
  2. 歷史
  3. 潛在益處
  4. 風險與副作用
  5. 治療研究
  6. 延伸閱讀
  7. 參考文獻
- Attach inline citations to research claims. Each citation must be traceable to the source paper and the passage or result supporting the claim.
- When adding research, review the affected passages and account for supportive, null, and conflicting findings. Describe study context accurately and distinguish associations from causal or treatment effects. Keep full limitations in evidence notes; include only qualifiers whose omission would directly distort a result in the prose.
- Preserve editorial changes when proposing updates. Keep detailed data models, update workflows, and implementation plans in `docs/`.
- Reuse the project's existing shadcn components and theme tokens for the pages.
