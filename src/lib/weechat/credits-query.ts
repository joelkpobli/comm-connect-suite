import { queryOptions } from '@tanstack/react-query';
import { getCredits } from './credits.functions';
export const creditsQuery = queryOptions({ queryKey: ['credits'], queryFn: () => getCredits(), staleTime: 0 });