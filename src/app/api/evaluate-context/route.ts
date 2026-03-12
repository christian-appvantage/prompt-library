import Anthropic from '@anthropic-ai/sdk';
import { getBlocksForLLMContext } from '@/lib/blocks';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert prompt engineer for the TCWEI Prompt Library. Your job is to evaluate whether a user's initial description contains enough context to generate a high-quality, ready-to-use prompt.

## THE TCWEI FRAMEWORK
The library contains modular prompt building blocks organized into 7 categories:
1. **Writer** (W-xx): Defines the AI's persona/role
2. **Task** (T-xx): Specifies what the AI should do
3. **Context** (C-xx): Provides background, constraints, audience info
4. **Examples** (E-xx): Good/bad reference patterns
5. **Instructions** (I-xx): Output format and style requirements
6. **Best Practices** (BP-xx): Quality guardrails and methods
7. **Coding** (CD-xx): Developer-specific tasks

## AVAILABLE BUILDING BLOCKS
${getBlocksForLLMContext()}

## EVALUATION CRITERIA
A request has SUFFICIENT context when it clearly conveys:
1. The core task or goal (what the AI should do)
2. Enough specifics to fill in most placeholders meaningfully (audience, tone, format, constraints)

A request has INSUFFICIENT context when it is vague, overly broad, or missing critical information that would force heavy placeholder usage.

IMPORTANT: Err on the side of asking questions. It is better to gather context and produce an excellent prompt than to rush and produce a mediocre one. Only mark as sufficient when the user has provided genuinely detailed, specific instructions.

## WHEN CONTEXT IS INSUFFICIENT
Generate 3-5 clarifying questions. Each question should:
- Target a specific gap in the user's description
- Map to one of the TCWEI categories (writer, task, context, examples, instructions, bestPractices, coding)
- Include a helpful hint showing an example answer
- Include 2-4 short predefined answer options that cover the most common responses. Keep options concise (1-4 words each).
- Be ordered from most critical to least critical
- NOT ask about information the user already provided

## OUTPUT FORMAT
Respond with ONLY valid JSON (no other text):
{
  "sufficient": true/false,
  "reasoning": "Brief explanation of your assessment",
  "questions": [
    {
      "id": 1,
      "text": "The clarifying question",
      "hint": "Example answer or guidance to help the user",
      "category": "context",
      "options": ["Option A", "Option B", "Option C"]
    }
  ]
}

CRITICAL: The "questions" array must ONLY be present when "sufficient" is false. When "sufficient" is true, omit the "questions" field entirely.`;

export async function POST(request: NextRequest) {
  try {
    const { userIntent, images, documents } = await request.json();

    if (!userIntent || typeof userIntent !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a description of what you want to accomplish' },
        { status: 400 }
      );
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set CLAUDE_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build message content - support multi-modal if images present
    const hasImages = Array.isArray(images) && images.length > 0;
    const hasDocuments = Array.isArray(documents) && documents.length > 0;

    // Build text portion with documents if present
    let textContent = `User request: "${userIntent}"`;

    if (hasDocuments) {
      textContent += `\n\nAttached documents (${documents.length}):\n`;
      documents.forEach((doc: { name: string; extractedText?: string; metadata?: any }, idx: number) => {
        textContent += `\n--- Document ${idx + 1}: ${doc.name} ---\n`;
        if (doc.metadata) {
          textContent += `[${doc.metadata.wordCount || 0} words`;
          if (doc.metadata.pageCount) {
            textContent += `, ${doc.metadata.pageCount} pages`;
          }
          textContent += `]\n\n`;
        }
        textContent += doc.extractedText || '[No text extracted]';
        textContent += `\n--- End of ${doc.name} ---\n`;
      });
    }

    textContent += `\n\nPlease evaluate whether this request${hasImages ? ' (including any attached screenshots)' : ''}${hasDocuments ? ' (including the attached documents)' : ''} contains enough context to generate a high-quality prompt. Return your response as valid JSON.`;

    const messageContent: Anthropic.MessageParam['content'] = hasImages
      ? [
          ...images.map((img: { data: string; type: string }) => ({
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: img.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: img.data,
            },
          })),
          {
            type: 'text' as const,
            text: textContent,
          },
        ]
      : textContent;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: messageContent,
        }
      ]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    let parsedResponse;
    try {
      // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
      }

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in evaluation response');
        throw new Error('No JSON found in response');
      }

      // Try to parse directly first
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (firstError) {
        // If that fails, try fixing common issues
        let jsonStr = jsonMatch[0];

        // Fix unescaped newlines, tabs, and carriage returns in string values
        jsonStr = jsonStr.replace(/"((?:[^"\\]|\\.)*)"/g, (match, content) => {
          const fixed = content
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          return `"${fixed}"`;
        });

        parsedResponse = JSON.parse(jsonStr);
      }
    } catch (error) {
      console.error('Failed to parse evaluation response:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Response text (first 500 chars):', text.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to evaluate context. Please try again.' },
        { status: 500 }
      );
    }

    // Validate response structure
    const response: {
      sufficient: boolean;
      reasoning: string;
      questions?: Array<{ id: number; text: string; hint: string; category: string; options?: string[] }>;
    } = {
      sufficient: !!parsedResponse.sufficient,
      reasoning: parsedResponse.reasoning || '',
    };

    if (!parsedResponse.sufficient && Array.isArray(parsedResponse.questions)) {
      response.questions = parsedResponse.questions.map(
        (q: { id?: number; text?: string; hint?: string; category?: string; options?: string[] }, idx: number) => ({
          id: q.id || idx + 1,
          text: q.text || '',
          hint: q.hint || '',
          category: q.category || 'context',
          ...(Array.isArray(q.options) && q.options.length > 0 ? { options: q.options } : {}),
        })
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error evaluating context:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('api_key')) {
        return NextResponse.json(
          { error: 'API key configuration error. Please check your ANTHROPIC_API_KEY.' },
          { status: 500 }
        );
      }
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please verify your API key.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while evaluating your request. Please try again.' },
      { status: 500 }
    );
  }
}
