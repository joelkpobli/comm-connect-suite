// Browser-local composition output. No recorder, network sink or system-camera bridge.
export class LocalVideoOutput {
  readonly stream: MediaStream;
  private closed = false;
  constructor(canvas: Pick<HTMLCanvasElement, 'captureStream'>, fps = 15) {
    this.stream = canvas.captureStream(fps);
    if (!this.stream.getVideoTracks().length) {
      this.close();
      throw new Error('Canvas video track unavailable');
    }
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.stream.getTracks().forEach(track => track.stop());
  }
}

export function framePlacement(sourceWidth: number, sourceHeight: number, width: number, height: number, fit: 'contain' | 'cover') {
  if (sourceWidth <= 0 || sourceHeight <= 0) return null;
  const scale = fit === 'cover' ? Math.max(width / sourceWidth, height / sourceHeight) : Math.min(width / sourceWidth, height / sourceHeight);
  const w = sourceWidth * scale; const h = sourceHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}