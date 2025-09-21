'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ApiClient } from '@klynaa/api';

// Initialize the API client with Django backend URL
const apiClientInstance = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

const ApiClientContext = createContext<ApiClient>(apiClientInstance);

export const useApiClient = () => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context;
};

interface ApiClientProviderProps {
  children: ReactNode;
}

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  return (
    <ApiClientContext.Provider value={apiClientInstance}>
      {children}
    </ApiClientContext.Provider>
  );
};