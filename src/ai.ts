import dotenv from 'dotenv'
import Anthropic from "@anthropic-ai/sdk"

dotenv.config()

const client = new Anthropic({
  baseURL: "https://api.openmodel.ai",
  apiKey: process.env.OPENROUTER_API_KEY,
})



const SYSTEM_PROMPT = `Ты помощник, который пишет commit-сообщения по git diff.
Правила:
- Одна строка, не длиннее 72 символов
- Пиши на русском
- Без точки в конце
- В ответе ТОЛЬКО само сообщение, без кавычек, без markdown, без пояснений`;


export async function generateCommitMessage(diff: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Не найден OPENROUTER_API_KEY. Добавь его в .env (см. .env.example).'
    );
  }

  const truncatedDiff = diff.length > 12000 ? diff.slice(0, 12000) + '\n...(diff обрезан)' : diff;

  const response = await client.messages.create({
    model: "deepseek-v4-flash",
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: truncatedDiff },
    ],
    temperature: 0.3,
  })

  // const response = await fetch(OPENROUTER_URL, {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${apiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: MODEL,
  //     messages: [
  //       { role: 'system', content: SYSTEM_PROMPT },
  //       { role: 'user', content: truncatedDiff },
  //     ],
  //     temperature: 0.3,
  //   }),
  // });

  // if (!response.ok) {
  //   const errorText = await response.text();
  //   throw new Error(`Ошибка OpenRouter API (${response.status}): ${errorText}`);
  // }

  // const data = (await response.json()) as OpenRouterResponse;
  // const message = data.choices?.[0]?.message?.content?.trim();

  //   if (!message) {
  //     throw new Error('AI вернул пустой ответ.');
  //   }

  const textBlock = response.content.find(
    (block) => block.type === "text"
  );

  if (!textBlock) {
    throw new Error("AI вернул пустой ответ");
  }

  return textBlock.text.trim()

  // return message
  //   .replace(/^```[a-z]*\n?/i, '')
  //   .replace(/```$/i, '')
  //   .replace(/^["']|["']$/g, '')
  //   .trim();
}