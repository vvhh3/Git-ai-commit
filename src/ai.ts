import dotenv from 'dotenv'
import Anthropic from "@anthropic-ai/sdk"

dotenv.config()

const client = new Anthropic({
  baseURL: "https://api.openmodel.ai",
  apiKey: process.env.OPENMODEL_API_KEY,
})

const SYSTEM_PROMPT = `Ты помощник, который пишет commit-сообщения по git diff.
Правила:
- Одна строка, не длиннее 200 символов
- Пиши на русском
- Без точки в конце
- В ответе ТОЛЬКО само сообщение, без кавычек, без markdown, без пояснений`


export async function generateCommitMessage(diff: string): Promise<string> {
  const apiKey = process.env.OPENMODEL_API_KEY;

  if (!apiKey) {
    throw new Error('Не найден OPENMODEL_API_KEY. Добавь его в .env (см. .env.example)')
  }

  const truncatedDiff = diff.length > 12000 ? diff.slice(0, 12000) + '\n...(diff обрезан)' : diff;

  const response = await client.messages.create({
    model: "deepseek-v4-flash",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: truncatedDiff },
    ],
    temperature: 0.4,
  })

  const textBlock = response.content.find((block) => block.type === "text")

  if (!textBlock) {
    throw new Error("AI вернул пустой ответ");
  }

  return textBlock.text.trim()
}