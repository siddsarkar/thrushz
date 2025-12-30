import React from 'react';

import { OverlayLoaderContext } from '@/contexts/OverlayLoaderContext';

export function useOverlayLoader() {
  const context = React.useContext(OverlayLoaderContext);
  if (!context) {
    throw new Error(
      'useOverlayLoader must be used within a OverlayLoaderProvider'
    );
  }
  return context;
}
