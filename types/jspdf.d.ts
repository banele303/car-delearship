declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    text(text: string, x: number, y: number): void;
    addPage(): void;
    setFontSize(size: number): void;
    save(filename: string): void;
  }
}
