import { AlertTriangle, Check, Download, FileDown, MousePointerClick, Play, ShieldCheck, Video } from 'lucide-react';
import type { ReactNode } from 'react';

type Step = { title: string; text: string; tip: string; screen: ReactNode; bar: string };

const Opt = ({ on, children }: { on?: boolean; children: ReactNode }) => <div className={`dl-mock-opt${on ? ' on' : ''}`}>{children}{on && <Check size={16} />}</div>;

export function CameraGuide({ fr }: { fr: boolean }) {
  const steps: Step[] = [
    { bar: fr ? 'Téléchargements' : 'Downloads', title: fr ? 'Téléchargez l’installateur' : 'Download the installer', text: fr ? 'Cliquez sur « Télécharger pour Windows » et attendez la fin du fichier Weechat-Setup.exe.' : 'Click “Download for Windows” and wait for Weechat-Setup.exe to finish.', tip: fr ? 'Environ 151 Mo.' : 'About 151 MB.',
      screen: <><Opt on><span className="inline-flex items-center gap-2"><Download size={15} />Weechat-Setup.exe</span></Opt><div className="cg-bar"><span /></div></> },
    { bar: 'Windows SmartScreen', title: fr ? 'Lancez l’installation' : 'Run the setup', text: fr ? 'Ouvrez le fichier. Si Windows affiche un écran bleu, cliquez « Informations complémentaires » puis « Exécuter quand même ».' : 'Open the file. If Windows shows a blue screen, click “More info” then “Run anyway”.', tip: fr ? 'La caméra Weechat Camera s’installe automatiquement.' : 'Weechat Camera installs automatically.',
      screen: <><p className="cg-small">{fr ? 'Windows a protégé votre ordinateur' : 'Windows protected your PC'}</p><Opt>{fr ? 'Informations complémentaires' : 'More info'}</Opt><Opt on><span className="inline-flex items-center gap-2"><ShieldCheck size={15} />{fr ? 'Exécuter quand même' : 'Run anyway'}</span></Opt></> },
    { bar: 'Weechat · Swap Live', title: fr ? 'Démarrez Swap Live' : 'Start Swap Live', text: fr ? 'Ouvrez Weechat, choisissez votre avatar et votre webcam, puis cliquez « Démarrer ».' : 'Open Weechat, choose your avatar and webcam, then click “Start”.', tip: fr ? 'Le premier démarrage peut prendre environ une minute.' : 'The first start can take about a minute.',
      screen: <><Opt on>{fr ? 'Avatar choisi' : 'Avatar selected'}</Opt><Opt>{fr ? 'Webcam intégrée' : 'Built-in webcam'}</Opt><div className="cg-start"><Play size={15} />{fr ? 'Démarrer' : 'Start'}</div></> },
    { bar: fr ? 'WhatsApp · Paramètres vidéo' : 'WhatsApp · Video settings', title: fr ? 'Choisissez Weechat Camera' : 'Choose Weechat Camera', text: fr ? 'Dans WhatsApp, Zoom ou Teams, ouvrez les réglages vidéo et sélectionnez « Weechat Camera ». Votre avatar apparaît dans l’appel.' : 'In WhatsApp, Zoom or Teams, open video settings and select “Weechat Camera”. Your avatar appears in the call.', tip: fr ? 'Caméra absente ? Fermez puis rouvrez l’application d’appel.' : 'Camera missing? Close and reopen the calling app.',
      screen: <><p className="cg-small">{fr ? 'Caméra' : 'Camera'}</p><Opt>HP HD Camera</Opt><Opt on><span className="inline-flex items-center gap-2"><Video size={15} />Weechat Camera</span></Opt></> },
  ];
  const help = fr ? [
    { q: 'Windows affiche « Windows a protégé votre ordinateur »', a: ['Cliquez sur « Informations complémentaires ».', 'Vérifiez que le fichier s’appelle Weechat-Setup.exe et vient de weechat.online.', 'Cliquez sur « Exécuter quand même ».'] },
    { q: 'L’antivirus bloque ou supprime le fichier', a: ['Ouvrez Sécurité Windows → Protection contre les virus → Historique de protection.', 'Choisissez Weechat-Setup.exe puis « Autoriser ».', 'Retéléchargez le fichier depuis cette page et relancez-le.'] },
    { q: 'L’installation demande une autorisation administrateur', a: ['Cliquez « Oui » sur la fenêtre de Windows.', 'Sur un PC de travail, demandez l’accord de la personne qui gère le PC.'] },
    { q: 'Weechat Camera n’apparaît pas dans WhatsApp, Zoom ou Teams', a: ['Fermez complètement l’application d’appel (aussi près de l’horloge), puis rouvrez-la.', 'Redémarrez le PC.', 'Toujours absente : relancez Weechat-Setup.exe pour réinstaller la caméra.'] },
    { q: 'Weechat Camera est là, mais l’image est noire', a: ['Ouvrez Weechat et cliquez « Démarrer » dans Swap Live.', 'Attendez que l’aperçu s’affiche dans Weechat (environ une minute la première fois).', 'Fermez les autres applications qui utilisent votre webcam.'] },
  ] : [
    { q: 'Windows shows “Windows protected your PC”', a: ['Click “More info”.', 'Check that the file is Weechat-Setup.exe from weechat.online.', 'Click “Run anyway”.'] },
    { q: 'Antivirus blocks or deletes the file', a: ['Open Windows Security → Virus protection → Protection history.', 'Select Weechat-Setup.exe and choose “Allow”.', 'Download the file again from this page and run it.'] },
    { q: 'Setup asks for administrator permission', a: ['Click “Yes” in the Windows prompt.', 'On a work PC, ask the person who manages it.'] },
    { q: 'Weechat Camera is missing in WhatsApp, Zoom or Teams', a: ['Fully close the calling app (including near the clock), then reopen it.', 'Restart your PC.', 'Still missing: run Weechat-Setup.exe again to reinstall the camera.'] },
    { q: 'Weechat Camera is listed but the picture is black', a: ['Open Weechat and click “Start” in Swap Live.', 'Wait for the preview in Weechat (about a minute the first time).', 'Close other apps using your webcam.'] },
  ];
  return <section id="guide-camera" aria-labelledby="guide-camera-title">
    <h2 id="guide-camera-title">{fr ? 'Guide visuel : installer et utiliser Weechat Camera' : 'Visual guide: install and use Weechat Camera'}</h2>
    <p className="dl-lead">{fr ? 'Quatre étapes, environ 5 minutes. Suivez les images dans l’ordre.' : 'Four steps, about 5 minutes. Follow the pictures in order.'}</p>
    <a className="cg-pdf" href={`/downloads/guide-weechat-camera-${fr ? 'fr' : 'en'}.pdf`} download={`guide-weechat-camera-${fr ? 'fr' : 'en'}.pdf`}><FileDown size={18} />{fr ? 'Télécharger le guide en PDF' : 'Download the guide as PDF'}</a>
    <ol className="cg-grid">{steps.map((s, i) => <li key={s.title} className="cg-step">
      <div className="flex min-w-0 items-center gap-3 mb-3"><span className="dl-num shrink-0">{i + 1}</span><h3 className="min-w-0 font-bold">{s.title}</h3></div>
      <div className="dl-mock" aria-hidden="true"><div className="dl-mock-bar"><i /><i /><i /><span>{s.bar}</span></div><div className="dl-mock-body">{s.screen}</div></div>
      <p className="cg-text">{s.text}</p>
      <p className="cg-tip"><MousePointerClick size={14} />{s.tip}</p>
    </li>)}</ol>
    <div id="guide-depannage" className="cg-help">
      <h3 className="text-lg font-bold">{fr ? 'Dépannage : ça ne marche pas ?' : 'Troubleshooting: not working?'}</h3>
      <div className="cg-help-grid">{help.map(h => <details key={h.q} className="cg-help-item"><summary><AlertTriangle size={16} className="shrink-0" /><span>{h.q}</span></summary><ol>{h.a.map(a => <li key={a}>{a}</li>)}</ol></details>)}</div>
      <p className="cg-text">{fr ? 'Toujours bloqué ? Écrivez-nous sur WhatsApp au +229 01 57 68 59 35 avec une capture de l’écran.' : 'Still stuck? Message us on WhatsApp at +229 01 57 68 59 35 with a screenshot.'}</p>
    </div>
  </section>;
}
