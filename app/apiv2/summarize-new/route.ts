import { google } from '@ai-sdk/google'
import { convertToModelMessages, smoothStream, streamText } from 'ai'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (process.env.NODE_ENV === 'production' && origin !== process.env.APP_URL) {
    return NextResponse.json(
      {
        success: false,
        message: 'CORS policy: No access allowed from this origin',
      },
      { status: 403 },
    )
  }

  const { prompt }: { prompt: string } = await request.json()

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ success: false, message: 'No prompt provided' })
  }

  try {
    const system = `You are an expert in summarizing structured data from research papers. You will be provided with structured text data from research papers related to the user's query. Your task is to:

      1. Use the information from the provided research papers to explain the user's query
      
      2. CRITICAL CITATION REQUIREMENTS - You MUST follow these rules exactly:
         - NEVER use comma-separated citations like [4], [6] or [1, 2, 3]
         - ALWAYS use individual markdown links for each citation
         - Format: [citation_number](paper_url) - where paper_url is the actual URL from the paper data
         - Place citations immediately after the relevant statement
         - Each citation must be a clickable markdown link with the paper's URL
         - If multiple papers support the same point, create separate sentences or use separate citation links

      3. CORRECT citation examples in Traditional Chinese:
         "5-MeO-DMT 與憂鬱症改善相關 [4](https://example.com/paper4)，同時也與焦慮症治療有關 [6](https://example.com/paper6)。"
         "裸蓋菇鹼 (Psilocybin) 在臨床試驗中顯示療效 [1](https://example.com/paper1)，並且對創傷後壓力症候群有潛在益處 [3](https://example.com/paper3)。"

      4. INCORRECT citation examples (DO NOT DO THIS):
         "5-MeO-DMT：與憂鬱症、焦慮症的改善相關 [4], [6]" ❌ (comma-separated without URLs)
         "研究顯示療效 [1, 2, 3]" ❌ (grouped citations)
         "有效治療方法 [1]" ❌ (citation without URL)

      5. Reply with Traditional Chinese (TW), and use these specific terms:
         - "Psychedelics" → "啟靈藥"
         - "Psilocybin" → "裸蓋菇鹼"
         - "Ibogaine" → "伊波加因"
         - "Ketamine" → "K他命"
         - "Empathy" → "同理心"
         - "Schizophrenia" → "思覺失調症"
         
      6. For each special term, provide both Traditional Chinese (TW) and the English term in brackets, e.g., "裸蓋菇鹼 (Psilocybin)".

      REMEMBER: Every citation MUST be a clickable markdown link with format [number](url). Never use bare numbers in brackets or comma-separated citations.`

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system,
      prompt: prompt,
      experimental_transform: smoothStream({
        delayInMs: 10,
        chunking: 'word',
      }),
    })

    return result.toUIMessageStreamResponse()
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error performing summarize', error)
    return NextResponse.json({
      success: false,
      message: 'Error performing summarize',
    })
  }
}
