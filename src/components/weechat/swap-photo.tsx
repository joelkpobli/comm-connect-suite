import { Link } from '@tanstack/react-router';
import { Image, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';

export function SwapPhotoPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title="Swap Photo" subtitle={fr ? 'Remplacer un visage dans une photo fixe, sans appel ni vidéo en direct.' : 'Replace a face in a still photo, without a call or live video.'} />
    <section className="grid gap-4 border-y border-border py-6"><Image className="text-primary" size={32} /><h2 className="text-xl font-semibold">{fr ? 'Indisponible : moteur de transformation non connecté' : 'Unavailable: transformation engine not connected'}</h2>
      <p className="text-muted-foreground">{fr ? 'La fonction nécessite une photo à transformer, un visage autorisé et un moteur IA qui produit une nouvelle image. Aujourd’hui, aucun moteur ne génère ce résultat dans Weechat.' : 'This feature needs an original photo, an authorised face and an AI engine that creates a new image. Currently no engine produces this result in Weechat.'}</p>
      <p className="text-sm">{fr ? 'Aucune photo demandée, aucune image fabriquée, aucun point débité. Le tarif présenté de 2 points/photo ne sera applicable qu’après une intégration validée.' : 'No photo requested, no fabricated image, no points charged. The displayed 2 points/photo rate will only apply after a validated integration.'}</p>
      <Button asChild variant="outline" className="justify-self-start"><Link to="/telecharger" hash="photo"><BookOpen />{fr ? 'Comprendre Swap Photo' : 'Understand Swap Photo'}</Link></Button>
    </section></>;
}
