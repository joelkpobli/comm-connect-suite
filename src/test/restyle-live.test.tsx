import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RestyleLivePage } from '@/components/weechat/restyle-live';
import { DemoProvider } from '@/components/weechat/provider';
import { restyleFilter } from '@/lib/weechat/restyle';

const getUserMedia = vi.fn();
const stop = vi.fn();
const stream = { getTracks: () => [{ stop, addEventListener: vi.fn(), readyState: 'live' }] } as unknown as MediaStream;
const open = () => render(<DemoProvider><RestyleLivePage /></DemoProvider>);
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  localStorage.clear(); getUserMedia.mockReset(); stop.mockReset(); getUserMedia.mockResolvedValue(stream);
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia, enumerateDevices: vi.fn().mockResolvedValue([]) } });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ filter: 'none', save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('Restyle camera privacy', () => {
  it('does not request camera without consent', () => {
    open(); expect(screen.getByRole('button', { name: 'Activer la caméra' })).toBeDisabled(); expect(getUserMedia).not.toHaveBeenCalled();
  });
  it('captures video only and releases it on consent withdrawal', async () => {
    open(); const consent = screen.getByRole('checkbox'); fireEvent.click(consent); fireEvent.click(screen.getByRole('button', { name: 'Activer la caméra' }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }));
    fireEvent.click(consent); expect(stop).toHaveBeenCalledOnce();
  });
  it('stops a pending permission result after cancellation', async () => {
    let resolve: ((s: MediaStream) => void) | undefined;
    getUserMedia.mockImplementation(() => new Promise(r => { resolve = r; }));
    open(); fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(screen.getByRole('button', { name: 'Activer la caméra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Couper la caméra' })); resolve?.(stream);
    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
  });
  it('releases camera when page is hidden', async () => {
    open(); fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(screen.getByRole('button', { name: 'Activer la caméra' }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce());
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true); fireEvent(document, new Event('visibilitychange')); expect(stop).toHaveBeenCalledOnce();
  });
  it('releases camera on unmount', async () => {
    const { unmount } = open(); fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(screen.getByRole('button', { name: 'Activer la caméra' }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce()); unmount(); expect(stop).toHaveBeenCalledOnce();
  });
  it('does not retain consent in storage or call network services', async () => {
    open(); const save = vi.spyOn(Storage.prototype, 'setItem'); const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(screen.getByRole('button', { name: 'Activer la caméra' }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce()); expect(save).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
});
describe('Local video effect computation', () => {
  it('removes monochrome at zero intensity and applies it at 100 percent', () => {
    expect(restyleFilter('mono', 0, 100)).toBe('grayscale(0) contrast(1)'); expect(restyleFilter('mono', 100, 100)).toBe('grayscale(1) contrast(1)');
  });
  it('bounds contrast to 60–160 percent', () => {
    expect(restyleFilter('natural', 65, -1)).toBe('contrast(0.6)'); expect(restyleFilter('natural', 65, 999)).toBe('contrast(1.6)');
  });
});