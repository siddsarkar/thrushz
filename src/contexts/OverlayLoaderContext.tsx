import React, { createContext, useState } from 'react';

interface OverlayLoaderProviderProps {
  children: React.ReactNode;
}

interface OverlayLoaderContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const OverlayLoaderContext = createContext<OverlayLoaderContextType>({
  loading: false,
  setLoading: () => null,
});

export function OverlayLoaderProvider({
  children,
}: OverlayLoaderProviderProps) {
  const [loading, setLoading] = useState(false);

  return (
    <OverlayLoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </OverlayLoaderContext.Provider>
  );
}
