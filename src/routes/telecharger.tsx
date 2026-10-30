import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/lib/weechat/contact';

const Tag = ({ children }: { children: string }) => <span className="dl-tag">{children}</span>;

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
  WhatsApp: ['Ouvrez WhatsApp Desktop.', 'Réglages → Vidéo et voix.', 'Caméra : Unity Video Capture.', 'Micro (voix traduite) : CABLE Output.', 'Déjà en appel ? Flèche à côté du bouton caméra.'],
  Zoom: ['Paramètres → Vidéo.', 'Caméra : Unity Video Capture.', 'Paramètres → Audio : micro CABLE Output.', 'Décochez « Mettre en miroir ma vidéo » si besoin.'],
  Teams: ['Paramètres → Appareils.', 'Caméra : Unity Video Capture.', 'Micro : CABLE Output.', 'Relancez Teams si les périphériques n’apparaissent pas.'],
  'TikTok Live Studio': ['Ajoutez une source « Caméra ».', 'Source : Unity Video Capture.', 'Micro : CABLE Output (voix traduite).'],
};

const flow = [
  ['Télécharger', 'Un clic sur le bouton bleu. Fichier : Weechat-Setup.exe (environ 900 Mo).'],
  ['Installer', 'Double-clic sur le .exe → Suivant → Installer. Moteur IA + caméra virtuelle inclus.'],
  ['Appeler', 'Dans votre appli d’appel, caméra : Unity Video Capture.'],
];

const fixes = [
  ['Windows affiche « Windows a protégé votre ordinateur »', 'Cliquez sur « Informations complémentaires » puis « Exécuter quand même ». L’installateur n’est pas encore signé numériquement.'],
  ['La caméra « Unity Video Capture » n’apparaît pas', 'Fermez complètement l’appli d’appel, lancez Weechat, puis rouvrez l’appli. Si besoin, redémarrez le PC après l’installation.'],
  ['L’image est lente', 'Fermez les autres applis, éclairez votre visage de face, utilisez une photo cible nette et de face. Sans carte NVIDIA, 8 à 15 images/s est normal.'],
  ['« Aucun visage détecté »', 'Choisissez une photo où le visage est net, de face, bien éclairé et sans masque.'],
  ['Mon interlocuteur n’entend pas la voix traduite', 'Installez VB-Cable, choisissez « CABLE Input » comme sortie dans Traduction en direct, et « CABLE Output » comme micro dans l’appli.'],
  ['« Caméra déjà utilisée »', 'Dans l’appli d’appel, choisissez « Unity Video Capture », pas votre vraie webcam (Weechat l’utilise déjà).'],
];

function DownloadPage() {
  const [app, setApp] = useState('WhatsApp');
  const [open, setOpen] = useState<number | null>(null);
  return <div className="dl">
    <section>
      <h1>Tutoriel Weechat<br /><span>Swap Live et traduction dans toutes vos applis.</span></h1>
      <p className="dl-lead">Le vrai changement de visage tourne sur votre PC Windows avec le moteur Weechat Swap Live (la même technologie que les logiciels de swap en direct : InsightFace + inswapper). Aucune image n’est envoyée sur Internet.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild><a href="https://github.com/joelkpobli/comm-connect-suite/releases/latest/download/Weechat-Setup.exe">⬇ Télécharger Weechat pour Windows (.exe)</a></Button>
        <Button asChild variant="outline"><a href="https://vb-audio.com/Cable/" target="_blank" rel="noreferrer">VB-Cable (voix traduite, gratuit)</a></Button>
      </div>
      <p className="dl-note">Windows 10 ou 11 · Aucun Python, aucun OBS à installer · Carte NVIDIA conseillée mais non obligatoire · Version d’essai.</p>
      <div className="dl-flow">
        {flow.map(([t, d], i) => <div key={t} className="dl-flowstep"><Tag>{`Étape ${i + 1}`}</Tag><h3>{t}</h3><p>{d}</p></div>)}
      </div>
    </section>

    <section id="moteur">
      <h2>Swap Live : changer de visage en direct</h2>
      <div className="dl-steps">
        <div className="dl-card"><Tag>Installation</Tag><h3>1 · Installer Weechat</h3><p>Double-cliquez sur <span className="dl-kbd">Weechat-Setup.exe</span> → Suivant → Installer. Le moteur IA et la caméra virtuelle sont inclus.</p></div>
        <div className="dl-card"><Tag>Réglage</Tag><h3>2 · Choisir le visage</h3><p>Ouvrez Weechat, choisissez une photo nette, de face, dont vous avez les droits (par exemple depuis le <Link to="/avatars" className="underline">Catalogue d’avatars</Link>).</p></div>
        <div className="dl-card"><Tag>Réglage</Tag><h3>3 · Démarrer</h3><p>Cliquez sur Démarrer : l’aperçu montre votre nouveau visage qui suit vos mouvements, votre bouche et vos yeux.</p></div>
        <div className="dl-card"><Tag>Dans l’appli d’appel</Tag><h3>4 · Appeler</h3><p>Dans WhatsApp, Zoom, Teams ou TikTok, caméra : <span className="dl-kbd">Unity Video Capture</span>.</p></div>
      </div>
    </section>

    <section id="guide">
      <h2>Traduction en direct : votre voix dans l’autre langue</h2>
      <div className="dl-steps">
        <div className="dl-card"><Tag>Installation</Tag><h3>1 · Installer VB-Cable</h3><p>Clic droit sur l’installateur → « Exécuter en tant qu’administrateur », puis redémarrez.</p></div>
        <div className="dl-card"><Tag>Réglage</Tag><h3>2 · Ouvrir Weechat</h3><p>Allez dans <Link to="/traduction" className="underline">Traduction en direct</Link>, choisissez vos langues et la sortie audio <span className="dl-kbd">CABLE Input</span>.</p></div>
        <div className="dl-card"><Tag>Dans l’appli d’appel</Tag><h3>3 · Appeler</h3><p>Micro : <span className="dl-kbd">CABLE Output</span>. Votre interlocuteur entend la voix traduite.</p></div>
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
