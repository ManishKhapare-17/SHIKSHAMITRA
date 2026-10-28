// ============================================================
// ShikshaMitra AI — Robust Multi-Pass PDF Extraction & OCR Service
// Multi-pass extractor: Native PDF text -> Gemini Vision OCR -> Local Tesseract OCR
// Languages: English (eng), Hindi (hin), Marathi (mar)
// ============================================================

import path from 'path';
import { pathToFileURL } from 'url';
import { PDFParse } from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createWorker } from 'tesseract.js';

// Configure pdfjs worker using file:// URL for reliable Next.js Windows server execution
try {
  const workerDiskPath = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs'
  );
  const workerFileUrl = pathToFileURL(workerDiskPath).href;

  if (typeof (PDFParse as unknown as { setWorker?: (src: string) => void }).setWorker === 'function') {
    (PDFParse as unknown as { setWorker: (src: string) => void }).setWorker(workerFileUrl);
  }
} catch (workerSrcErr) {
  console.warn('[ocr-service] Could not set pdfjs workerSrc:', workerSrcErr);
}

export interface ExtractionResult {
  text: string;
  pageCount: number;
  wordCount: number;
  isScanned: boolean;
  ocrApplied: boolean;
  ocrEngine?: 'gemini-vision' | 'tesseract' | 'none';
  error?: string;
}

