import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { createRequire } from 'module';

const loadCommonJs = createRequire(__filename);

@Injectable()
export class DocumentTextService {
  async extract(storagePath: string, mimeType?: string | null) {
    const extension = extname(storagePath).toLowerCase();
    const buffer = await readFile(storagePath);

    if (mimeType === 'application/pdf' || extension === '.pdf') {
      const pdfParse = loadCommonJs('pdf-parse') as (input: Buffer) => Promise<{ text?: string }>;
      const result = await pdfParse(buffer);
      return this.clean(result.text ?? '');
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === '.docx') {
      const mammoth = loadCommonJs('mammoth') as { extractRawText: (input: { buffer: Buffer }) => Promise<{ value?: string }> };
      const result = await mammoth.extractRawText({ buffer });
      return this.clean(result.value ?? '');
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || extension === '.xlsx') {
      const readXlsxFile = loadCommonJs('read-excel-file/node') as (input: Buffer) => Promise<unknown[][]>;
      const rows = await readXlsxFile(buffer);
      const text = rows.map((row) => row.map((cell) => String(cell ?? '')).join(',')).join('\n');
      return this.clean(text);
    }

    return this.clean(buffer.toString('utf8'));
  }

  private clean(text: string) {
    return text.replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
  }
}
