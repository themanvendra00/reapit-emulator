import { useMemo } from 'react';
import { useApiConfig } from './ApiConfigContext.jsx';
import { createApiClient } from './client.js';

export function useApiClient() {
  const { baseUrl } = useApiConfig();
  return useMemo(() => createApiClient(baseUrl), [baseUrl]);
}
