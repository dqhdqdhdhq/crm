import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Auto-revive Date objects from JSON when the key name implies a date.
 */
function reviveDates(key: string, value: any): any {
  const isPossibleDateKey =
    /date$/i.test(key) || /At$/.test(key) || key.toLowerCase().includes('date');

  if (isPossibleDateKey && typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return value;
}

// Process-local pub/sub so multiple hook instances reading the same key stay in sync.
type Listener = (value: unknown) => void;
const listeners = new Map<string, Set<Listener>>();

function subscribe(key: string, fn: Listener) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) listeners.delete(key);
  };
}

function broadcast(key: string, value: unknown) {
  listeners.get(key)?.forEach((fn) => fn(value));
}

function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item, reviveDates) as T) : fallback;
  } catch (error) {
    console.error(`useLocalStorage: failed to read "${key}"`, error);
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => readFromStorage(key, initialValue));

  // Ref tracks the latest value so functional updates always compose against fresh state.
  const ref = useRef(storedValue);
  ref.current = storedValue;

  // Subscribe to in-process updates from other hook instances on the same key.
  useEffect(() => {
    const unsub = subscribe(key, (val) => {
      if (val !== ref.current) {
        ref.current = val as T;
        setStoredValue(val as T);
      }
    });
    return unsub;
  }, [key]);

  // Sync across tabs / windows via the native storage event.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;
      try {
        const next = e.newValue ? (JSON.parse(e.newValue, reviveDates) as T) : initialValue;
        if (next !== ref.current) {
          ref.current = next;
          setStoredValue(next);
        }
      } catch (err) {
        console.error(`useLocalStorage: failed to parse "${key}" from storage event`, err);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const next =
          typeof value === 'function'
            ? (value as (val: T) => T)(ref.current)
            : value;

        ref.current = next;
        setStoredValue(next);
        window.localStorage.setItem(key, JSON.stringify(next));
        broadcast(key, next);
      } catch (error) {
        console.error(`useLocalStorage: failed to write "${key}"`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
