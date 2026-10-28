import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/ocr-service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file was provided in the upload request.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'document.pdf';
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (!isPdf) {
      return NextResponse.json(
        { error: 'Only PDF files (.pdf) are supported. Please upload a valid PDF document.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 10MB limit. Please upload a smaller document.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extraction = await extractTextFromPdf(buffer);

    if (extraction.error || !extraction.text) {
      return NextResponse.json(
        {
          error:
            extraction.error ||
            'No readable text could be found in this PDF. It appears to be an empty or unsupported document.',
          isScanned: extraction.isScanned,
          ocrApplied: extraction.ocrApplied,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: extraction.text,
      fileName,
      fileSize: file.size,
      pageCount: extraction.pageCount,
      wordCount: extraction.wordCount,
      isScanned: extraction.isScanned,
      ocrApplied: extraction.ocrApplied,
      ocrEngine: extraction.ocrEngine,
    });
  } catch (err: unknown) {
    console.error('[pdf-extract] Extraction error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      {
        error:
          'Failed to read or parse the PDF document. Please ensure the file is not corrupted or password-protected.',
      },
      { status: 500 }
    );
  }
}
