import { useState, useCallback } from "react";

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      try {
        return await fn();
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, withLoading };
}
