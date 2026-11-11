import { describe, it, expect } from 'vitest';
import { swapPlans, audioPlans, momoCountries, consumption, landingCopy } from '@/lib/weechat/landing-copy';

describe('Grille tarifaire en points (présentation)', () => {
  it('propose les 5 packs Swap Live avec les prix et points exacts', () => {
    expect(swapPlans.map(p => p.id)).toEqual(['decouverte', 'starter', 'standard', 'premium', 'ultimate']);
    expect(swapPlans.map(p => p.price.XOF)).toEqual(['4 999', '19 900', '49 900', '84 900', '150 000']);
    expect(swapPlans.map(p => p.points)).toEqual([417, 1658, 3960, 5640, 11400]);
    expect(swapPlans.find(p => p.id === 'standard')?.popular).toBe(true);
  });

  it('propose les 3 packs Audio avec les durées exactes', () => {
    expect(audioPlans.map(p => p.id)).toEqual(['audio-flash', 'audio-pro', 'audio-marathon']);
    expect(audioPlans.map(p => p.audioMin)).toEqual([10, 60, 120]);
    expect(audioPlans.map(p => p.price.XOF)).toEqual(['4 999', '22 900', '39 900']);
  });

  it('affiche chaque prix dans les trois devises', () => {
    for (const p of [...swapPlans, ...audioPlans]) {
      expect(p.price.XOF).toBeTruthy();
      expect(p.price.EUR).toBeTruthy();
      expect(p.price.USD).toBeTruthy();
    }
  });

  it('couvre exactement 24 pays Mobile Money avec drapeaux', () => {
    expect(momoCountries).toHaveLength(24);
    for (const [flag, name] of momoCountries) {
      expect(flag).toMatch(/^[a-z]{2}$/);
      expect(name.length).toBeGreaterThan(2);
    }
  });

  it('consomme des points par seconde, jamais des minutes d’appel', () => {
    expect(consumption).toEqual({ live: 2, restyle: 2, photo: 2 });
    const faq = landingCopy('fr').faq[0]!;
    expect(faq[1]).toContain('ne correspondent pas à des minutes d’appel');
  });

  it('présente les 4 onglets de fonctionnalités et 9 questions FAQ', () => {
    expect(landingCopy('fr').tabs).toEqual(['Swap Live', 'Traduction en temps réel', 'Studio Diffusion Vidéo', 'Studio Transformation Avatar', 'Restyle Live']);
    expect(landingCopy('fr').faq).toHaveLength(9);
    expect(landingCopy('en').faq).toHaveLength(9);
  });

  it('présente un paiement unique sans abonnement', () => {
    expect(landingCopy('fr').priceDisclaimer).toContain('sans abonnement');
  });
});

import { classifyLine } from '@/lib/weechat/landing-copy';
describe('présentation des lignes de pack', () => {
  it('sépare les bonus et attribue une icône à chaque fonctionnalité', () => {
    expect(classifyLine('Live : 33 min')).toEqual({ kind: 'live', bonus: false });
    expect(classifyLine('Photos : 1 980')).toEqual({ kind: 'photo', bonus: false });
    expect(classifyLine('Bonus : Traduction 30 min')).toEqual({ kind: 'translate', bonus: true });
    expect(classifyLine('Caméra virtuelle à vie')).toEqual({ kind: 'vcam', bonus: true });
    expect(classifyLine('Valable 90 jours').kind).toBe('validity');
  });
});

import { cameraLicense, studioRates } from '@/lib/weechat/landing-copy';
describe('Studio et licence caméra', () => {
  it('Transformation Avatar coûte plus que Diffusion Vidéo (1 pt/s contre 5 pts/s)', () => {
    expect(studioRates).toEqual({ cas1: 1, cas2: 5 });
  });
  it('la licence Weechat Camera coûte 10 000 FCFA une seule fois, incluse en Premium et Ultimate', () => {
    expect(cameraLicense.priceXOF).toBe(10000);
    expect(cameraLicense.includedIn).toEqual(['premium', 'ultimate']);
  });
  it('Diffusion Vidéo dès Starter, Transformation Avatar dès Standard', () => {
    const has = (id: string, t: string) => swapPlans.find(p => p.id === id)!.lines.fr.some(l => l.includes(t));
    expect(has('decouverte', 'Studio')).toBe(false);
    expect(has('starter', 'Diffusion Vidéo')).toBe(true);
    expect(has('starter', 'Transformation Avatar')).toBe(false);
    for (const id of ['standard', 'premium', 'ultimate']) expect(has(id, 'Transformation Avatar')).toBe(true);
    for (const id of ['premium', 'ultimate']) expect(has(id, 'voix traduite')).toBe(true);
  });
});
