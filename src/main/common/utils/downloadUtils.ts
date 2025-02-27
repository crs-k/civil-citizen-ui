import {Response} from 'express';

export function displayPDF(res: Response, content: Buffer, filename: string) {
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=${filename}.pdf`,
    'Content-Length': content ? content.length : 0,
  });
  res.end(content);
}

export function downloadPDF(res: Response, content: Buffer, filename: string) {
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=${filename}`,
    'Content-Length': content ? content.length : 0,
  });
  res.end(content);
}
