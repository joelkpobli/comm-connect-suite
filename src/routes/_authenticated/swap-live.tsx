import { createFileRoute } from '@tanstack/react-router';
import { SwapLivePage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/swap-live')({ head: () => pageHead('Swap Live', 'Caméra, persona et sortie vidéo plein écran Weechat.'), component: SwapLivePage });
