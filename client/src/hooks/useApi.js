import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useApi = (requestFn, { immediate = false, onSuccess, onError, showToast = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const toast = useToast();
  const mountedRef = useRef(true);
  const toastRef = useRef(toast);

  useEffect(() => { toastRef.current = toast; }, [toast]);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn(...args);
      if (mountedRef.current) {
        setData(result.data ?? result);
        setLoading(false);
        onSuccess?.(result.data ?? result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        const msg = err.normalizedMessage || err.response?.data?.message || err.message || 'An error occurred';
        setError(msg);
        setLoading(false);
        if (showToast) toastRef.current?.error(msg);
        onError?.(err);
      }
      throw err;
    }
  }, [requestFn, onSuccess, onError, showToast]);

  useEffect(() => {
    if (immediate) execute().catch(() => {});
    return () => { mountedRef.current = false; };
  }, [immediate]);

  return { data, loading, error, execute, setData };
};

export const useFetch = (url, options = {}) => {
  const { immediate = true, params, ...rest } = options;
  const fn = useCallback((p) => api.get(url, { params: p || params }), [url, JSON.stringify(params)]);
  return useApi(fn, { ...rest, immediate });
};

export default useApi;
