import { createFileRoute } from '@tanstack/react-router';
import { SwapPhotoPage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/swap-photo')({ head: () => pageHead('Swap Photo', 'Remplacement de visage dans une photo : moteur non connecté et fonction indisponible.'), component: SwapPhotoPage });
