import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhatsAppFloat } from '@/components/weechat/whatsapp-float';
import { DemoProvider } from '@/components/weechat/provider';

describe('Bouton flottant WhatsApp', () => {
  it('ouvre une conversation vers le numéro du propriétaire', () => {
    render(<DemoProvider><WhatsAppFloat /></DemoProvider>);
    const link = screen.getByRole('link', { name: /WhatsApp \+229 01 57 68 59 35/ });
    const href = link.getAttribute('href') ?? '';
    expect(href.startsWith('https://wa.me/2290157685935?text=')).toBe(true);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
