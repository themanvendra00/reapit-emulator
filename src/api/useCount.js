import { useQuery } from '@tanstack/react-query';
import { useApiClient } from './useApiClient.js';

// Cheap way to read a collection's totalCount for stat cards without pulling
// the full page of records.
export function useCount(path, enabled = true) {
  const api = useApiClient();
  const query = useQuery({
    queryKey: ['count', path, api.baseUrl],
    queryFn: () => api.getPaged(path),
    enabled,
    staleTime: 30_000,
  });
  return { count: query.data?.totalCount, isLoading: query.isLoading };
}
