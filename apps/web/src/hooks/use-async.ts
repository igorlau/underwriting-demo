import { type DependencyList, useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

/**
 * Minimal read hook over the service layer. Deliberately not a data-fetching
 * library: the prototype needs loading and error states and nothing more.
 */
export function useAsync<T>(
  factory: () => Promise<T>,
  deps: DependencyList,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  });
  const [nonce, setNonce] = useState(0);

  // The factory is intentionally keyed on caller-supplied deps.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps are the cache key
  const run = useCallback(factory, [...deps, nonce]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: undefined, error: undefined });
    run()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data, error: undefined });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            data: undefined,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [run]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { ...state, reload };
}
