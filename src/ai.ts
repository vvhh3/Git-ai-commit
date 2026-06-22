const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Модель берётся из .env, дефолт — на случай если забыл указать
const MODEL = process.env.OPENROUTER_MODEL || 'deepseek-v4-flash';

const SYSTEM_PROMPT = `Ты помощник, который пишет commit-сообщения по git diff.
Правила:
- Одна строка, не длиннее 72 символов
- Пиши на русском, если код/комментарии на русском, иначе на английском
- Без точки в конце
- В ответе ТОЛЬКО само сообщение, без кавычек, без markdown, без пояснений`;

interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

export async function generateCommitMessage(diff: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Не найден OPENROUTER_API_KEY. Добавь его в .env (см. .env.example).'
    );
  }

  const truncatedDiff = diff.length > 12000 ? diff.slice(0, 12000) + '\n...(diff обрезан)' : diff;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: truncatedDiff },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка OpenRouter API (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const message = data.choices?.[0]?.message?.content?.trim();

  if (!message) {
    throw new Error('AI вернул пустой ответ.');
  }

  return message
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/```$/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}