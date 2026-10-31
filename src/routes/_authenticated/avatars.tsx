import { createFileRoute } from '@tanstack/react-router';
import { AvatarsPage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/avatars')({ head: () => pageHead('Catalogue d’avatars', 'Photos de visages et personnes pour les usages autorisés et consentis dans Weechat.'), component: AvatarsPage });
