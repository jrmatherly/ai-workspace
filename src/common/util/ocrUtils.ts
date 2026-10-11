/**
 * Shared OCR utilities using Tesseract.js
 *
 * Used by:
 * - image-ocr converter (single image)
 * - pdf-auto converter (multi-page fallback)
 * - pdf-images-ocr converter (forced OCR on PDF pages)
 */

/**
 * Where tesseract.js loads its worker, wasm core and language data, copied from node_modules by
 * tools/develop/browser-assets. Unset, tesseract.js fetches all three from the jsDelivr CDN at first use.
 * LSTM-only: only the three `-lstm` cores and the `best_int` English model are served, so workers stay on
 * `OEM.LSTM_ONLY` (no `legacyCore`, no `TESSERACT_ONLY` / `TESSERACT_LSTM_COMBINED`, no `detect()`).
 */
export const TESSERACT_ASSET_OPTIONS = {
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/core/',
  langPath: '/tesseract/lang',
} as const;

type OcrRecognize = (image: Blob | string, onProgress?: (progress: number) => void) => Promise<string>;

/**
 * Runs `fn` with one English LSTM worker: the ~4 MB core and model load once per call, not once per image.
 */
async function withOcrWorker<T>(fn: (recognize: OcrRecognize) => Promise<T>): Promise<T> {
  const { createWorker, OEM } = await import('tesseract.js');

  let onPageProgress: ((progress: number) => void) | undefined;
  let lastProgress = -1;

  const worker = await createWorker('eng', OEM.LSTM_ONLY, {
    ...TESSERACT_ASSET_OPTIONS,
    errorHandler: e => {
      // NOTE: shall we inform the user about the error?
      console.error('[OCR Error]', e);
    },
    logger: (message) => {
      if (!onPageProgress || message.status !== 'recognizing text')
        return;
      if (message.progress > lastProgress + 0.01) {
        lastProgress = message.progress;
        onPageProgress(message.progress);
      }
    },
  });

  try {
    return await fn(async (image, onProgress) => {
      onPageProgress = onProgress;
      lastProgress = -1;
      const { data: page } = await worker.recognize(image);
      return page.text;
    });
  } finally {
    await worker.terminate();
  }
}


/**
 * Result of OCR operation with quality metadata
 */
export interface OcrResult {
  text: string;
  avgCharsPerPage: number;
  pageCount: number;
}


/**
 * OCR a single image with progress tracking
 *
 * @param imageData - Blob or base64 data URL
 * @param onProgress - Progress callback (0-1)
 * @returns Extracted text
 */
export async function ocrImageWithProgress(
  imageData: Blob | string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return withOcrWorker(recognize => recognize(imageData, onProgress));
}


/**
 * OCR multiple PDF page images with cumulative progress tracking
 *
 * @param imageDataURLs - Array of rendered PDF page images
 * @param onProgress - Progress callback (0-1, cumulative across all pages)
 * @returns Combined text from all pages with quality metadata
 */
export async function ocrPdfPagesWithProgress(
  imageDataURLs: Array<{ mimeType: string; base64Data: string }>,
  onProgress?: (progress: number) => void,
): Promise<OcrResult> {

  const totalPages = imageDataURLs.length;

  const pageTexts = await withOcrWorker(async (recognize) => {
    const texts: string[] = [];
    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const { mimeType, base64Data } = imageDataURLs[pageNum];
      texts.push(await recognize(`data:${mimeType};base64,${base64Data}`,
        (pageProgress) => onProgress?.((pageNum + pageProgress) / totalPages),
      ));
      onProgress?.((pageNum + 1) / totalPages);
    }
    return texts;
  });

  // Combine pages with informative separators for multi-page PDFs
  const combinedText = pageTexts
    .map((text, i) => `--- Page ${i + 1}/${totalPages} (OCR) ---\n\n${text}`)
    .join('\n\n') + `\n\n--- End of OCR Document | If content is missing or garbled, re-attach PDF as images ---`;

  const trimmedLength = combinedText.trim().length;

  return {
    text: combinedText,
    pageCount: totalPages,
    avgCharsPerPage: totalPages > 0 ? trimmedLength / totalPages : 0,
  };
}
