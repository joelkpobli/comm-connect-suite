import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhatsAppFloat } from '@/components/weechat/whatsapp-float';
import { DemoProvider } from '@/components/weechat/provider';

describe('Bouton flottant WhatsApp', () => {
  it('ouvre une conversation vers le numéro du propriétaire', () => {
    render(<DemoProvider><WhatsAppFloat /></DemoProvider>);
    const link = screen.getByRole('link', { name: /WhatsApp \+225 05 04 98 95 23/ });
    const href = link.getAttribute('href') ?? '';
    expect(href.startsWith('https://wa.me/2250504989523?text=')).toBe(true);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
