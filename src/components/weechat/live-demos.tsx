import { useEffect, useState } from 'react';
import { Mic, Video, PhoneOff, Camera, Film, Repeat, Languages, Sparkles } from 'lucide-react';

// Free-to-use clips of real people talking (Mixkit License, commercial use allowed).
const clip = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
export const demoPeople = [
  { id: 'awa', name: 'Awa', src: clip(47004) },
  { id: 'marc', name: 'Marc', src: clip(28287) },
  { id: 'lea', name: 'Léa', src: clip(4833) },
  { id: 'sam', name: 'Sam', src: clip(2963) },
];

function Clip({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  return <video key={src} className={className} style={style} src={src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />;
}
function CallBar() {
  return <div className="ld-callbar"><span><Mic size={16} /></span><span><Video size={16} /></span><span className="end"><PhoneOff size={16} /></span></div>;
}

export function SwapDemo({ fr }: { fr: boolean }) {
  const [p, setP] = useState(0);
  const cur = demoPeople[p]!;
  return <div className="ld">
    <div className="ld-screen">
      <Clip src={cur.src} className="ld-video" />
      <span className="ld-tag live"><i />LIVE · 30 FPS</span>
      <span className="ld-tag cam"><Camera size={13} />Weechat Camera</span>
      <div className="ld-pip"><Clip src={demoPeople[(p + 1) % 4]!.src} /></div>
      <CallBar />
    </div>
    <div className="ld-picker" role="group" aria-label={fr ? 'Choisir un avatar' : 'Pick an avatar'}>
      {demoPeople.map((x, n) => <button key={x.id} className={n === p ? 'on' : ''} aria-pressed={n === p} onClick={() => setP(n)}>
        <video src={`${x.src}#t=2`} muted playsInline preload="metadata" aria-hidden="true" /><span>{x.name}</span></button>)}
    </div>
  </div>;
}

const lines = [
  ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  ['Je vous présente notre nouvelle offre.', 'Let me show you our new offer.'],
  ['On peut se rappeler demain sur WhatsApp ?', 'Can we call again tomorrow on WhatsApp?'],
];
export function TranslateDemo({ fr }: { fr: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % lines.length), 3200); return () => clearInterval(t); }, []);
  const l = lines[i]!;
  return <div className="ld"><div className="ld-screen">
    <Clip src={demoPeople[0]!.src} className="ld-video" />
    <span className="ld-tag live"><i />{fr ? 'Appel WhatsApp' : 'WhatsApp call'}</span>
    <span className="ld-tag cam"><Languages size={13} />FR → EN</span>
    <div className="ld-subs" key={i}><p className="src">🇫🇷 {l[0]}</p><p className="dst">🇬🇧 {l[1]}</p></div>
    <CallBar />
  </div></div>;
}

export function BroadcastDemo({ fr }: { fr: boolean }) {
  return <div className="ld"><div className="ld-screen">
    <Clip src={demoPeople[1]!.src} className="ld-video" />
    <span className="ld-tag live"><i />LIVE TikTok</span>
    <div className="ld-chips"><span><Film size={13} />presentation.mp4</span><span><Repeat size={13} />{fr ? 'En boucle' : 'Looping'}</span><span><Camera size={13} />Weechat Camera</span><span><Mic size={13} />{fr ? 'Son inclus' : 'Sound included'}</span></div>
    <div className="ld-progress"><i /></div>
  </div></div>;
}

export function TransformDemo({ fr }: { fr: boolean }) {
  return <div className="ld"><div className="ld-screen ld-wipe">
    <Clip src={demoPeople[2]!.src} className="ld-video" />
    <div className="ld-after"><Clip src={demoPeople[0]!.src} className="ld-video" /></div>
    <i className="ld-line" aria-hidden="true" />
    <span className="ld-tag live">{fr ? 'Votre vidéo' : 'Your video'}</span>
    <span className="ld-tag cam"><Sparkles size={13} />{fr ? 'Avatar' : 'Avatar'}</span>
  </div></div>;
}

const filters = [
  ['Naturel', 'Natural', 'none'], ['Vif', 'Vivid', 'saturate(1.9) contrast(1.1)'], ['Noir & blanc', 'Mono', 'grayscale(1) contrast(1.1)'],
  ['Contraste', 'Contrast', 'contrast(1.6)'], ['Cinéma', 'Cinema', 'sepia(.45) contrast(1.2) saturate(.8)'], ['Froid', 'Cool', 'hue-rotate(190deg) saturate(1.3)'],
] as const;
export function RestyleDemo({ fr }: { fr: boolean }) {
  const [f, setF] = useState(1);
  return <div className="ld"><div className="ld-screen">
    <Clip src={demoPeople[3]!.src} className="ld-video" style={{ filter: filters[f]![2], transition: 'filter .4s' }} />
    <span className="ld-tag live"><i />LIVE</span>
  </div>
    <div className="ld-filters" role="group" aria-label={fr ? 'Choisir un style' : 'Pick a style'}>{filters.map((x, n) => <button key={x[0]} className={n === f ? 'on' : ''} aria-pressed={n === f} onClick={() => setF(n)}>{fr ? x[0] : x[1]}</button>)}</div>
  </div>;
}
