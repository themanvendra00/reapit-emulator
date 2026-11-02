import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../api/useApiClient.js';
import { buildQuery } from '../../api/client.js';

export function usePropertiesList({ page, pageSize, address, sellingStatus, vendorId }) {
  const api = useApiClient();
  return useQuery({
    queryKey: [
      'properties',
      { page, pageSize, address, sellingStatus, vendorId, baseUrl: api.baseUrl },
    ],
    queryFn: async () => {
      if (!vendorId) {
        return api.getPaged(
          `/properties/${buildQuery({
            pageNumber: page,
            pageSize,
            address: address || undefined,
            sellingStatus: sellingStatus || undefined,
          })}`,
        );
      }

      // The emulator's /properties endpoint doesn't support filtering by
      // vendor server-side, so pull every page (still scoped by address /
      // sellingStatus, which it does honour) and filter + paginate here.
      const fetchSize = 100;
      const first = await api.getPaged(
        `/properties/${buildQuery({
          pageNumber: 1,
          pageSize: fetchSize,
          address: address || undefined,
          sellingStatus: sellingStatus || undefined,
        })}`,
      );
      const rest = await Promise.all(
        Array.from({ length: first.totalPageCount - 1 }, (_, i) =>
          api.getPaged(
            `/properties/${buildQuery({
              pageNumber: i + 2,
              pageSize: fetchSize,
              address: address || undefined,
              sellingStatus: sellingStatus || undefined,
            })}`,
          ),
        ),
      );
      const matching = [first, ...rest]
        .flatMap((p) => p.items)
        .filter((p) => p.selling?.vendorId === vendorId);

      const totalCount = matching.length;
      const totalPageCount = Math.max(1, Math.ceil(totalCount / pageSize));
      const start = (page - 1) * pageSize;
      return {
        items: matching.slice(start, start + pageSize),
        totalCount,
        totalPageCount,
        pageNumber: page,
        pageSize,
      };
    },
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
