import { createFileRoute } from '@tanstack/react-router';
import { AvatarsPage } from '@/components/weechat/modules';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/avatars')({ head: () => pageHead('Bibliothèque d’avatars et de décors', 'Avatars et arrière-plans photographiques réels, gratuits, avec aperçu et cadrage enregistré.'), component: AvatarsPage });
