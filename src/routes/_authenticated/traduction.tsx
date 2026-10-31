import { createFileRoute } from '@tanstack/react-router';
import { LiveTranslator } from '@/components/weechat/live-translator';
import { pageHead } from '@/lib/weechat/metadata';

function TranslationPage() {
  return <LiveTranslator />;
}
export const Route = createFileRoute('/_authenticated/traduction')({ head: () => pageHead('Traduction en direct', 'Parlez votre langue, votre interlocuteur entend la sienne.'), component: TranslationPage });
