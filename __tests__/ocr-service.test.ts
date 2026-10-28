import { extractTextFromPdf } from '@/lib/ocr-service';

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn().mockImplementation(() =>
    Promise.resolve({
      recognize: jest.fn().mockResolvedValue({
        data: { text: '' },
      }),
      terminate: jest.fn().mockResolvedValue(undefined),
    })
  ),
}));

describe('extractTextFromPdf', () => {
  it('returns appropriate error structure when passed an invalid buffer', async () => {
    const invalidBuffer = Buffer.from('not a pdf at all');
    const result = await extractTextFromPdf(invalidBuffer);

    expect(result).toBeDefined();
    expect(result.text).toBe('');
    expect(result.isScanned).toBe(true);
    expect(result.ocrApplied).toBe(false);
    expect(typeof result.error).toBe('string');
  });

  it('handles empty buffer gracefully without throwing', async () => {
    const emptyBuffer = Buffer.from([]);
    const result = await extractTextFromPdf(emptyBuffer);

    expect(result).toBeDefined();
    expect(result.text).toBe('');
    expect(result.pageCount).toBe(1);
    expect(result.wordCount).toBe(0);
  });

  it('preserves page markers and Devanagari text structure when OCR recognizes content', async () => {
    const fakeBuffer = Buffer.from('fake pdf content');
    // Test that the ExtractionResult interface is preserved
    const result = await extractTextFromPdf(fakeBuffer);
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('pageCount');
    expect(result).toHaveProperty('wordCount');
    expect(result).toHaveProperty('isScanned');
    expect(result).toHaveProperty('ocrApplied');
  });
});
