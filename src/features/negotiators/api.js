import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

export function useNegotiatorsList({ page, pageSize, name } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['negotiators', { page, pageSize, name, baseUrl: api.baseUrl }],
    queryFn: () =>
      api.getPaged(
        `/negotiators/${buildQuery({
          pageNumber: page,
          pageSize,
          name: name || undefined,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

// All active negotiators, unpaginated-ish — used to populate dropdowns.
export function useNegotiatorOptions() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['negotiator-options', api.baseUrl],
    queryFn: () => api.getPaged('/negotiators/?pageSize=200&pageNumber=1'),
    staleTime: 60_000,
  });
}

export function useNegotiator(id) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['negotiator', id, api.baseUrl],
    queryFn: () => api.get(`/negotiators/${id}`),
    enabled: !!id,
  });
}

export function useCreateNegotiator() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/negotiators/', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiators'] });
      queryClient.invalidateQueries({ queryKey: ['negotiator-options'] });
    },
  });
}

export function useUpdateNegotiator() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body, etag }) => api.patch(`/negotiators/${id}`, body, etag),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['negotiators'] });
      queryClient.invalidateQueries({ queryKey: ['negotiator-options'] });
      queryClient.invalidateQueries({ queryKey: ['negotiator', variables.id] });
    },
  });
}