/**
 * Extract text from a PDF buffer using a multi-pass pipeline:
 * Pass 1: Native selectable text extraction via pdf-parse
 * Pass 2A: Cloud AI Vision OCR via Google Gemini 1.5 Flash (if API key available)
 * Pass 2B: Local Multi-Page Tesseract OCR (offline, using bundled tessdata for eng+hin+mar)
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  let cleanedText = '';
  let totalPages = 1;
  let isScanned = false;
  let ocrApplied = false;
  let ocrEngine: 'gemini-vision' | 'tesseract' | 'none' = 'none';

  // ──── Pass 1: Selectable Digital Text Extraction via pdf-parse ─────
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    totalPages = textResult.total || 1;

    // Preserve page boundaries if multiple pages exist
    if (textResult.pages && textResult.pages.length > 0) {
      const pageSections = textResult.pages
        .map((p) => {
          const pt = (p.text || '').replace(/\0/g, '').replace(/\r\n/g, '\n').trim();
          return pt.length > 0 ? `--- Page ${p.num} ---\n${pt}` : '';
        })
        .filter(Boolean);

      if (pageSections.length > 0) {
        cleanedText = pageSections.join('\n\n').trim();
      }
    }

    if (!cleanedText && textResult.text) {
      cleanedText = textResult.text
        .replace(/\0/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
  } catch (parseErr) {
    console.warn('[ocr-service] Native text extraction failed, document may be scanned or image-based:', parseErr);
  }

  // If digital text extraction found sufficient text (>= 20 characters), return immediately
  if (cleanedText.length >= 20) {
    const words = cleanedText.split(/\s+/).filter(Boolean);
    if (parser) {
      await parser.destroy().catch(() => {});
    }
    return {
      text: cleanedText,
      pageCount: totalPages,
      wordCount: words.length,
      isScanned: false,
      ocrApplied: false,
      ocrEngine: 'none',
    };
  }

  // ──── Pass 2: Document appears scanned or image-only — Run OCR ─────
  isScanned = true;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // ── Pass 2A: Cloud AI Vision OCR via Gemini (if key configured) ──
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt =
        'Transcribe all text from this scanned school document in exact order. Preserve page markers (e.g. "--- Page 1 ---"), headings, formulas, and paragraphs. Accurately transcribe English, Hindi, and Marathi text in Devanagari script. Do not add conversational commentary.';

      const result = await model.generateContent([
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        },
        prompt,
      ]);

      const ocrText = result.response.text().trim();
      if (ocrText.length >= 20) {
        cleanedText = ocrText;
        ocrApplied = true;
        ocrEngine = 'gemini-vision';
      }
    } catch (geminiOcrErr) {
      console.warn('[ocr-service] Cloud Gemini Vision OCR failed, falling back to local Tesseract OCR:', geminiOcrErr);
    }
  }

  // ── Pass 2B: Local Multi-Page Tesseract OCR (Offline) ────────────
  if (cleanedText.length < 20) {
    try {
      // 1. First attempt to render full PDF pages as images via getScreenshot
      let renderedPages: Array<{ pageNumber: number; data: Uint8Array }> = [];

      if (parser) {
        try {
          const screenshotResult = await parser.getScreenshot({ imageBuffer: true });
          if (screenshotResult && screenshotResult.pages && screenshotResult.pages.length > 0) {
            renderedPages = screenshotResult.pages
              .filter((p) => p.data && p.data.length > 100)
              .map((p) => ({ pageNumber: p.pageNumber, data: p.data }));
          }
        } catch (screenshotErr) {
          console.warn('[ocr-service] Page screenshot render failed, attempting embedded image extraction:', screenshotErr);
        }

        // 2. If getScreenshot produced no pages, fallback to extracting embedded images
        if (renderedPages.length === 0) {
          try {
            const imageResult = await parser.getImage({ imageBuffer: true });
            if (imageResult && imageResult.pages && imageResult.pages.length > 0) {
              for (const page of imageResult.pages) {
                for (const img of page.images) {
                  if (img.data && img.data.length > 100) {
                    renderedPages.push({ pageNumber: page.pageNumber, data: img.data });
                  }
                }
              }
            }
          } catch (imgErr) {
            console.warn('[ocr-service] Could not extract embedded page images:', imgErr);
          }
        }
      }

      const workerPath = path.join(
        process.cwd(),
        'node_modules',
        'tesseract.js',
        'src',
        'worker-script',
        'node',
        'index.js'
      );
      const tessdataPath = path.join(process.cwd(), 'tessdata');

      // Initialize Tesseract worker for English, Hindi, and Marathi offline
      const worker = await createWorker('eng+hin+mar', 1, {
        workerPath,
        cachePath: tessdataPath,
        gzip: false,
      });

      try {
        const ocrPages: string[] = [];

        // Limit OCR processing to maximum 10 pages for responsive performance
        const pagesToProcess = renderedPages.slice(0, 10);

        if (pagesToProcess.length > 0) {
          // Process rendered/extracted page images in strict page order
          for (const page of pagesToProcess) {
            const imgBuffer = Buffer.from(page.data);
            const ret = await worker.recognize(imgBuffer);
            const pageText = ret.data.text.trim();
            if (pageText.length > 0) {
              ocrPages.push(`--- Page ${page.pageNumber} ---\n${pageText}`);
            }
          }
        }

        if (ocrPages.length > 0) {
          cleanedText = ocrPages.join('\n\n').trim();
          if (cleanedText.length >= 15) {
            ocrApplied = true;
            ocrEngine = 'tesseract';
            totalPages = Math.max(totalPages, ocrPages.length);
          }
        }
      } finally {
        await worker.terminate();
      }
    } catch (localOcrErr) {
      console.warn('[ocr-service] Local Tesseract OCR encountered an issue:', localOcrErr);
    }
  }

  if (parser) {
    await parser.destroy().catch(() => {});
  }

  const words = cleanedText.split(/\s+/).filter(Boolean);

  if (cleanedText.length < 15) {
    return {
      text: '',
      pageCount: totalPages,
      wordCount: 0,
      isScanned: true,
      ocrApplied: false,
      ocrEngine: 'none',
      error:
        'No readable text could be detected in this document. It appears to be an empty or unsupported document. Please upload a clear PDF with visible text or readable scanned pages.',
    };
  }

  return {
    text: cleanedText,
    pageCount: totalPages,
    wordCount: words.length,
    isScanned,
    ocrApplied,
    ocrEngine,
  };
}
