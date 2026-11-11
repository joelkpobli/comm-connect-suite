import { queryOptions } from '@tanstack/react-query';
import { getCredits } from './credits.functions';
export const creditsQuery = queryOptions({ queryKey: ['credits'], queryFn: () => getCredits(), staleTime: 0 });
import { getAudioSeconds, getAiTokens } from './usage.functions';
export const audioQuery = queryOptions({ queryKey: ['audio-seconds'], queryFn: () => getAudioSeconds(), staleTime: 0 });
export const aiTokensQuery = queryOptions({ queryKey: ['ai-tokens'], queryFn: () => getAiTokens(), staleTime: 0 });
import { getBalanceValidity } from './usage.functions';
export const validityQuery = queryOptions({ queryKey: ['balance-validity'], queryFn: () => getBalanceValidity(), staleTime: 0 });
export const fmtExpiry = (iso: string | null | undefined, en: boolean) => iso ? `${en ? 'Expires' : 'Expire le'} ${new Date(iso).toLocaleDateString(en ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : (en ? 'No expiry date yet' : 'Pas encore d’échéance');
