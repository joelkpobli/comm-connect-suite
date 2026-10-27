import { createFileRoute } from '@tanstack/react-router';
import { CallStudio } from '@/components/weechat/call-studio';
import { LiveTranslator } from '@/components/weechat/live-translator';
import { UsageDemo } from '@/components/weechat/usage-demo';
import { useDemo } from '@/components/weechat/provider';
import { pageHead } from '@/lib/weechat/metadata';

function TranslationPage() {
  const { locale } = useDemo();
  return <div className="grid gap-8"><LiveTranslator /><UsageDemo service="audio" fr={locale === 'fr'} /><CallStudio /></div>;
}
export const Route = createFileRoute('/_authenticated/traduction')({ head: () => pageHead('Traduction en direct', 'Parlez votre langue, votre interlocuteur entend la sienne.'), component: TranslationPage });
