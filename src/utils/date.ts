import { useSyncExternalStore } from 'react';

export const getLocalDateInputValue = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const subscribeToLocalDate = () => () => {};
const getServerDateInputValue = () => '';

export const useLocalDateInputValue = (): string =>
  useSyncExternalStore(subscribeToLocalDate, getLocalDateInputValue, getServerDateInputValue);
