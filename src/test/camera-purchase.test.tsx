import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const state = vi.hoisted(() => ({ checkout: vi.fn(), hash: 'camera', licence: false }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: () => state.checkout }));
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => state.hash,
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
}));
vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: () => ({ data: { totals: { balance: 0 } } }),
  useQuery: ({ queryKey }: { queryKey?: string[] }) => ({ data: queryKey?.[0] === 'camera-license' ? state.licence : undefined }),
}));
vi.mock('@/lib/weechat/payments.functions', () => ({ startCheckout: vi.fn(), getCameraLicense: vi.fn() }));
vi.mock('@/components/weechat/provider', () => ({ useDemo: () => ({ locale: 'fr' }) }));

import { CreditsPage } from '@/components/weechat/credits';

describe('Camera licence checkout entry', () => {
  beforeEach(() => { state.hash = 'camera'; state.licence = false; state.checkout.mockReset(); });
  afterEach(cleanup);

  it('opens the camera offer directly and submits the licence catalogue id', async () => {
    state.checkout.mockResolvedValue({ ok: false });
    render(<CreditsPage embedded />);
    fireEvent.click(await screen.findByRole('button', { name: 'Activer la caméra Weechat' }));
    await waitFor(() => expect(state.checkout).toHaveBeenCalledWith({ data: { itemId: 'camera-license', method: 'mobile' } }));
  });

  it('uses the card checkout for the same licence when selected', async () => {
    state.checkout.mockResolvedValue({ ok: false });
    render(<CreditsPage embedded />);
    fireEvent.click(screen.getByRole('radio', { name: 'Carte bancaire' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Activer la caméra Weechat' }));
    await waitFor(() => expect(state.checkout).toHaveBeenCalledWith({ data: { itemId: 'camera-license', method: 'card' } }));
  });

  it('does not offer another licence purchase to an already licensed account', async () => {
    state.licence = true;
    render(<CreditsPage embedded />);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Activer la caméra Weechat' })).toBeNull());
    expect(state.checkout).not.toHaveBeenCalled();
  });

  it('unlocks purchases when the browser restores the checkout page', async () => {
    state.checkout.mockReturnValue(new Promise(() => {}));
    render(<CreditsPage embedded />);
    fireEvent.click(await screen.findByRole('button', { name: 'Activer la caméra Weechat' }));
    expect(screen.getByRole('button', { name: '…' })).toBeDisabled();
    fireEvent(window, new Event('pageshow'));
    expect(screen.getByRole('button', { name: 'Activer la caméra Weechat' })).toBeEnabled();
  });
});