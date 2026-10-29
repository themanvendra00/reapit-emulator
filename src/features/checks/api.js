import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

export function usePropertyChecks(propertyId, { page = 1, pageSize = 20 } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['checks', propertyId, { page, pageSize, baseUrl: api.baseUrl }],
    queryFn: () =>
      api.getPaged(
        `/properties/${propertyId}/checks${buildQuery({ pageNumber: page, pageSize })}`,
      ),
    enabled: !!propertyId,
  });
}

export function useCreatePropertyCheck(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post(`/properties/${propertyId}/checks`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checks', propertyId] });
    },
  });
}

export function useUpdatePropertyCheck(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checkId, body, etag }) =>
      api.patch(`/properties/${propertyId}/checks/${checkId}`, body, etag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checks', propertyId] });
    },
  });
}

export function useDeletePropertyCheck(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkId) => api.delete(`/properties/${propertyId}/checks/${checkId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checks', propertyId] });
    },
  });
}
