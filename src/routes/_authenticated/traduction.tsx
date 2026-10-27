import { createFileRoute } from '@tanstack/react-router';
import { CallStudio } from '@/components/weechat/call-studio';
import { LiveTranslator } from '@/components/weechat/live-translator';
import { pageHead } from '@/lib/weechat/metadata';

function TranslationPage() {
  return <div className="grid gap-8"><LiveTranslator /><CallStudio /></div>;
}
export const Route = createFileRoute('/_authenticated/traduction')({ head: () => pageHead('Traduction en direct', 'Parlez votre langue, votre interlocuteur entend la sienne.'), component: TranslationPage });
