import { useSyncExternalStore } from 'react';

export const getLocalDateInputValue = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const combineLocalDateTime = (dateValue: string, timeValue: string): Date => {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeParts = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);

  if (!dateParts || !timeParts) {
    return new Date(Number.NaN);
  }

  const [, year, month, day] = dateParts;
  const [, hour, minute] = timeParts;
  const result = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

  if (
    result.getFullYear() !== Number(year) ||
    result.getMonth() !== Number(month) - 1 ||
    result.getDate() !== Number(day) ||
    result.getHours() !== Number(hour) ||
    result.getMinutes() !== Number(minute)
  ) {
    return new Date(Number.NaN);
  }

  return result;
};

const subscribeToLocalDate = (onStoreChange: () => void) => {
  const timer = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(timer);
};
const getServerDateInputValue = () => '';

export const useLocalDateInputValue = (): string =>
  useSyncExternalStore(subscribeToLocalDate, getLocalDateInputValue, getServerDateInputValue);
