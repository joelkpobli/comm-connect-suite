import { describe, it, expect, vi } from 'vitest';
import { LocalMediaSession, LocalAudioGraph, rmsLevel, validateLocalPhoto, classifyMediaError } from '@/lib/weechat/media-session';
function fixture() {
 const track = { stop: vi.fn(), addEventListener: vi.fn() };
 const stream = { getTracks: () => [track] } as unknown as MediaStream;
 const api = { getUserMedia: vi.fn().mockResolvedValue(stream), enumerateDevices: vi.fn().mockResolvedValue([]) };
 return { track, stream, api, session: new LocalMediaSession(api) };
}
describe('Local media consent and lifecycle', () => {
 it('never requests microphone without explicit consent', async () => { const f = fixture(); await f.session.start('microphone'); expect(f.api.getUserMedia).not.toHaveBeenCalled(); expect(f.session.getSnapshot().consent.microphone).toBe(false); });
 it('camera consent does not authorize microphone', async () => { const f = fixture(); f.session.consent('camera', true); await f.session.start('microphone'); expect(f.api.getUserMedia).not.toHaveBeenCalled(); });
 it('requests only camera video and marks permission active', async () => { const f = fixture(); f.session.consent('camera', true); await f.session.start('camera'); expect(f.api.getUserMedia).toHaveBeenCalledWith({ video: expect.any(Object), audio: false }); expect(f.session.getSnapshot().status.camera).toBe('active'); });
 it('requests selected microphone and explicit processing settings', async () => { const f = fixture(); f.session.consent('microphone', true); await f.session.start('microphone', 'mic-a', false); expect(f.api.getUserMedia).toHaveBeenCalledWith({ audio: { deviceId: { exact: 'mic-a' }, echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false }); });
 it('stops capture when consent is withdrawn', async () => { const f = fixture(); f.session.consent('camera', true); await f.session.start('camera'); f.session.consent('camera', false); expect(f.track.stop).toHaveBeenCalledOnce(); expect(f.session.getSnapshot().streams.camera).toBeUndefined(); });
 it('stops a late permission result after user cancellation', async () => { const f = fixture(); let resolve: ((s: MediaStream) => void) | undefined; f.api.getUserMedia.mockImplementation(() => new Promise(r => { resolve = r; })); f.session.consent('camera', true); const request = f.session.start('camera'); f.session.stop('camera'); resolve?.(f.stream); await request; expect(f.track.stop).toHaveBeenCalledOnce(); expect(f.session.getSnapshot().status.camera).toBe('stopped'); });
 it('stops late capture after disposal and forbids restarting', async () => { const f = fixture(); let resolve: ((s: MediaStream) => void) | undefined; f.api.getUserMedia.mockImplementation(() => new Promise(r => { resolve = r; })); f.session.consent('camera', true); const request = f.session.start('camera'); f.session.dispose(); resolve?.(f.stream); await request; await f.session.start('camera'); expect(f.track.stop).toHaveBeenCalledOnce(); expect(f.api.getUserMedia).toHaveBeenCalledOnce(); });
 it('prevents duplicate pending requests', async () => { const f = fixture(); f.api.getUserMedia.mockImplementation(() => new Promise(() => {})); f.session.consent('camera', true); void f.session.start('camera'); void f.session.start('camera'); expect(f.api.getUserMedia).toHaveBeenCalledOnce(); });
 it('reports denial without enabling capture', async () => { const f = fixture(); f.api.getUserMedia.mockRejectedValue(new DOMException('denied', 'NotAllowedError')); f.session.consent('camera', true); await f.session.start('camera'); expect(f.session.getSnapshot().status.camera).toBe('denied'); expect(f.session.getSnapshot().streams.camera).toBeUndefined(); });
 it('reports unavailable API without requesting anything', async () => { const session = new LocalMediaSession(undefined); session.consent('microphone', true); await session.start('microphone'); expect(session.getSnapshot().issues.microphone).toBe('unsupported'); });
 it('reports an unexpected disconnected track without silent fallback', async () => { const f = fixture(); f.session.consent('camera', true); await f.session.start('camera'); const call = f.track.addEventListener.mock.calls[0]; if (!call) throw new Error('Missing track listener'); const ended = call[1]; ended(); expect(f.session.getSnapshot().status.camera).toBe('error'); expect(f.session.getSnapshot().issues.camera).toBe('busy'); expect(f.session.getSnapshot().streams.camera).toBeUndefined(); });
 it('reflects temporary mute and recovery without recapturing', async () => {
  const f = fixture(); f.session.consent('camera', true); await f.session.start('camera');
  const mute = f.track.addEventListener.mock.calls.find(call => call[0] === 'mute')?.[1];
  const unmute = f.track.addEventListener.mock.calls.find(call => call[0] === 'unmute')?.[1];
  if (!mute || !unmute) throw new Error('Missing interruption listeners');
  mute(); expect(f.session.getSnapshot().status.camera).toBe('interrupted');
  unmute(); expect(f.session.getSnapshot().status.camera).toBe('active');
  expect(f.api.getUserMedia).toHaveBeenCalledOnce();
 });
 it('ignores callbacks from a replaced stream', async () => {
  const f = fixture(); f.session.consent('camera', true); await f.session.start('camera');
  const ended = f.track.addEventListener.mock.calls[0]?.[1]; if (!ended) throw new Error('Missing listener');
  const nextTrack = {stop: vi.fn(), addEventListener: vi.fn()};
  const nextStream = {getTracks: () => [nextTrack]} as unknown as MediaStream;
  f.api.getUserMedia.mockResolvedValue(nextStream); await f.session.start('camera'); ended();
  expect(f.session.getSnapshot().streams.camera).toBe(nextStream); expect(nextTrack.stop).not.toHaveBeenCalled();
 });
 it('reports removal even without a track-ended event', async () => {
  const track = {stop: vi.fn(), addEventListener: vi.fn(), getSettings: () => ({deviceId:'cam-a'})};
  const device = {deviceId:'cam-a',kind:'videoinput'} as MediaDeviceInfo;
  const api = {getUserMedia:vi.fn().mockResolvedValue({getTracks:()=>[track]}),enumerateDevices:vi.fn().mockResolvedValue([device])};
  const session = new LocalMediaSession(api); session.consent('camera',true); await session.start('camera');
  api.enumerateDevices.mockResolvedValue([]); await session.refreshDevices();
  expect(track.stop).toHaveBeenCalledOnce(); expect(session.getSnapshot().issues.camera).toBe('missing'); expect(session.getSnapshot().status.camera).toBe('unavailable');
 });
 it('rejects an empty captured stream', async () => {
  const f = fixture(); f.api.getUserMedia.mockResolvedValue({getTracks:()=>[]} as unknown as MediaStream);
  f.session.consent('camera',true); await f.session.start('camera');
  expect(f.session.getSnapshot().status.camera).toBe('unavailable'); expect(f.session.getSnapshot().streams.camera).toBeUndefined();
 });
 it.each([['NotFoundError','missing'],['NotReadableError','busy'],['OverconstrainedError','constraints'],['NotSupportedError','unsupported'],['OtherError','unknown']])('classifies %s as %s', (name, expected) => { expect(classifyMediaError(new DOMException('', name))).toBe(expected); });
 it('allows only bounded raster images (rejects SVG and oversize)', () => { expect(validateLocalPhoto({type:'image/png',size:1024})).toBe(true); expect(validateLocalPhoto({type:'image/svg+xml',size:1024})).toBe(false); expect(validateLocalPhoto({type:'image/jpeg',size:5*1024*1024+1})).toBe(false); expect(validateLocalPhoto({type:'image/webp',size:0})).toBe(false); });
 it('computes silence and a nonzero audio signal', () => { expect(rmsLevel(new Uint8Array([128,128]))).toBe(0); expect(rmsLevel(new Uint8Array([192,64]))).toBe(50); });
 it('bounds gain, mutes local output and closes derived tracks without speaker connection', () => {
   const node = () => ({ connect: vi.fn(), disconnect: vi.fn() }); const source = node(); const gain = { ...node(), gain: { value: 1 } }; const analyser = { ...node(), fftSize: 0 }; const stop = vi.fn(); const output = { ...node(), stream: { getTracks: () => [{stop}] } }; const close = vi.fn().mockResolvedValue(undefined); const destination = {};
   const context = { createMediaStreamSource: () => source, createGain: () => gain, createAnalyser: () => analyser, createMediaStreamDestination: () => output, destination, close } as unknown as AudioContext;
   const graph = new LocalAudioGraph(context, fixture().stream); graph.setGain(3, false); expect(gain.gain.value).toBe(2); graph.setGain(1, true); expect(gain.gain.value).toBe(0); graph.setGain(1.6, false); expect(gain.gain.value).toBe(1.6); graph.setGain(NaN,false); expect(gain.gain.value).toBe(1); expect(analyser.connect).toHaveBeenCalledWith(output); expect(analyser.connect).not.toHaveBeenCalledWith(destination); graph.close(); graph.close(); expect(stop).toHaveBeenCalledOnce(); expect(close).toHaveBeenCalledOnce();
 });
});
