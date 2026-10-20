import { describe, expect, it, vi } from 'vitest';
import { LocalVideoOutput, framePlacement } from '@/lib/weechat/video-pipeline';
import { communicationAvailability, startCommunicationStage } from '@/lib/weechat/communication-contracts';

describe('Local video pipeline', () => {
 it('captures at 15 fps and stops derived tracks once', () => {
  const track = {stop:vi.fn()}; const stream = {getTracks:()=>[track],getVideoTracks:()=>[track]} as unknown as MediaStream;
  const canvas = {captureStream:vi.fn().mockReturnValue(stream)};
  const output = new LocalVideoOutput(canvas); expect(canvas.captureStream).toHaveBeenCalledWith(15);
  output.close(); output.close(); expect(track.stop).toHaveBeenCalledOnce();
 });
 it('rejects video output without a video track and releases resources', () => {
  const stop = vi.fn(); const canvas = {captureStream:vi.fn().mockReturnValue({getVideoTracks:()=>[],getTracks:()=>[{stop}]})};
  expect(()=>new LocalVideoOutput(canvas)).toThrow('Canvas video track unavailable'); expect(stop).toHaveBeenCalledOnce();
 });
 it('fits and fills a portrait source without distortion', () => {
  expect(framePlacement(360,640,640,360,'contain')).toEqual({x:218.75,y:0,width:202.5,height:360});
  const fill = framePlacement(360,640,640,360,'cover'); expect(fill?.width).toBe(640); expect(fill?.y).toBeLessThan(0);
  expect(framePlacement(0,640,640,360,'contain')).toBeNull();
 });
});
describe('Unconnected communication integrations', () => {
 it.each(['recognition','translation','synthesis','avatar-animation'] as const)('%s cannot run or silently substitute a demo', stage => {
  expect(communicationAvailability(stage)).toEqual({stage,available:false,blockers:['adapter_missing','license_unverified','zero_budget_unverified','consent_not_verified']});
  expect(()=>startCommunicationStage(stage)).toThrow('integration unavailable; no media transmitted');
 });
});