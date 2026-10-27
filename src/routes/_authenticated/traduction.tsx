import { createFileRoute } from '@tanstack/react-router';
import { CallStudio } from '@/components/weechat/call-studio';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/traduction')({ head: () => pageHead('Traduction en direct', 'Parlez votre langue, votre interlocuteur entend la sienne.'), component: CallStudio });
