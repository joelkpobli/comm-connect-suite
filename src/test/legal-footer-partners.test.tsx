import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
}));

import { LegalFooter } from '@/components/weechat/legal-footer';
import { DemoProvider } from '@/components/weechat/provider';

// The three affiliate links are business facts supplied by the owner: the footer must
// point at those exact URLs so commissions are actually credited to Weechat.
describe('Liens partenaires du pied de page', () => {
  it('emploie les liens de parrainage fournis par le propriétaire', () => {
    render(<DemoProvider><LegalFooter /></DemoProvider>);
    expect(screen.getByRole('link', { name: /Grey/ })).toHaveAttribute(
      'href',
      'https://greyapp.page.link/jixhVD5wH6mdykEY7',
    );
    expect(screen.getByRole('link', { name: /Wise/ })).toHaveAttribute(
      'href',
      'https://wise.com/invite/ahpc/joelk1130',
    );
    expect(screen.getByRole('link', { name: /Volet/ })).toHaveAttribute(
      'href',
      'https://volet.onelink.me/jJs2?pid=User_invite&deep_link_value=G3KwBb8R',
    );
  });
  it('ne montre plus Payoneer ni Advcash en doublon', () => {
    render(<DemoProvider><LegalFooter /></DemoProvider>);
    expect(screen.queryByRole('link', { name: /Payoneer/ })).toBeNull();
    expect(screen.getAllByRole('link', { name: /Advcash/ })).toHaveLength(1);
  });
});
