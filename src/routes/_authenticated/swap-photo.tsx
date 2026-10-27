import { createFileRoute } from '@tanstack/react-router';
import { SwapPhotoPage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/swap-photo')({ head: () => pageHead('Swap Photo', 'Module photo Weechat, visage autorisé, personnage et décor.'), component: SwapPhotoPage });
