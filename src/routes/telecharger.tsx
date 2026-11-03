import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Download, BookOpen, Video, Languages, Sparkles, Image, Coins, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/components/weechat/provider';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/lib/weechat/contact';
import { pageHead } from '@/lib/weechat/metadata';
import { featureCards, usagePolicy } from '@/lib/weechat/feature-status';

export const Route = createFileRoute('/telecharger')({
  head: () => pageHead('Tutoriels et téléchargement', 'Guides Weechat par fonction : Swap Live Windows, traduction vocale, filtres Restyle, Swap Photo et points. Prérequis et limites réelles.'),
  component: DownloadPage,
});
const K = ({ children }: { children: string }) => <span className="dl-kbd">{children}</span>;
const apps = ['WhatsApp', 'Zoom', 'Teams', 'TikTok Live Studio'] as const;
const checks = (fr: boolean) => fr ? [
  ['Installation terminée ?', 'Vérifiez que l’installateur s’est terminé sans erreur. Cette page ne détecte pas l’installation sur votre PC.'],
  ['Application d’appel relancée ?', 'Fermez complètement WhatsApp, Zoom, Teams ou TikTok Live Studio, puis rouvrez-le pour actualiser les périphériques.'],
  ['PC redémarré ?', 'Redémarrez après l’installation si la caméra n’est pas proposée. Ce n’est pas une garantie : un pilote absent ou mal enregistré reste possible.'],
  ['Caméra absente ou image noire ?', 'Absente : vérifiez l’installation du pilote. Présente mais noire : démarrez le moteur Weechat et vérifiez son aperçu. L’ouverture de Weechat ne prouve pas que le pilote est installé.'],
  ['Toujours absente ?', 'Conservez le message de l’installateur et une capture de la liste des caméras. Réinstallez uniquement depuis le téléchargement officiel si nécessaire. Ne désactivez pas les protections Windows.'],
] : [
  ['Setup completed?', 'Check that setup finished without errors. This page does not detect installation on your PC.'],
  ['Calling app reopened?', 'Fully close WhatsApp, Zoom, Teams or TikTok Live Studio and reopen it to refresh devices.'],
  ['PC restarted?', 'Restart after setup if the camera is missing. This is not a guarantee: the driver may be absent or incorrectly registered.'],
  ['Missing camera or black image?', 'Missing: check driver installation. Present but black: start the Weechat engine and check its preview. Opening Weechat does not prove the driver is installed.'],
  ['Still missing?', 'Keep the installer message and a screenshot of the camera list. Reinstall only from the official download if needed. Do not disable Windows protections.'],
];
function DownloadPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const [app, setApp] = useState<typeof apps[number]>('WhatsApp'); const [open, setOpen] = useState<number | null>(null);
  const cards = featureCards(fr); const icons = { swap: Video, translation: Languages, restyle: Sparkles, photo: Image };
  const fix = checks(fr);
  const menu = app === 'Zoom' ? 'Paramètres → Vidéo / Audio' : app === 'Teams' ? 'Paramètres → Appareils' : app === 'TikTok Live Studio' ? (fr ? 'Sources → Caméra / Microphone' : 'Sources → Camera / Microphone') : (fr ? 'Réglages → Vidéo et voix (selon version)' : 'Settings → Video and voice (version dependent)');
  return <div className="dl">
    <header className="dl-hero">
      <div>
        <span className="dl-tag">Weechat · Windows 10/11</span>
        <h1 className="mt-4">{fr ? <>Changez de visage sur WhatsApp, Zoom et Teams. <span>Sans OBS.</span></> : <>Swap your face on WhatsApp, Zoom and Teams. <span>No OBS.</span></>}</h1>
        <p className="dl-lead">{fr ? 'Installez Weechat, choisissez une photo autorisée, puis sélectionnez la caméra « Unity Video Capture » dans votre appli d’appel.' : 'Install Weechat, choose an authorised photo, then select the “Unity Video Capture” camera in your calling app.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" asChild><a href="https://github.com/joelkpobli/comm-connect-suite/releases/latest/download/Weechat-Setup.exe" target="_blank" rel="noreferrer"><Download />{fr ? 'Télécharger pour Windows' : 'Download for Windows'}</a></Button>
          <Button size="lg" variant="outline" asChild><a href="https://github.com/joelkpobli/comm-connect-suite/releases" target="_blank" rel="noreferrer">{fr ? 'Page des versions' : 'Releases page'}</a></Button>
        </div>
        <p className="dl-meta">{fr ? 'Version d’essai · 64 bits · ~151 Mo · Application gratuite · Licence Weechat Camera prévue : 10 000 FCFA, une seule fois (paiement pas encore actif)' : 'Trial version · 64-bit · ~151 MB · Free app · Planned Weechat Camera licence: 10,000 FCFA, one time (payment not active yet)'}</p>
      </div>
      <div className="dl-mock" aria-hidden="true">
        <div className="dl-mock-bar"><i /><i /><i /><span>{fr ? 'Paramètres vidéo' : 'Video settings'}</span></div>
        <div className="dl-mock-body">
          <p>{fr ? 'Caméra' : 'Camera'}</p>
          <div className="dl-mock-opt">HP HD Camera</div>
          <div className="dl-mock-opt on">Unity Video Capture <Check size={16} /></div>
          <p className="mt-4">{fr ? 'Micro' : 'Microphone'}</p>
          <div className="dl-mock-opt">CABLE Output (VB-Audio)</div>
        </div>
      </div>
    </header>
    <section className="dl-quick" aria-label={fr ? 'Installation en 3 étapes' : '3-step setup'}>{(fr ? [
      ['Installer', 'Lancez Weechat-Setup.exe. Si Windows affiche un écran bleu SmartScreen, vérifiez la provenance officielle.'],
      ['Démarrer le moteur', 'Ouvrez Weechat, choisissez une photo, la bonne webcam, puis « Démarrer ».'],
      ['Choisir la caméra', 'Dans WhatsApp, Zoom ou Teams, sélectionnez « Unity Video Capture ».'],
    ] : [
      ['Install', 'Run Weechat-Setup.exe. If Windows shows a blue SmartScreen screen, check the official source.'],
      ['Start the engine', 'Open Weechat, pick a photo and the right webcam, then “Start”.'],
      ['Pick the camera', 'In WhatsApp, Zoom or Teams, select “Unity Video Capture”.'],
    ]).map(([t, d], i) => <article key={t} className="dl-card"><span className="dl-num">{i + 1}</span><h3>{t}</h3><p>{d}</p></article>)}</section>
    <nav className="flex flex-wrap gap-2" aria-label={fr ? 'Sommaire des guides' : 'Guide contents'}>{cards.map(c => <Button asChild key={c.id} variant="outline"><a href={`#${c.id}`}>{c.title}</a></Button>)}<Button asChild variant="outline"><a href="#points"><Coins />{fr ? 'Points et minutes' : 'Points and minutes'}</a></Button><Button asChild variant="outline"><a href="#depannage">{fr ? 'Dépannage' : 'Troubleshooting'}</a></Button></nav>
    <section aria-label={fr ? 'État des fonctions' : 'Feature status'} className="grid gap-3 sm:grid-cols-2">{cards.map(c => { const Icon = icons[c.id]; return <article key={c.id} className="dl-card"><Icon className="text-primary" size={24} /><h3>{c.title}</h3><p>{c.status}</p><a href={`#${c.id}`} className="mt-3 inline-flex items-center gap-2 text-sm text-primary"><BookOpen size={16} />{fr ? 'Lire le guide' : 'Read guide'}</a></article>; })}</section>
    <section id="swap"><h2>01 · Swap Live</h2><p className="dl-lead">{fr ? 'Remplace un visage dans le flux de la webcam. Votre corps, vos vêtements et votre environnement restent ceux de la webcam : ce moteur ne crée pas une nouvelle personne de la tête aux pieds.' : 'Replaces a webcam face. Your body, clothes and surroundings remain from the webcam: this engine does not create a new full-body person.'}</p>
      <p className="dl-note">{fr ? 'Outils : moteur Windows InsightFace / ONNX Runtime, webcam, photo autorisée et pilote Unity Capture. Performances sur votre PC et droits commerciaux des modèles restent à vérifier.' : 'Tools: Windows InsightFace / ONNX Runtime engine, webcam, authorised photo and Unity Capture driver. Your PC performance and commercial model rights still require verification.'}</p>
      <div className="mt-5"><Button asChild><a href="https://github.com/joelkpobli/comm-connect-suite/releases/latest/download/Weechat-Setup.exe" target="_blank" rel="noreferrer"><Download />{fr ? 'Télécharger Weechat pour Windows (.exe)' : 'Download Weechat for Windows (.exe)'}</a></Button></div>
      <p className="dl-note">{fr ? 'Installateur d’essai Windows 10/11 64 bits. Python et OBS ne sont pas des étapes d’installation utilisateur. Le lien de téléchargement n’atteste pas une installation réussie.' : 'Windows 10/11 64-bit trial installer. Python and OBS are not user installation steps. The download link does not prove successful installation.'}</p>
      <div className="dl-flow">{(fr ? [
        ['Télécharger', 'Enregistrez Weechat-Setup.exe. Attendez la fin du téléchargement.'],
        ['Installer', 'Ouvrez le fichier officiel et suivez l’installateur. Vérifiez les éventuelles erreurs.'],
        ['Démarrer le moteur', 'Dans Weechat Windows, choisissez une photo autorisée puis démarrez. Vérifiez le résultat dans l’aperçu.'],
        ['Sélectionner la caméra', 'Dans votre appli d’appel, choisissez Unity Video Capture. Testez avec une personne consentante.'],
      ] : [
        ['Download', 'Save Weechat-Setup.exe. Wait for the download to finish.'],
        ['Install', 'Open the official file and follow setup. Check any error messages.'],
        ['Start the engine', 'In Weechat Windows, choose an authorised photo and start. Check the result in the preview.'],
        ['Select the camera', 'In your calling app, choose Unity Video Capture. Test with a consenting participant.'],
      ]).map(([t,d],i) => <article className="dl-flowstep" key={t}><span className="dl-tag">{fr ? 'Étape' : 'Step'} {i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      <p className="dl-warn mt-5">{fr ? 'Important : cet essai Windows n’est pas connecté à votre compte et ne débite pas de points. La caméra virtuelle et les appels externes doivent encore être validés sur Windows. Ce n’est pas une version commerciale prête.' : 'Important: this Windows trial is not linked to your account and charges no points. Virtual camera and external calls still require Windows validation. This is not a commercially ready release.'}</p>
    </section>
    <section id="translation"><span id="guide" /><h2>02 · {fr ? 'Traduction en direct' : 'Live translation'}</h2><p className="dl-lead">{fr ? 'Vous parlez dans le micro ; Palabra renvoie la voix traduite et des sous-titres. Le service est intégré au site avec 48 langues configurées. Cela ne signifie pas que toutes les paires ont été testées en appel réel.' : 'Speak into your microphone; Palabra returns translated speech and subtitles. The service is integrated into the website with 48 configured languages. This does not mean all pairs have been tested in real calls.'}</p>
      <p className="dl-note">{fr ? 'Outils : compte Weechat, solde audio suffisant, service Palabra configuré, Internet, micro, casque et navigateur permettant de choisir la sortie audio. VB-Cable est nécessaire pour tester l’envoi vers une autre appli sous Windows.' : 'Tools: Weechat account, sufficient audio balance, configured Palabra service, Internet, microphone, headphones and a browser supporting audio output selection. VB-Cable is needed to test output to another Windows app.'}</p>
      <div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link to="/traduction"><Languages />{fr ? 'Ouvrir la traduction' : 'Open translation'}</Link></Button><Button asChild variant="outline"><a href="https://vb-audio.com/Cable/" target="_blank" rel="noreferrer">VB-Cable · {fr ? 'Site officiel' : 'Official website'}</a></Button></div>
      <div className="dl-flow">{(fr ? [
        ['Choisir les langues', 'Dans Traduction en direct : « Je parle » puis « L’autre entend ». Commencez par français → anglais.'],
        ['Choisir la sortie', 'Pour écouter : sortie habituelle et casque. Pour l’appel Windows : CABLE Input comme sortie Weechat.'],
        ['Autoriser et démarrer', 'Acceptez l’envoi de la voix à Palabra et autorisez le micro. Parlez, vérifiez les sous-titres et le son.'],
        ['Régler l’appel et arrêter', 'Micro de l’appli : CABLE Output. Faites un essai court, puis arrêtez la traduction.'],
      ] : [
        ['Choose languages', 'In Live translation: “I speak” and “They hear”. Start with French → English.'],
        ['Choose output', 'For listening: normal output and headphones. For Windows calls: CABLE Input as Weechat output.'],
        ['Consent and start', 'Consent to sending speech to Palabra and allow the microphone. Speak, check subtitles and sound.'],
        ['Configure call and stop', 'Calling app microphone: CABLE Output. Make a short test, then stop translation.'],
      ]).map(([t,d],i) => <article key={t} className="dl-flowstep"><span className="dl-tag">{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      <p className="dl-warn mt-5">{fr ? 'Appels audio ou vidéo : le principe de sortie est le même, mais le routage réel reste à valider. Une session traduit votre micro vers une langue. Elle ne capture pas automatiquement la voix de l’interlocuteur ; la traduction bidirectionnelle d’un appel n’est pas encore validée. Les sous-titres sont visibles dans Weechat, pas automatiquement dans l’appli d’appel.' : 'Audio and video calls use the same output principle, but real routing remains to be validated. One session translates your microphone to one language. It does not automatically capture your contact’s voice; two-way call translation is not yet validated. Subtitles appear in Weechat, not automatically inside the calling app.'}</p>
      <p className="dl-note">{fr ? 'Le son est envoyé à Palabra avec votre consentement. Weechat n’enregistre pas le flux ; les conditions du fournisseur s’appliquent. Les sorties non compatibles ou absentes empêchent l’envoi vers l’appel.' : 'Audio is sent to Palabra with your consent. Weechat does not record the stream; provider terms apply. Unsupported or missing outputs prevent routing to the call.'}</p>
    </section>
    <section id="restyle"><h2>03 · Restyle Live</h2><p className="dl-lead">{fr ? 'Restyle signifie changer le style visuel d’une vidéo. Aujourd’hui, Weechat propose seulement des filtres webcam locaux : noir et blanc, couleurs vives et contraste.' : 'Restyle means changing a video’s visual style. Currently Weechat only offers local webcam filters: monochrome, vivid colours and contrast.'}</p>
      <div className="dl-steps mt-5"><article className="dl-card"><span className="dl-tag">{fr ? 'Disponible sans points' : 'Available without points'}</span><h3>{fr ? 'Utiliser les filtres locaux' : 'Use local filters'}</h3><ol className="list-decimal space-y-2 pl-5"><li>{fr ? 'Ouvrez Restyle Live, acceptez la caméra et activez-la.' : 'Open Restyle Live, consent to camera use and enable it.'}</li><li>{fr ? 'Choisissez un style puis ajustez intensité et contraste.' : 'Pick a style, then adjust intensity and contrast.'}</li><li>{fr ? 'Vérifiez l’aperçu puis coupez la caméra.' : 'Check the preview, then turn the camera off.'}</li></ol></article><article className="dl-card"><span className="dl-tag">{fr ? 'IA indisponible' : 'AI unavailable'}</span><h3>{fr ? 'Ce qui n’est pas construit' : 'What is not built'}</h3><p>{fr ? 'Pas de tenue, de corps ou de décor redessiné par une phrase ; pas de moteur de restylisation IA connecté. L’installateur Swap Live ne rend pas ces fonctions disponibles.' : 'No prompt-driven clothing, body or scenery redraw; no connected AI restyling engine. The Swap Live installer does not enable these features.'}</p></article></div>
      <Button asChild variant="outline" className="mt-4"><Link to="/restyle-live"><Sparkles />{fr ? 'Ouvrir les filtres locaux' : 'Open local filters'}</Link></Button>
    </section>
    <section id="photo"><h2>04 · Swap Photo</h2><p className="dl-lead">{fr ? 'Remplacer le visage d’une personne dans une photo fixe, en conservant la pose et le décor de cette photo. Ce n’est ni un appel ni une animation de tout le corps.' : 'Replace a person’s face in a still image while preserving its pose and background. This is neither a call nor full-body animation.'}</p><p className="dl-warn mt-4">{fr ? 'Indisponible : le moteur photo n’est pas connecté. Aucun import inutile, aucun faux résultat, aucun débit. Il faut un moteur sous licence autorisée, un traitement validé, un export et un décompte lié au résultat avant activation.' : 'Unavailable: the photo engine is not connected. No unnecessary upload, fake result or debit. An authorised engine license, validated processing, export and result-linked billing are required before activation.'}</p><p className="dl-note">{fr ? 'Les images du catalogue sont des photos, pas des avatars capables de bouger seuls. Utilisez uniquement des visages dont les droits et le consentement couvrent votre usage ; une licence photo ne garantit pas tous les usages d’identité.' : 'Catalogue images are photos, not avatars that move by themselves. Only use faces whose rights and consent cover your use; a photo licence does not guarantee every identity-related use.'}</p></section>
    <section id="points"><h2><Coins className="mr-2 inline" />{fr ? 'Points, minutes et compte Weechat' : 'Points, minutes and Weechat account'}</h2><div className="dl-steps"><article className="dl-card"><h3>{fr ? 'Swap Live Windows' : 'Windows Swap Live'}</h3><p>{fr ? `Tarif prévu : ${usagePolicy.swapPointsPerSecond} pts/s, soit 20 points par tranche de ${usagePolicy.blockSeconds} s. Le moteur téléchargé ne l’applique pas encore. À relier : connexion, autorisation serveur avant démarrage, renouvellement des tranches et arrêt si solde insuffisant.` : `Planned rate: ${usagePolicy.swapPointsPerSecond} pts/s, or 20 points per ${usagePolicy.blockSeconds}-second block. The downloaded engine does not enforce it yet. Missing: sign-in, server authorisation before start, block renewal and stopping on insufficient balance.`}</p></article><article className="dl-card"><h3>{fr ? 'Traduction' : 'Translation'}</h3><p>{fr ? 'Solde audio séparé : 10 secondes prépayées par tranche. Les points vidéo ne le remplacent pas. Une tranche commencée est débitée même si le micro ou la connexion échoue ; ce comportement doit être corrigé avant commercialisation.' : 'Separate audio balance: prepaid 10-second blocks. Video points do not replace it. A started block is charged even if the microphone or connection fails; this needs correction before commercialisation.'}</p></article><article className="dl-card"><h3>Restyle · Swap Photo</h3><p>{fr ? 'Tarifs IA présentés : 2 pts/s pour Restyle et 2 pts/photo. Non appliqués actuellement : filtres locaux gratuits et moteur photo absent.' : 'Displayed AI rates: 2 pts/s for Restyle and 2 pts/photo. Not currently applied: local filters are free and the photo engine is absent.'}</p></article></div><p className="dl-note">{fr ? 'Les soldes du compte et l’historique de points sont réels. L’historique actuel affiche les points, pas les mouvements détaillés du solde audio. Les paiements, bonus et validités des packs ne sont pas activés ; aucun achat simulé n’est proposé.' : 'Account balances and point history are real. Current history shows points, not detailed audio-balance movements. Payments, bonuses and pack validity are not enabled; no simulated purchase is offered.'}</p><Button asChild variant="outline" className="mt-4"><Link to="/credits">{fr ? 'Voir mes soldes et les tarifs' : 'View my balances and pricing'}</Link></Button></section>
    <section><h2>{fr ? 'Choisir les périphériques dans l’appli d’appel' : 'Choose devices in your calling app'}</h2><div className="dl-tabs" role="tablist">{apps.map(a => <Button key={a} role="tab" aria-selected={a === app} variant={a === app ? 'default' : 'outline'} onClick={() => setApp(a)}>{a}</Button>)}</div><div className="border-y border-border py-4"><p className="mb-3">{app} · {menu}</p><ol className="list-decimal space-y-3 pl-5"><li>{fr ? 'Vidéo : caméra' : 'Video: camera'} <K>Unity Video Capture</K>.</li><li>{fr ? 'Voix traduite : micro' : 'Translated speech: microphone'} <K>CABLE Output</K>.</li><li>{fr ? 'Dans Weechat Traduction : sortie' : 'In Weechat Translation: output'} <K>CABLE Input</K>.</li><li>{fr ? 'Testez l’image et le son avant l’appel. Les menus varient selon les versions ; compatibilité non encore validée.' : 'Test video and audio before the call. Menus vary by version; compatibility is not yet validated.'}</li></ol></div></section>
    <section id="depannage"><h2>{fr ? '« Unity Video Capture » n’apparaît pas ?' : '“Unity Video Capture” not listed?'}</h2><p className="dl-lead">{fr ? 'Vérifications manuelles, dans l’ordre. Aucune détection automatique ni taux de réussite annoncé.' : 'Manual checks, in order. No automatic detection or claimed success rate.'}</p><div className="dl-check mt-5">{fix.map(([t,d],i) => <article key={t} className="dl-card"><span className="dl-tag">{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
    <section><h2>{fr ? 'Questions avant de demander de l’aide' : 'Questions before contacting support'}</h2>{(fr ? [
      ['L’installateur fait-il tout ?', 'Non. Il vise le Swap Live Windows. La traduction reste sur le site ; Restyle IA et Swap Photo n’ont pas leur moteur connecté.'],
      ['Pourquoi je n’entends pas de traduction ?', 'Vérifiez le solde audio, l’autorisation micro, l’état Palabra et la sortie audio. Pour une autre appli, testez CABLE Input puis CABLE Output avec un casque.'],
      ['Windows bloque le fichier ?', 'Vérifiez sa provenance officielle. Un avertissement SmartScreen est différent d’un blocage du contrôle intelligent des applications. Ne désactivez pas une protection pour forcer l’installation ; conservez le message exact.'],
      ['Mon ordinateur est-il assez rapide ?', 'Le calcul Swap Live se fait localement. DirectML peut utiliser un GPU compatible, mais aucun débit d’images n’est garanti sur votre PC. Vérifiez le rendu lors d’un essai court.'],
    ] : [
      ['Does setup cover everything?', 'No. It targets Windows Swap Live. Translation stays on the website; Restyle AI and Swap Photo lack connected engines.'],
      ['Why is no translation audible?', 'Check audio balance, microphone permission, Palabra status and audio output. For another app, test CABLE Input then CABLE Output with headphones.'],
      ['Windows blocks the file?', 'Verify its official source. A SmartScreen warning differs from a Smart App Control block. Do not disable protection to force installation; keep the exact message.'],
      ['Is my computer fast enough?', 'Swap Live processing is local. DirectML may use a compatible GPU, but no frame rate is guaranteed on your PC. Check the result in a short trial.'],
    ]).map(([q,a],i) => <div className="border-b border-border py-3" key={q}><Button variant="ghost" className="h-auto w-full justify-between whitespace-normal text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}<ChevronDown className="shrink-0" /></Button>{open === i && <p className="px-4 pb-3 text-sm leading-relaxed text-muted-foreground">{a}</p>}</div>)}</section>
    <p className="dl-warn">{fr ? 'L’envoi vers les appels mobile et macOS n’est pas pris en charge. Usage autorisé et consenti uniquement, sans usurpation ni fraude. Besoin d’aide ? Envoyez l’étape, le message exact et une capture sans données privées sur' : 'Routing to mobile and macOS calls is not supported. Authorised, consensual use only; no impersonation or fraud. Need help? Send the step, exact message and a screenshot without private information to'} <a href={whatsappLink(locale)} target="_blank" rel="noreferrer" className="underline">WhatsApp {WHATSAPP_DISPLAY}</a>.</p>
  </div>;
}
