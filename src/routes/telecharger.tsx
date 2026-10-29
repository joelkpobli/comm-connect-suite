import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/lib/weechat/contact';

export const Route = createFileRoute('/telecharger')({
  head: () => ({
    meta: [
      { title: 'Tutoriel Weechat Swap Live · Windows' },
      { name: 'description', content: 'Utilisez Weechat dans WhatsApp, Zoom, Teams et Meet avec le moteur Weechat Swap Live et la traduction en direct.' },
      { property: 'og:title', content: 'Tutoriel Weechat Swap Live · Windows' },
      { property: 'og:description', content: 'Pas à pas pour envoyer votre image et votre voix Weechat dans vos applis d’appel.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: DownloadPage,
});

const apps: Record<string, string[]> = {
  WhatsApp: ['Ouvrez WhatsApp Desktop.', 'Réglages → Vidéo et voix : caméra « OBS Virtual Camera » (utilisée par le moteur Weechat), micro « CABLE Output ».', 'Déjà en appel ? Utilisez la flèche à côté du bouton caméra.'],
  Zoom: ['Paramètres → Vidéo : choisissez « OBS Virtual Camera ».', 'Paramètres → Audio : micro « CABLE Output ».', 'Décochez « Mettre en miroir ma vidéo » si besoin.'],
  Teams: ['Paramètres → Appareils.', 'Caméra « OBS Virtual Camera », micro « CABLE Output ».', 'Relancez Teams si les périphériques n’apparaissent pas.'],
  'TikTok Live Studio': ['Ajoutez une source « Caméra ».', 'Choisissez « OBS Virtual Camera ».', 'Micro : « CABLE Output » pour la voix traduite.'],
};

const fixes = [
  ['installer.bat affiche « Python introuvable »', 'Réinstallez Python 3.10 en cochant « Add Python to PATH », puis relancez installer.bat.'],
  ['Erreur pendant l’installation d’insightface', 'Installez « Microsoft C++ Build Tools » (option « Développement desktop en C++ »), redémarrez, relancez installer.bat.'],
  ['La caméra « OBS Virtual Camera » n’apparaît pas', 'Le moteur Weechat utilise ce pilote gratuit : installez OBS Studio une seule fois (inutile de l’ouvrir), puis relancez demarrer.bat.'],
  ['L’image est lente', 'Fermez les autres applis, éclairez votre visage de face, utilisez une photo cible nette et de face. Sans carte NVIDIA, 8 à 15 images/s est normal.'],
  ['Mon interlocuteur n’entend pas la voix traduite', 'Dans Traduction en direct, choisissez « CABLE Input » comme sortie audio, et « CABLE Output » comme micro dans l’appli.'],
  ['« Caméra déjà utilisée »', 'Le moteur utilise votre vraie webcam : dans l’appli d’appel, choisissez « OBS Virtual Camera », pas la webcam.'],
];

function DownloadPage() {
  const [app, setApp] = useState('WhatsApp');
  const [open, setOpen] = useState<number | null>(null);
  return <div className="dl">
    <section>
      <h1>Tutoriel Weechat<br /><span>Swap Live et traduction dans toutes vos applis.</span></h1>
      <p className="dl-lead">Le vrai changement de visage tourne sur votre PC Windows avec le moteur Weechat Swap Live (la même technologie que les logiciels de swap en direct : InsightFace + inswapper). Aucune image n’est envoyée sur Internet.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild><a href="/downloads/weechat-swap-engine.zip" download="weechat-swap-engine.zip">Télécharger le moteur Swap Live (ZIP)</a></Button>
        <Button asChild variant="outline"><a href="https://www.python.org/downloads/release/python-31011/" target="_blank" rel="noreferrer">Python 3.10</a></Button>
        <Button asChild variant="outline"><a href="https://obsproject.com/download" target="_blank" rel="noreferrer">Pilote caméra (OBS)</a></Button>
        <Button asChild variant="outline"><a href="https://vb-audio.com/Cable/" target="_blank" rel="noreferrer">VB-Cable (voix)</a></Button>
      </div>
      <p className="dl-note">Windows 10 ou 11 · Carte NVIDIA conseillée mais non obligatoire · Version d’essai, pas encore validée sur tous les PC.</p>
    </section>

    <section id="moteur">
      <h2>Swap Live : changer de visage en direct</h2>
      <div className="dl-steps">
        <div className="dl-card"><b>1</b><h3>Préparer le PC</h3><p>Installez Python 3.10 (cochez « Add Python to PATH »), Microsoft C++ Build Tools, et OBS Studio (seulement pour son pilote de caméra, inutile de l’ouvrir).</p></div>
        <div className="dl-card"><b>2</b><h3>Installer le moteur</h3><p>Décompressez le ZIP et double-cliquez sur installer.bat. Au premier lancement, le modèle IA (~530 Mo) se télécharge une seule fois.</p></div>
        <div className="dl-card"><b>3</b><h3>Choisir le visage</h3><p>Lancez demarrer.bat et glissez une photo nette, de face, dont vous avez les droits (par exemple depuis le <Link to="/avatars" className="underline">Catalogue d’avatars</Link>).</p></div>
        <div className="dl-card"><b>4</b><h3>Appeler</h3><p>La fenêtre d’aperçu montre votre nouveau visage. Dans WhatsApp, Zoom ou TikTok, choisissez la caméra « OBS Virtual Camera ».</p></div>
      </div>
    </section>

    <section id="guide">
      <h2>Traduction en direct : votre voix dans l’autre langue</h2>
      <div className="dl-steps">
        <div className="dl-card"><b>1</b><h3>Installer VB-Cable</h3><p>Clic droit sur l’installateur → « Exécuter en tant qu’administrateur », puis redémarrez.</p></div>
        <div className="dl-card"><b>2</b><h3>Ouvrir Weechat</h3><p>Allez dans <Link to="/traduction" className="underline">Traduction en direct</Link>, choisissez vos langues et la sortie audio « CABLE Input ».</p></div>
        <div className="dl-card"><b>3</b><h3>Dans l’appli d’appel</h3><p>Micro : « CABLE Output ». Votre interlocuteur entend la voix traduite.</p></div>
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
