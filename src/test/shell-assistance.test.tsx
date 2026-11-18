import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The shell is the single place every account screen is wrapped, so this test is the
// proof that the assistance card really appears there (and not in the founder console).
const { state } = vi.hoisted(() => ({ state: { path: '/tableau-de-bord' } }));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
  useNavigate: () => () => {},
  useRouterState: (opts: { select: (s: unknown) => string }) => opts.select({ location: { pathname: state.path } }),
}));

vi.mock('@tanstack/react-start', () => {
  const chain = (): unknown => new Proxy((() => {}) as () => unknown, {
    get: (_t, k) => (k === 'then' ? undefined : chain()),
    apply: () => chain(),
  });
  return {
    createServerFn: () => chain(),
    createMiddleware: () => chain(),
    useServerFn: () => async () => ({}),
  };
});

vi.mock('@/integrations/supabase/client', () => {
  const table = () => new Proxy({ data: [] as unknown[] }, {
    get: (t, k) => (k === 'data' ? t.data : table()),
  });
  return {
    supabase: {
      auth: {
        getSession: async () => ({ data: { session: { user: { email: 'joel@exemple.com', user_metadata: { display_name: 'Joël Kpobli' } } } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({}),
      },
      from: () => table(),
    },
  };
});

vi.mock('@/lib/weechat/founder.functions', () => ({ amIFounder: async () => false }));
vi.mock('@/lib/weechat/profile.functions', () => ({
  getProfile: async () => ({ display_name: 'Joël Kpobli', ui_locale: 'fr' }),
  updateProfile: async () => ({}),
}));
vi.mock('@/lib/weechat/credits-query', () => ({
  creditsQuery: { queryKey: ['credits'], queryFn: async () => ({ totals: { balance: 100 } }) },
  audioQuery: { queryKey: ['audio'], queryFn: async () => 60 },
  aiTokensQuery: { queryKey: ['ai'], queryFn: async () => 10 },
  validityQuery: { queryKey: ['validity'], queryFn: async () => null },
  fmtExpiry: () => '—',
}));
vi.mock('@/components/weechat/home', () => ({ PlanCard: () => null }));

import { AppShell } from '@/components/weechat/shell';
import { DemoProvider } from '@/components/weechat/provider';

function renderShell() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <DemoProvider><AppShell><div>Contenu de l’écran</div></AppShell></DemoProvider>
    </QueryClientProvider>,
  );
}

describe('Carte d’assistance dans le shell des écrans du compte', () => {
  beforeEach(() => { localStorage.clear(); state.path = '/tableau-de-bord'; });

  it('s’affiche sur un écran du compte avec le numéro du propriétaire', async () => {
    renderShell();
    expect(await screen.findByText('+225 05 04 98 95 23')).toBeInTheDocument();
    const href = screen.getByRole('link', { name: /Écrire sur WhatsApp/ }).getAttribute('href') ?? '';
    expect(href.startsWith('https://wa.me/2250504989523?text=')).toBe(true);
  });

  it('reste absente de la console du fondateur', async () => {
    state.path = '/fondateur';
    renderShell();
    await screen.findByText('Contenu de l’écran');
    expect(screen.queryByText('+225 05 04 98 95 23')).not.toBeInTheDocument();
  });
});
