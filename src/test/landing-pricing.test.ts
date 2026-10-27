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
    expect(landingCopy('fr').tabs).toEqual(['Swap Live', 'Traduction en temps réel', 'Restyle Live', 'Photo & vidéo']);
    expect(landingCopy('fr').faq).toHaveLength(9);
    expect(landingCopy('en').faq).toHaveLength(9);
  });

  it('indique honnêtement qu’aucun paiement n’est actif', () => {
    expect(landingCopy('fr').priceDisclaimer).toContain('aucun paiement');
    expect(landingCopy('fr').payText).toContain('Aucun paiement');
  });
});
