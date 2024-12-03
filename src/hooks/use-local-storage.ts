'use client';

import { useEffect, useState } from 'react';

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void] {
  // State to store our value
  // Pass  initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      if (typeof window !== 'undefined') {
        // browser code
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return item ? JSON.parse(item) : initialValue;
      }
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // useEffect to update local storage when the state changes
  useEffect(() => {
    try {
      // Allow value to be a function so we have same API as useState
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const valueToStore = typeof storedValue === 'function' ? storedValue(storedValue) : storedValue;
      // Save state
      if (typeof window !== 'undefined') {
        // browser code
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error request
      console.log(error);
    }
  }, [key, storedValue]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return [storedValue, setStoredValue];
}

export default useLocalStorage;
