declare module 'gif.js/dist/gif' {
  export default class GIF {
    constructor(options: { 
      workers: number; 
      quality: number; 
      width: number; 
      height: number;
      workerScript?: string;
    });
    addFrame(canvas: HTMLCanvasElement, options: { delay: number }): void;
    on(event: 'finished' | 'error', callback: (blob: Blob) => void): void;
    render(): void;
  }
} 