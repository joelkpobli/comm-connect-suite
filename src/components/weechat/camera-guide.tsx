import { Check, Download, MousePointerClick, Play, ShieldCheck, Video } from 'lucide-react';
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
  return <section id="guide-camera" aria-labelledby="guide-camera-title">
    <h2 id="guide-camera-title">{fr ? 'Guide visuel : installer et utiliser Weechat Camera' : 'Visual guide: install and use Weechat Camera'}</h2>
    <p className="dl-lead">{fr ? 'Quatre étapes, environ 5 minutes. Suivez les images dans l’ordre.' : 'Four steps, about 5 minutes. Follow the pictures in order.'}</p>
    <ol className="cg-grid">{steps.map((s, i) => <li key={s.title} className="cg-step">
      <div className="dl-mock" aria-hidden="true"><div className="dl-mock-bar"><i /><i /><i /><span>{s.bar}</span></div><div className="dl-mock-body">{s.screen}</div></div>
      <div className="flex items-center gap-3 mt-4"><span className="dl-num">{i + 1}</span><h3 className="font-bold">{s.title}</h3></div>
      <p className="cg-text">{s.text}</p>
      <p className="cg-tip"><MousePointerClick size={14} />{s.tip}</p>
    </li>)}</ol>
  </section>;
}
