import { describe, it, expect } from 'vitest';
import { podAction, podUrl } from '@/lib/weechat/runpod.server';
describe('GPU on-demand wake', () => {
  it('resumes a stopped pod', () => expect(podAction({ desiredStatus: 'EXITED' })).toBe('resume'));
  it('waits for a booting pod', () => expect(podAction({ desiredStatus: 'RUNNING', runtime: null })).toBe('starting'));
  it('uses a running pod', () => expect(podAction({ desiredStatus: 'RUNNING', runtime: { uptimeInSeconds: 5 } })).toBe('ready'));
  it('builds the pod address', () => expect(podUrl('abc123')).toBe('https://abc123-8888.proxy.runpod.net'));
});
