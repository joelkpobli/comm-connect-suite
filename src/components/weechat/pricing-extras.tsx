import { Camera, Check, ChevronDown, Lock, Minus, Webcam } from 'lucide-react';
import { swapPlans, cameraLicense, type Currency } from '@/lib/weechat/landing-copy';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
const mins = (pts: number, perSec: number) => { const s = Math.floor(pts / perSec); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${m} min` : `${m} min`; };

export function CameraNotaBene({ locale }: { locale: 'fr' | 'en' }) {
  const fr = locale === 'fr';
  return <aside className="nb-box" aria-labelledby="nb-title">
    <h3 id="nb-title"><Lock size={22} />{fr ? 'Nota bene : pourquoi la licence Weechat Camera est indispensable' : 'Nota bene: why the Weechat Camera licence matters'}</h3>
    <div className="nb-grid">
      <div><h4><Webcam size={19} />{fr ? 'Sans licence : votre caméra normale' : 'Without licence: your normal camera'}</h4>
        <p>{fr ? 'Votre appel WhatsApp, TikTok ou Zoom fonctionne, mais votre correspondant voit votre vrai visage et votre vraie pièce. L’avatar reste visible uniquement dans l’aperçu du logiciel Weechat : il ne peut pas entrer dans l’appel.' : 'Your WhatsApp, TikTok or Zoom call works, but the other person sees your real face and room. The avatar stays in the Weechat preview only: it cannot enter the call.'}</p></div>
      <div className="on"><h4><Camera size={19} />{fr ? 'Avec la licence : Weechat Camera' : 'With the licence: Weechat Camera'}</h4>
        <p>{fr ? 'Choisissez « Weechat Camera » dans votre appli d’appel : votre avatar, votre visage changé ou votre vidéo Studio en boucle apparaissent directement dans WhatsApp, TikTok Live, Facebook Live, Zoom ou Meet.' : 'Pick “Weechat Camera” in your calling app: your avatar, swapped face or looping Studio video appears directly in WhatsApp, TikTok Live, Facebook Live, Zoom or Meet.'}</p></div>
    </div>
    <p className="nb-foot"><Check size={18} />{fr ? `Paiement unique de ${cameraLicense.price.XOF} FCFA, valable à vie, sans abonnement. Offerte dans les packs Premium et Ultimate.` : `One-time ${cameraLicense.price.XOF} FCFA, lifetime, no subscription. Included in Premium and Ultimate.`}</p>
  </aside>;
}

export function PlanCompare({ locale, cur }: { locale: 'fr' | 'en'; cur: Currency }) {
  const fr = locale === 'fr'; const sym = cur === 'XOF' ? 'FCFA' : cur === 'EUR' ? '€' : '$';
  const has = (id: string, ...ids: string[]) => ids.includes(id);
  const rows: [string, (p: typeof swapPlans[number]) => React.ReactNode][] = [
    [fr ? 'Prix' : 'Price', p => <b>{p.price[cur]} {sym}</b>],
    [fr ? 'Points inclus' : 'Points included', p => fmt(p.points ?? 0)],
    [fr ? 'Validité' : 'Validity', p => `${p.validity} ${fr ? 'jours' : 'days'}`],
    ['Swap Live Webcam', p => mins(p.points ?? 0, 2)],
    [fr ? 'Studio Diffusion Vidéo' : 'Studio Video Broadcast', p => has(p.id, 'decouverte') ? null : mins(p.points ?? 0, 1)],
    [fr ? 'Studio Transformation Avatar' : 'Studio Avatar Transformation', p => has(p.id, 'decouverte', 'starter') ? null : mins(p.points ?? 0, 5)],
    [fr ? 'Live visage + voix traduite' : 'Live face + translated voice', p => has(p.id, 'premium', 'ultimate') ? true : null],
    [fr ? 'Bonus traduction vocale' : 'Voice translation bonus', p => p.bonusAudioMin ? `${p.bonusAudioMin} min` : null],
    [fr ? 'Licence Weechat Camera à vie' : 'Lifetime Weechat Camera licence', p => has(p.id, 'premium', 'ultimate') ? (fr ? 'Offerte' : 'Included') : null],
    [fr ? 'Support WhatsApp' : 'WhatsApp support', () => true],
  ];
  const cell = (v: React.ReactNode) => v === null ? <Minus size={18} className="nb-no" aria-label={fr ? 'Non inclus' : 'Not included'} /> : v === true ? <Check size={18} className="nb-yes" aria-label={fr ? 'Inclus' : 'Included'} /> : v;
  return <details className="cmp">
    <summary>{fr ? 'Comparer tous les packs en détail' : 'Compare all packs in detail'}<ChevronDown size={18} /></summary>
    <div className="cmp-scroll"><table>
      <thead><tr><th scope="col">{fr ? 'Fonctionnalité' : 'Feature'}</th>{swapPlans.map(p => <th scope="col" key={p.id} className={p.popular ? 'pop' : ''}>{p.name.replace('Pack ', '')}</th>)}</tr></thead>
      <tbody>{rows.map(([label, f]) => <tr key={label}><th scope="row">{label}</th>{swapPlans.map(p => <td key={p.id} className={p.popular ? 'pop' : ''}>{cell(f(p))}</td>)}</tr>)}</tbody>
    </table></div>
  </details>;
}
