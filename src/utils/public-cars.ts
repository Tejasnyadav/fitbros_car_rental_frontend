import { cache } from 'react';
import type { Car } from '../types';

const isCar = (value: unknown): value is Car => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const car = value as Record<string, unknown>;
  return typeof car.id === 'string'
    && typeof car.name === 'string'
    && typeof car.type === 'string'
    && typeof car.transmission === 'string'
    && typeof car.pricePerDay === 'number'
    && typeof car.image === 'string'
    && car.status === 'AVAILABLE';
};

const getCarsEndpoint = () => {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const apiUrl = new URL(configuredApiUrl);
  const apiPath = apiUrl.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
  apiUrl.pathname = `${apiPath}/api/cars`;
  apiUrl.search = '';
  apiUrl.hash = '';
  return apiUrl;
};

export const getPublicCars = cache(async (): Promise<Car[]> => {
  const response = await fetch(getCarsEndpoint(), {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Failed to load public car listings (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !('cars' in payload) || !Array.isArray(payload.cars)) {
    throw new Error('The public car listings response has an invalid format.');
  }

  if (!payload.cars.every(isCar)) {
    throw new Error('The public car listings response contains an invalid vehicle.');
  }

  return payload.cars;
});

export const getPublicCar = async (id: string) => {
  const cars = await getPublicCars();
  return cars.find((car) => car.id === id) ?? null;
};
