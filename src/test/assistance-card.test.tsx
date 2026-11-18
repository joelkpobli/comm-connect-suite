import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { AssistanceCard } from '@/components/weechat/assistance-card';
import { DemoProvider } from '@/components/weechat/provider';

describe('Carte d’assistance des écrans du compte', () => {
  beforeEach(() => { localStorage.clear(); });

  it('affiche le numéro du propriétaire et un lien WhatsApp en français', () => {
    render(<DemoProvider><AssistanceCard /></DemoProvider>);
    expect(screen.getByText('+225 05 04 98 95 23')).toBeInTheDocument();
    expect(screen.getByText('Besoin d’aide ?')).toBeInTheDocument();
    const href = screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href') ?? '';
    expect(href.startsWith('https://wa.me/2250504989523?text=')).toBe(true);
  });

  it('affiche la même carte en anglais', () => {
    localStorage.setItem('weechat-ui-locale', 'en');
    render(<DemoProvider><AssistanceCard /></DemoProvider>);
    expect(screen.getByText('Need help?')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp number')).toBeInTheDocument();
    expect(screen.getByText('+225 05 04 98 95 23')).toBeInTheDocument();
    const href = screen.getByRole('link', { name: /Message on WhatsApp/ }).getAttribute('href') ?? '';
    expect(href.startsWith('https://wa.me/2250504989523?text=')).toBe(true);
  });
});
