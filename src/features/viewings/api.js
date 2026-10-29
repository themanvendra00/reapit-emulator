import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

// Viewings are appointments with typeId=VW.
export function usePropertyViewings(propertyId, { page = 1, pageSize = 20 } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['viewings', propertyId, { page, pageSize, baseUrl: api.baseUrl }],
    queryFn: () =>
      api.getPaged(
        `/appointments/${buildQuery({
          propertyId,
          typeId: 'VW',
          pageNumber: page,
          pageSize,
          includeCancelled: true,
        })}`,
      ),
    enabled: !!propertyId,
  });
}

export function useCreateViewing(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      api.post('/appointments/', { ...body, propertyId, typeId: 'VW' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings', propertyId] });
    },
  });
}

export function useUpdateViewing(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ viewingId, body, etag }) =>
      api.patch(`/appointments/${viewingId}`, body, etag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings', propertyId] });
    },
  });
}
