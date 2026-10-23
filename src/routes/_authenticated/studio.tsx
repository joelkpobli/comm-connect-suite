import { createFileRoute } from '@tanstack/react-router';
import { CallStudio } from '@/components/weechat/call-studio';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/studio')({ head: () => pageHead('Studio d’appel', 'Choisissez votre voix et votre visage, puis échangez avec traduction dans les deux sens.'), component: CallStudio });
