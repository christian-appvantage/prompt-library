import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.CLAUDE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    claudeKey: {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 15) || 'none',
      valueType: typeof apiKey,
      isEmptyString: apiKey === '',
      isUndefined: apiKey === undefined,
    },
    anthropicKey: {
      hasKey: !!anthropicKey,
      keyLength: anthropicKey?.length || 0,
      valueType: typeof anthropicKey,
      isEmptyString: anthropicKey === '',
    },
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('CLAUDE') || k.includes('API')),
    nodeEnv: process.env.NODE_ENV
  });
}
