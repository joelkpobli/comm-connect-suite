import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The resend lockout is the rule under test: the email request itself is faked so no
// network call leaves the test run.
const { resend } = vi.hoisted(() => ({ resend: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { resend: (...args: unknown[]) => resend(...args) } },
}));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
  useNavigate: () => () => {},
}));

import { AuthPage } from '@/components/weechat/auth';
import { DemoProvider } from '@/components/weechat/provider';

function renderLogin() {
  render(<DemoProvider><AuthPage mode="login" /></DemoProvider>);
  fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'jean@exemple.com' } });
}

describe('Resend confirmation email', () => {
  beforeEach(() => {
    resend.mockReset();
    resend.mockResolvedValue({ error: null });
  });

  it('locks the button with a visible countdown after the email is sent', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Renvoyer l’e-mail de confirmation' }));

    await waitFor(() => expect(resend).toHaveBeenCalledTimes(1));
    expect(resend).toHaveBeenCalledWith(expect.objectContaining({ email: 'jean@exemple.com' }));

    const button = screen.getByRole('button', { name: /Renvoyer/i });
    expect(button).toBeDisabled();
    const label = button.textContent ?? '';
    expect(label).toMatch(/^Renvoyer dans \d+ s$/);
    expect(Number(label.match(/\d+/)?.[0])).toBeLessThanOrEqual(30);
    expect(document.querySelector('.auth-resend-timer')).not.toBeNull();

    fireEvent.click(button);
    expect(resend).toHaveBeenCalledTimes(1);
  });

  it('keeps the button usable when no address is entered', () => {
    render(<DemoProvider><AuthPage mode="login" /></DemoProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Renvoyer l’e-mail de confirmation' }));

    expect(resend).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Renvoyer l’e-mail de confirmation' })).toBeEnabled();
  });
});
