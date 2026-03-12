import Anthropic from '@anthropic-ai/sdk';
import { getBlocksForLLMContext, getBlockById, getSectionHeader } from '@/lib/blocks';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert prompt engineer for the TCWEI Prompt Library system. Your job is to help users create high-quality, structured prompts by selecting the most appropriate building blocks from our library.

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

## YOUR TASK
When a user describes what they want to accomplish:
1. Analyze their intent carefully
2. Select the most relevant building blocks (typically 3-7 blocks)
3. Customize any placeholders [LIKE THIS] based on user context
4. Assemble a complete, ready-to-use prompt

## OUTPUT FORMAT
You must respond with ONLY valid JSON (no other text). Use this exact structure:
{
  "selectedBlocks": ["W-01", "T-04", "C-01", "I-02", "BP-01"],
  "reasoning": "Brief explanation of why these blocks were chosen",
  "assembledPrompt": "The complete prompt with newlines as \\n"
}

CRITICAL JSON RULES:
- Output ONLY the JSON object, nothing else
- The assembledPrompt must be a valid JSON string with newlines escaped as \\n
- Do NOT include unescaped newlines inside JSON string values
- Double quotes inside strings must be escaped as \\"

CONTENT GUIDELINES:
- The assembledPrompt is a PROMPT that the user will copy-paste into another LLM for execution. You are a prompt ENGINEER, not the prompt EXECUTOR.
- NEVER answer or fulfill the building blocks yourself. Instead, include them as INSTRUCTIONS for the target LLM to follow.
- For example, if you select BP-04 (Certainty Level), include it as an instruction like "Add a final Certainty Level section..." — do NOT write "Certainty Level: High" yourself.
- Similarly, do NOT produce the actual analysis, summary, or deliverable. Produce the PROMPT that will make another LLM produce it.
- Fill in placeholders if the user provided enough context, otherwise keep them as [PLACEHOLDER]

CRITICAL STRUCTURAL REQUIREMENTS:
- Use XML tags to clearly separate sections (Claude is trained on XML and parses it better than markdown)
- Structure the prompt in this ORDER (proven by research to improve instruction following):
  1. <role> - Writer blocks defining the AI's persona
  2. <task> - Task blocks specifying what to do
  3. <context> - Context blocks providing background/constraints
  4. <examples> - Example blocks (if selected)
  5. <best_practices> - Best Practice blocks for quality guardrails
  6. <instructions> - Instruction blocks for output format/style
  7. <coding> - Coding blocks (if selected, for technical tasks)
  8. <thinking> - Chain-of-thought meta-instruction (ALWAYS INCLUDE)
- Within each XML section, combine all relevant blocks' content
- Use \\n\\n to separate multiple blocks within same section
- After main sections, add a <thinking> block that instructs step-by-step reasoning

EXAMPLE STRUCTURE:
<role>\\n[Writer block content]\\n</role>\\n\\n<task>\\n[Task block content]\\n</task>\\n\\n<context>\\n[Context blocks]\\n</context>\\n\\n<instructions>\\n[Instruction blocks]\\n</instructions>\\n\\n<thinking>\\nBefore providing your final answer, work through this step-by-step:\\n1. Analyze the core requirement\\n2. Consider edge cases and constraints\\n3. Develop your approach\\n4. Validate against requirements\\n5. Present your final answer\\n</thinking>

- Be selective - only include relevant blocks
- Always include at least one Writer and one Task block when applicable`;

export async function POST(request: NextRequest) {
  try {
    const { userIntent, clarifyingAnswers, images, documents } = await request.json();

    if (!userIntent || typeof userIntent !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a description of what you want to accomplish' },
        { status: 400 }
      );
    }

    // Use CLAUDE_API_KEY as fallback (ANTHROPIC_API_KEY may be overridden by system env)
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    console.log('API Key present:', !!apiKey, 'Length:', apiKey?.length);

    if (!apiKey) {
      console.error('API key is not set in environment');
      return NextResponse.json(
        { error: 'API key not configured. Please set CLAUDE_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Create client inside request handler to ensure env vars are loaded
    const client = new Anthropic({
      apiKey: apiKey,
    });

    // Build message content - support multi-modal if images present
    const hasImages = Array.isArray(images) && images.length > 0;
    const hasDocuments = Array.isArray(documents) && documents.length > 0;

    // Build document context if present
    let documentContext = '';
    if (hasDocuments) {
      documentContext = `\n\nAttached documents (${documents.length}):\n`;
      documents.forEach((doc: { name: string; extractedText?: string; metadata?: any }, idx: number) => {
        documentContext += `\n--- Document ${idx + 1}: ${doc.name} ---\n`;
        if (doc.metadata) {
          documentContext += `[${doc.metadata.wordCount || 0} words`;
          if (doc.metadata.pageCount) {
            documentContext += `, ${doc.metadata.pageCount} pages`;
          }
          documentContext += `]\n\n`;
        }
        documentContext += doc.extractedText || '[No text extracted]';
        documentContext += `\n--- End of ${doc.name} ---\n`;
      });
    }

    const textContent = clarifyingAnswers?.length
      ? `User request: "${userIntent}"

Additional context gathered from follow-up questions:
${clarifyingAnswers.map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}${documentContext}

Please analyze this request with all the provided context${hasImages ? ', attached screenshots,' : ''}${hasDocuments ? ' and attached documents' : ''} and generate an appropriate prompt using the TCWEI building blocks. Use the document content to fill in placeholders and provide specific context. Return your response as valid JSON.`
      : `User request: "${userIntent}"${documentContext}

Please analyze this request${hasImages ? ', attached screenshots,' : ''}${hasDocuments ? ' and attached documents' : ''} and generate an appropriate prompt using the TCWEI building blocks. Use the document content to fill in placeholders and provide specific context. Return your response as valid JSON.`;

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
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: messageContent,
        }
      ]
    });

    // Extract text from the response
    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response from Claude
    let parsedResponse;
    try {
      // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
      }

      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in LLM response');
        throw new Error('No JSON found in response');
      }

      // Try to parse directly first
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (firstError) {
        // If that fails, try fixing common issues
        let jsonStr = jsonMatch[0];

        // Fix unescaped newlines, tabs, and carriage returns in string values
        // Only replace in string values (between quotes, accounting for escaped quotes)
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
      console.error('Failed to parse LLM response:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Response text (first 500 chars):', text.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to generate prompt. Please try again.' },
        { status: 500 }
      );
    }

    // Validate and enrich the response
    const selectedBlocks = parsedResponse.selectedBlocks.map((id: string) => {
      const blockInfo = getBlockById(id);
      return blockInfo ? {
        id,
        title: blockInfo.block.title,
        category: blockInfo.category,
        categoryLabel: getSectionHeader(blockInfo.category).replace('## ', '')
      } : { id, title: 'Unknown', category: 'unknown', categoryLabel: 'Unknown' };
    }).filter((b: { id: string; title: string }) => b.title !== 'Unknown');

    return NextResponse.json({
      prompt: parsedResponse.assembledPrompt,
      selectedBlocks,
      reasoning: parsedResponse.reasoning
    });

  } catch (error) {
    console.error('Error generating prompt:', error);

    // Check for specific API errors
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
      { error: 'An error occurred while generating the prompt. Please try again.' },
      { status: 500 }
    );
  }
}
