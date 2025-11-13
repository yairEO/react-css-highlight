import { useEffect, useState } from "react";

/**
 * Debounces a value by delaying its update until after the specified delay.
 * Useful for optimizing performance when values change frequently.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (0 = no debounce)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * // debouncedSearch updates 300ms after searchTerm stops changing
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // No debounce if delay is 0 or negative
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
