export type DeviceKind = 'microphone' | 'camera';
export type ConsentKind = DeviceKind | 'photo' | 'avatar';
export type DeviceStatus = 'idle' | 'requesting' | 'active' | 'stopped' | 'denied' | 'unavailable' | 'error';
export type MediaIssue = 'denied' | 'missing' | 'busy' | 'unsupported' | 'constraints' | 'unknown';
export type MediaSnapshot = {
  consent: Record<ConsentKind, boolean>;
  status: Record<DeviceKind, DeviceStatus>;
  issues: Partial<Record<DeviceKind, MediaIssue>>;
  streams: Partial<Record<DeviceKind, MediaStream>>;
  devices: MediaDeviceInfo[];
};
export function classifyMediaError(error: unknown): MediaIssue {
  const name = typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string' ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError') return 'missing';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  if (name === 'OverconstrainedError') return 'constraints';
  if (name === 'NotSupportedError' || name === 'TypeError') return 'unsupported';
  return 'unknown';
}
export function validateLocalPhoto(file: Pick<File, 'type' | 'size'>): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size > 0 && file.size <= 5 * 1024 * 1024;
}
// No storage, fetch, recording or server dependency. Late permission results are stopped.
export class LocalMediaSession {
  private snapshot: MediaSnapshot = { consent: { microphone: false, camera: false, photo: false, avatar: false }, status: { microphone: 'idle', camera: 'idle' }, issues: {}, streams: {}, devices: [] };
  private listeners = new Set<() => void>();
  private generations = { microphone: 0, camera: 0 };
  private disposed = false;
  constructor(private media: Pick<MediaDevices, 'getUserMedia' | 'enumerateDevices'> | undefined) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(patch: Partial<MediaSnapshot>) { this.snapshot = { ...this.snapshot, ...patch }; this.listeners.forEach(fn => fn()); }
  consent(kind: ConsentKind, allowed: boolean) {
    if (!allowed && (kind === 'microphone' || kind === 'camera')) this.stop(kind);
    this.update({ consent: { ...this.snapshot.consent, [kind]: allowed } });
  }
  async refreshDevices() {
    if (!this.media || this.disposed) return;
    try { const devices = await this.media.enumerateDevices(); if (!this.disposed) this.update({ devices }); } catch { /* Capture remains usable if enumeration is blocked. */ }
  }
  async start(kind: DeviceKind, deviceId = '', processing = true) {
    if (this.disposed || !this.snapshot.consent[kind] || this.snapshot.status[kind] === 'requesting') return;
    this.stop(kind);
    const generation = ++this.generations[kind];
    if (!this.media) { this.update({ status: { ...this.snapshot.status, [kind]: 'unavailable' }, issues: { ...this.snapshot.issues, [kind]: 'unsupported' } }); return; }
    this.update({ status: { ...this.snapshot.status, [kind]: 'requesting' }, issues: { ...this.snapshot.issues, [kind]: undefined } });
    try {
      const device = deviceId ? { deviceId: { exact: deviceId } } : {};
      const stream = await this.media.getUserMedia(kind === 'microphone' ? { audio: { ...device, echoCancellation: processing, noiseSuppression: processing, autoGainControl: false }, video: false } : { video: { ...device, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (this.disposed || generation !== this.generations[kind] || !this.snapshot.consent[kind]) { stream.getTracks().forEach(t => t.stop()); return; }
      this.update({ streams: { ...this.snapshot.streams, [kind]: stream }, status: { ...this.snapshot.status, [kind]: 'active' } });
      stream.getTracks().forEach(track => track.addEventListener('ended', () => {
        if (generation === this.generations[kind]) this.stop(kind);
      }, { once: true }));
      await this.refreshDevices();
    } catch (error) {
      if (this.disposed || generation !== this.generations[kind]) return;
      const issue = classifyMediaError(error);
      this.update({ issues: { ...this.snapshot.issues, [kind]: issue }, status: { ...this.snapshot.status, [kind]: issue === 'denied' ? 'denied' : issue === 'missing' || issue === 'unsupported' ? 'unavailable' : 'error' } });
    }
  }
  stop(kind: DeviceKind) {
    ++this.generations[kind];
    this.snapshot.streams[kind]?.getTracks().forEach(track => track.stop());
    this.update({ streams: { ...this.snapshot.streams, [kind]: undefined }, status: { ...this.snapshot.status, [kind]: 'stopped' } });
  }
  stopAll() { this.stop('microphone'); this.stop('camera'); }
  dispose() { this.stopAll(); this.disposed = true; this.listeners.clear(); }
}
export function rmsLevel(samples: Uint8Array): number {
  if (!samples.length) return 0;
  const mean = samples.reduce((total, value) => total + ((value - 128) / 128) ** 2, 0) / samples.length;
  return Math.min(100, Math.round(Math.sqrt(mean) * 100));
}
export class LocalAudioGraph {
  readonly analyser: AnalyserNode;
  readonly gain: GainNode;
  readonly output: MediaStreamAudioDestinationNode;
  private source: MediaStreamAudioSourceNode;
  constructor(readonly context: AudioContext, stream: MediaStream) {
    this.source = context.createMediaStreamSource(stream);
    this.gain = context.createGain();
    this.analyser = context.createAnalyser(); this.analyser.fftSize = 256;
    this.output = context.createMediaStreamDestination();
    this.source.connect(this.gain); this.gain.connect(this.analyser); this.analyser.connect(this.output);
    // Deliberately never connected to context.destination (no feedback/speaker monitoring).
  }
  setGain(value: number, muted: boolean) { this.gain.gain.value = muted ? 0 : Math.min(2, Math.max(0, value)); }
  close() {
    this.source.disconnect(); this.gain.disconnect(); this.analyser.disconnect();
    this.output.stream.getTracks().forEach(track => track.stop());
    void this.context.close().catch(() => {});
  }
}
