import { createFileRoute } from '@tanstack/react-router';
import { RestyleLivePage } from '@/components/weechat/restyle-live';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/restyle-live')({
  head: () => pageHead('Restyle Live', 'Effets vidéo locaux Weechat avec consentement caméra. Restylisation IA non connectée.'),
  component: RestyleLivePage,
});