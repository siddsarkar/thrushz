import { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { OverlayLoaderContext } from '@/contexts/OverlayLoaderContext';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { useThemeColors } from '@/theme/hooks/useTheme';

export const OverlayLoader = () => {
  const colors = useThemeColors();
  const context = useContext(OverlayLoaderContext);

  usePreventBackPress(context.loading);

  return (
    context.loading && (
      <View
        style={{
          zIndex: 2147483647,
          backgroundColor: colors.overlay,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  );
};
