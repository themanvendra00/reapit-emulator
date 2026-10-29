import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

export function usePropertiesList({ page, pageSize, address, sellingStatus }) {
  const api = useApiClient();
  return useQuery({
    queryKey: [
      'properties',
      { page, pageSize, address, sellingStatus, baseUrl: api.baseUrl },
    ],
    queryFn: () =>
      api.getPaged(
        `/properties/${buildQuery({
          pageNumber: page,
          pageSize,
          address: address || undefined,
          sellingStatus: sellingStatus || undefined,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

export function useProperty(id) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['property', id, api.baseUrl],
    queryFn: () => api.get(`/properties/${id}`),
    enabled: !!id,
  });
}

export function useUpdateProperty() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body, etag }) => api.patch(`/properties/${id}`, body, etag),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}
