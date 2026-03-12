const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const PptxParser = require('pptx-parser');

/**
 * Extract text from PDF files
 */
export async function extractPDF(buffer: Buffer): Promise<{ text: string; pageCount?: number }> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
  };
}

/**
 * Extract text from DOCX files
 */
export async function extractDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from PPTX files
 */
export async function extractPPTX(buffer: Buffer): Promise<string> {
  const parser = new PptxParser();
  const slides = await parser.parse(buffer);
  return slides.map((s: any) => s.text).join('\n\n');
}

/**
 * Extract text from document based on MIME type
 * Handles PDF, DOCX, and PPTX formats
 * Truncates to 50,000 characters if needed
 */
export async function extractDocument(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; metadata: any }> {
  let text = '';
  let pageCount: number | undefined;

  switch (mimeType) {
    case 'application/pdf':
      const pdfResult = await extractPDF(buffer);
      text = pdfResult.text;
      pageCount = pdfResult.pageCount;
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      text = await extractDOCX(buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      text = await extractPPTX(buffer);
      break;
    default:
      throw new Error('Unsupported file type');
  }

  // Clean up the text
  text = text.trim();

  // Truncate if too long (50k char limit)
  const MAX_CHARS = 50000;
  const truncated = text.length > MAX_CHARS;
  if (truncated) {
    text = text.substring(0, 30000) +
           '\n\n[... middle content truncated due to length ...]\n\n' +
           text.substring(text.length - 5000);
  }

  // Calculate word count
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  return {
    text,
    metadata: {
      ...(pageCount && { pageCount }),
      wordCount,
      charCount: text.length,
      truncated,
    },
  };
}
