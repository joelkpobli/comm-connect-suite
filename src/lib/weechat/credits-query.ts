import { queryOptions } from '@tanstack/react-query';
import { getCredits } from './credits.functions';
export const creditsQuery = queryOptions({ queryKey: ['credits'], queryFn: () => getCredits(), staleTime: 0 });
import { getAudioSeconds } from './usage.functions';
export const audioQuery = queryOptions({ queryKey: ['audio-seconds'], queryFn: () => getAudioSeconds(), staleTime: 0 });
