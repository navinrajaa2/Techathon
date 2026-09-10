import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker source for Vite / modern bundlers
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

/**
 * Extract raw text from PDF ArrayBuffer using pdfjs-dist with fallback text decoder
 */
export async function extractTextFromPdf(arrayBuffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items.map(item => item.str);
      fullText += pageItems.join(' ') + '\n';
    }

    if (fullText.trim().length > 20) {
      return fullText.trim();
    }
  } catch (err) {
    console.warn('PDF.js parsing notice, falling back to stream text decoder:', err);
  }

  // Fallback text extraction from raw PDF byte stream
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawStr = decoder.decode(new Uint8Array(arrayBuffer));
    // Extract words and ascii characters from PDF stream
    const cleaned = rawStr
      .replace(/[^\w\s.,\-@#+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  } catch (e) {
    return '';
  }
}

/**
 * Parses any uploaded resume file (.pdf, .txt, .json, .doc, .docx) into plain text
 */
export async function extractResumeContent(file) {
  if (!file) return { text: '', fileName: '', fileType: '' };

  const fileName = file.name || 'resume';
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. PDF Files
    if (fileExt === '.pdf' || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const extractedText = await extractTextFromPdf(buffer);
          
          // Also generate Base64 representation for direct AI attachment
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          resolve({
            text: extractedText,
            fileName,
            fileType: 'pdf',
            base64
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
      return;
    }

    // 2. JSON Files
    if (fileExt === '.json' || file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsed = JSON.parse(content);
          // Convert JSON structure into readable key-value string
          const text = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
          resolve({ text, fileName, fileType: 'json' });
        } catch (err) {
          resolve({ text: e.target.result || '', fileName, fileType: 'json' });
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
      return;
    }

    // 3. Plain Text / Markdown / Code / Word doc fallback
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target.result || '';
      if (typeof text === 'string') {
        // Strip XML tags if docx raw text read
        text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      resolve({ text, fileName, fileType: 'txt' });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
