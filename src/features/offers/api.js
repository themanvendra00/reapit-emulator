import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

export function usePropertyOffers(propertyId, { page = 1, pageSize = 20 } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['offers', propertyId, { page, pageSize, baseUrl: api.baseUrl }],
    queryFn: () =>
      api.getPaged(
        `/offers/${buildQuery({ propertyId, pageNumber: page, pageSize })}`,
      ),
    enabled: !!propertyId,
  });
}

export function useCreateOffer(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/offers/', { ...body, propertyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', propertyId] });
    },
  });
}

export function useUpdateOffer(propertyId) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, body, etag }) => api.patch(`/offers/${offerId}`, body, etag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', propertyId] });
    },
  });
}
