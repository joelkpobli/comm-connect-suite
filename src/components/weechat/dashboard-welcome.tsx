import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Coins, Languages, Sparkles, X } from 'lucide-react';

const KEY = 'weechat-guide-hidden';

function greeting(fr: boolean, hour: number) {
  if (hour >= 5 && hour < 12) return fr ? 'Bonjour' : 'Good morning';
  if (hour >= 12 && hour < 18) return fr ? 'Bon après-midi' : 'Good afternoon';
  return fr ? 'Bonsoir' : 'Good evening';
}

export function DashboardWelcome({ fr, name }: { fr: boolean; name: string }) {
  const [hour, setHour] = useState<number | null>(null);
  const [hidden, setHidden] = useState(true);
  useEffect(() => { setHour(new Date().getHours()); setHidden(localStorage.getItem(KEY) === '1'); }, []);
  const first = name.split(/[\s@]/)[0] || name;
  const steps = [
    { icon: Coins, title: fr ? 'Points' : 'Points', desc: fr ? 'Pour vos appels vidéo et la webcam Swap Live, sur ordinateur.' : 'For video calls and Swap Live webcam, on computer.', to: '/telecharger' as const, cta: fr ? 'Installer l’application' : 'Install the app' },
    { icon: Languages, title: 'Minutes', desc: fr ? 'Pour traduire votre voix en direct pendant un appel.' : 'To translate your voice live during a call.', to: '/traduction' as const, cta: fr ? 'Essayer la traduction' : 'Try translation' },
    { icon: Sparkles, title: fr ? 'Jetons IA' : 'AI tokens', desc: fr ? 'Pour créer des images ou échanger des visages sur photo, sur le web.' : 'To create images or swap faces on photos, on the web.', to: '/avatars' as const, cta: fr ? 'Choisir un avatar' : 'Pick an avatar' },
  ];
  return <section className="space-y-5">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{hour === null ? (fr ? 'Bienvenue' : 'Welcome') : greeting(fr, hour)}, {first} 👋</h1>
      <p className="mt-2 text-lg text-muted-foreground">{fr ? 'Ravi de vous revoir. Vos soldes, vos outils et vos recharges sont ici.' : 'Great to see you. Your balances, tools and top-ups are here.'}</p>
    </div>
    {!hidden && <div className="rounded-lg border border-primary/40 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">{fr ? 'Démarrage rapide : à quoi sert chaque solde ?' : 'Quick start: what is each balance for?'}</h2>
        <button type="button" aria-label={fr ? 'Masquer le guide' : 'Hide guide'} onClick={() => { localStorage.setItem(KEY, '1'); setHidden(true); }} className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"><X size={20} /></button>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => <li key={s.title} className="flex flex-col gap-2 rounded-md bg-muted/40 p-4">
          <div className="flex items-center gap-2 font-semibold text-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">{i + 1}</span><s.icon size={18} className="text-primary" />{s.title}</div>
          <p className="text-base text-muted-foreground">{s.desc}</p>
          <Link to={s.to} className="mt-auto text-base font-medium text-primary hover:underline">{s.cta} →</Link>
        </li>)}
      </ol>
    </div>}
  </section>;
}
