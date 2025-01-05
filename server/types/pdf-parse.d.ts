declare module 'pdf-parse/lib/pdf-parse.js' {
  function PDFParse(dataBuffer: Buffer): Promise<{
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }>;

  export = PDFParse;
}
