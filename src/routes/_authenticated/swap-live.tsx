import { createFileRoute } from '@tanstack/react-router';
import { SwapLivePage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/swap-live')({ head: () => pageHead('Swap Live', 'Swap Live Weechat : votre avatar en direct dans WhatsApp, Zoom, Teams et TikTok Live grâce à Weechat Camera.'), component: SwapLivePage });
