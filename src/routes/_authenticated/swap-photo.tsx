import { createFileRoute } from '@tanstack/react-router';
import { SwapPhotoPage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/swap-photo')({ head: () => pageHead('Studio IA — Transformation et Swap Photo', 'Weechat : transformez une vidéo de 15 secondes maximum avec vos points, ou créez des images et photos parlantes avec vos jetons IA.'), component: SwapPhotoPage });
