import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/lib/weechat/contact';

export const Route = createFileRoute('/telecharger')({
  head: () => ({
    meta: [
      { title: 'Guide d’installation Windows · Weechat' },
      { name: 'description', content: 'Utilisez Weechat dans WhatsApp, Zoom, Teams et Meet avec OBS Virtual Camera et VB-Cable, gratuitement.' },
      { property: 'og:title', content: 'Guide d’installation Windows · Weechat' },
      { property: 'og:description', content: 'Pas à pas pour envoyer votre image et votre voix Weechat dans vos applis d’appel.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: DownloadPage,
});

const apps: Record<string, string[]> = {
  WhatsApp: ['Ouvrez WhatsApp Desktop.', 'Réglages → Vidéo et voix : caméra « OBS Virtual Camera », micro « CABLE Output ».', 'Déjà en appel ? Utilisez la flèche à côté du bouton caméra.'],
  Zoom: ['Paramètres → Vidéo : choisissez « OBS Virtual Camera ».', 'Paramètres → Audio : micro « CABLE Output ».', 'Décochez « Mettre en miroir ma vidéo » si le texte apparaît inversé.'],
  Teams: ['Paramètres → Appareils.', 'Caméra « OBS Virtual Camera », micro « CABLE Output ».', 'Relancez Teams si les périphériques n’apparaissent pas.'],
  'Google Meet': ['Dans Meet, cliquez sur ⋮ → Paramètres.', 'Vidéo : « OBS Virtual Camera » ; Audio : « CABLE Output ».', 'Autorisez la caméra et le micro dans le navigateur.'],
};

const fixes = [
  ['« OBS Virtual Camera » n’apparaît pas', 'Dans OBS, cliquez sur « Démarrer la caméra virtuelle », puis rouvrez votre appli d’appel.'],
  ['Mon interlocuteur voit un écran noir', 'Utilisez « Capture de fenêtre » sur le navigateur et désactivez l’accélération matérielle du navigateur si besoin.'],
  ['Mon interlocuteur n’entend pas la voix traduite', 'Dans le Studio Weechat, choisissez « CABLE Input » comme sortie audio, et « CABLE Output » comme micro dans l’appli.'],
  ['« Caméra déjà utilisée »', 'Weechat utilise votre vraie webcam : dans l’appli d’appel, choisissez « OBS Virtual Camera » et non la webcam.'],
];

function DownloadPage() {
  const [app, setApp] = useState('WhatsApp');
  const [open, setOpen] = useState<number | null>(null);
  return <div className="dl">
    <section>
      <h1>Weechat dans WhatsApp, Zoom et Teams.<br /><span>Gratuit, sous Windows.</span></h1>
      <p className="dl-lead">L’application Windows Weechat est en préparation. En attendant, deux outils gratuits envoient votre image et votre voix Weechat vers vos applis d’appel.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild><a href="https://obsproject.com/download" target="_blank" rel="noreferrer">Télécharger OBS Studio</a></Button>
        <Button asChild variant="outline"><a href="https://vb-audio.com/Cable/" target="_blank" rel="noreferrer">Télécharger VB-Cable</a></Button>
      </div>
      <p className="dl-note">Windows 10 ou 11 · Outils tiers gratuits, non édités par Weechat.</p>
    </section>

    <section id="moteur">
      <h2>Moteur Swap Live (version d’essai)</h2>
      <p className="dl-lead">Vrai changement de visage par IA, calculé sur votre PC, sans carte NVIDIA obligatoire. Version d’essai à valider : installez Python 3.10, puis lancez installer.bat et demarrer.bat.</p>
      <div className="mt-6"><Button asChild><a href="/downloads/weechat-swap-engine.zip" download="weechat-swap-engine.zip">Télécharger le moteur (ZIP)</a></Button></div>
    </section>

    <section id="guide">
      <h2>Après le téléchargement</h2>
      <div className="dl-steps">
        <div className="dl-card"><b>1</b><h3>Installer</h3><p>Installez OBS, puis VB-Cable (clic droit → « Exécuter en tant qu’administrateur »), et redémarrez.</p></div>
        <div className="dl-card"><b>2</b><h3>Préparer le Studio</h3><p>Ouvrez le <Link to="/traduction" className="underline">Traduction en direct</Link>, sortie audio « CABLE Input », puis le mode plein écran.</p></div>
        <div className="dl-card"><b>3</b><h3>Démarrer OBS</h3><p>Ajoutez une « Capture de fenêtre » du navigateur, puis « Démarrer la caméra virtuelle ».</p></div>
      </div>
    </section>

    <section>
      <h2>Choisissez les bons périphériques dans votre appli</h2>
      <div className="dl-tabs" role="tablist">{Object.keys(apps).map(a => <Button key={a} role="tab" aria-selected={a === app} variant={a === app ? 'default' : 'outline'} size="sm" onClick={() => setApp(a)}>{a}</Button>)}</div>
      <ol className="dl-card list-decimal space-y-2 pl-10">{apps[app]!.map(s => <li key={s}>{s}</li>)}</ol>
    </section>

    <section>
      <h2>Corrections rapides</h2>
      <div className="grid gap-3">{fixes.map(([q, a], i) => <div key={q} className="dl-card"><button type="button" className="w-full text-left font-semibold" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}</button>{open === i && <p className="mt-2">{a}</p>}</div>)}</div>
    </section>

    <p className="dl-warn">Sur mobile et macOS, l’envoi vers les applis d’appel n’est pas encore pris en charge. Besoin d’aide ? <a className="underline" href={whatsappLink('fr')} target="_blank" rel="noreferrer">WhatsApp {WHATSAPP_DISPLAY}</a></p>
  </div>;
}
