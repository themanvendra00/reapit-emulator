import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

export function useVendorsList({ page, pageSize, email, name }) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['vendors', { page, pageSize, email, name, baseUrl: api.baseUrl }],
    queryFn: () =>
      api.getPaged(
        `/vendors/${buildQuery({
          pageNumber: page,
          pageSize,
          email: email || undefined,
          name: name || undefined,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

export function useVendor(id) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['vendor', id, api.baseUrl],
    queryFn: () => api.get(`/vendors/${id}`),
    enabled: !!id,
  });
}

export function useUpdateVendor() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body, etag }) => api.patch(`/vendors/${id}`, body, etag),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
    },
  });
}
