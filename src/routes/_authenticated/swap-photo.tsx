import { createFileRoute } from '@tanstack/react-router';
import { SwapPhotoPage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/swap-photo')({ head: () => pageHead('Studio IA — Swap Photo', 'Changez un visage sur une photo, créez des images ou faites parler une photo avec vos jetons IA.'), component: SwapPhotoPage });
