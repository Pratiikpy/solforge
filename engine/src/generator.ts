import Anthropic from '@anthropic-ai/sdk';
import { GeneratedCode } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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

export async function generateCode(spec: string): Promise<GeneratedCode> {
  console.log('Generating code with Claude...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a complete, compilable Anchor program for this specification:\n\n${spec}\n\nRespond ONLY with valid JSON, no markdown formatting.`
      }
    ]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let jsonText = content.text.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
  }

  const parsed = JSON.parse(jsonText);

  if (!parsed.programName || !parsed.programCode || !parsed.testCode) {
    throw new Error('Invalid response structure from Claude');
  }

  return {
    programName: parsed.programName,
    programCode: parsed.programCode,
    testCode: parsed.testCode
  };
}

export async function generateSDKCode(
  programName: string,
  programId: string,
  programCode: string
): Promise<string> {
  console.log('Generating TypeScript SDK...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `Given this Anchor program code:\n\n${programCode}\n\nProgram ID: ${programId}\n\nGenerate a clean, typed TypeScript SDK for interacting with this program. Include:
- Program initialization
- Type-safe instruction builders
- Account fetching helpers
- Proper imports from @coral-xyz/anchor and @solana/web3.js

Respond with ONLY the TypeScript SDK code, no explanations.`
      }
    ]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text.trim();
}
