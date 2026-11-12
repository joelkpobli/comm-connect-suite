import { createFileRoute } from '@tanstack/react-router';
import { FounderPage } from '@/components/weechat/founder';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/fondateur')({ head: () => pageHead('Espace Fondateur', 'Pilotage de la plateforme Weechat : ventes, utilisateurs, maintenance et fournisseurs IA.'), component: FounderPage });
