import { queryOptions } from '@tanstack/react-query';
import { getProfile } from './profile.functions';
export const profileQuery = queryOptions({ queryKey: ['profile'], queryFn: () => getProfile(), staleTime: 30_000 });