import { GeneratedCode } from './types';

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2-instruct';

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error('NVIDIA_API_KEY not set in environment');
  return key;
}

const SYSTEM_PROMPT = `You are an expert Solana Anchor program developer. Generate MINIMAL, COMPILABLE Anchor programs.

Requirements:
- Use anchor-lang 0.30.1
- Include all necessary imports and use statements
- Define proper account structs with constraints
- Implement clean, simple instruction handlers
- No unnecessary complexity
- Must compile on first try

Always respond with a JSON object:
{
  "programName": "snake_case_name",
  "programCode": "complete lib.rs content",
  "testCode": "complete TypeScript test file"
}`;

async function callKimi(messages: { role: string; content: string }[], maxTokens = 16384): Promise<string> {
  const res = await fetch(NVIDIA_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.95,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('No content in NVIDIA API response');
  }
  return choice.message.content;
}

export async function generateCode(spec: string): Promise<GeneratedCode> {
  console.log('Generating code with Kimi 2.5...');

  const text = await callKimi([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Generate a complete, compilable Anchor program for this specification:\n\n${spec}\n\nRespond ONLY with valid JSON, no markdown formatting.`
    }
  ], 8000);

  let jsonText = text.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
  }

  const parsed = JSON.parse(jsonText);

  if (!parsed.programName || !parsed.programCode || !parsed.testCode) {
    throw new Error('Invalid response structure from Kimi');
  }

  return {
    programName: parsed.programName,
    programCode: parsed.programCode,
    testCode: parsed.testCode,
  };
}

export async function generateSDKCode(
  programName: string,
  programId: string,
  programCode: string
): Promise<string> {
  console.log('Generating TypeScript SDK with Kimi 2.5...');

  const text = await callKimi([
    {
      role: 'user',
      content: `Given this Anchor program code:\n\n${programCode}\n\nProgram ID: ${programId}\n\nGenerate a clean, typed TypeScript SDK for interacting with this program. Include:
- Program initialization
- Type-safe instruction builders
- Account fetching helpers
- Proper imports from @coral-xyz/anchor and @solana/web3.js

Respond with ONLY the TypeScript SDK code, no explanations.`
    }
  ], 4000);

  return text.trim();
}
