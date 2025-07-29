import { useState, useEffect } from 'react';

// Helper function to revive Date objects from JSON
function reviveDates(key: string, value: any): any {
  // Automatically revive any key that looks like a date field
  // e.g. createdAt, updatedAt, startDate, nextBillingDate, dueDate, etc.
  const isPossibleDateKey = /date$/i.test(key) || /At$/.test(key) || key.toLowerCase().includes('date');
  
  if (isPossibleDateKey && typeof value === 'string') {
    const date = new Date(value);
    // Check if it's a valid date
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, reviveDates) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}