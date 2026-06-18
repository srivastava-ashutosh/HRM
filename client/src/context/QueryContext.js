import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export { queryClient };

export const useApiQuery = (key, urlOrFn, options = {}) => {
  const queryFn = typeof urlOrFn === 'function'
    ? urlOrFn
    : () => api.get(urlOrFn).then(r => r.data);

  return queryClient.getQueryCache().build(queryClient, {
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    ...options,
  });
};

export const useApiMutation = (urlOrFn, options = {}) => {
  const mutationFn = typeof urlOrFn === 'function'
    ? urlOrFn
    : (data) => {
        const method = options.method || 'post';
        return api[method](urlOrFn, data).then(r => r.data);
      };

  return {
    mutate: async (variables) => {
      try {
        const result = await mutationFn(variables);
        if (options.onSuccess) options.onSuccess(result);
        if (options.invalidate) {
          const keys = Array.isArray(options.invalidate) ? options.invalidate : [options.invalidate];
          keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
        }
        return result;
      } catch (err) {
        if (options.onError) options.onError(err);
        throw err;
      }
    },
  };
};

export const QueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

export default queryClient;
