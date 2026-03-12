import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const { document } = await request.json();

    if (!document?.data || !document?.type) {
      return NextResponse.json(
        { error: 'Invalid document format. Expected { document: { data, type } }' },
        { status: 400 }
      );
    }

    // Validate file size
    const buffer = Buffer.from(document.data, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 413 }
      );
    }

    // Dynamically import the extractor to avoid build-time issues with pdf-parse
    const { extractDocument } = await import('@/lib/documentExtractor');

    // Extract text
    const { text, metadata } = await extractDocument(buffer, document.type);

    // Check for empty extraction (scanned PDFs)
    if (!text.trim() || text.length < 50) {
      return NextResponse.json(
        { error: 'This document appears to contain no extractable text. If it\'s a PDF, it may be scanned images. Try uploading as an image instead.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      extractedText: text,
      metadata,
      preview: text.substring(0, 500),
    });

  } catch (error: any) {
    console.error('Document extraction error:', error);

    // Handle password-protected documents
    if (error.message && error.message.toLowerCase().includes('password')) {
      return NextResponse.json(
        { error: 'Document is password-protected. Please remove the password and try again.' },
        { status: 400 }
      );
    }

    // Handle unsupported file types
    if (error.message && error.message.includes('Unsupported')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only PDF, DOCX, and PPTX are supported.' },
        { status: 415 }
      );
    }

    // Handle corrupted files
    return NextResponse.json(
      { error: 'Failed to extract document content. The file may be corrupted or in an unsupported format.' },
      { status: 500 }
    );
  }
}
