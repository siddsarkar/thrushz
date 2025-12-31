import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/**
 * Hook that listens for the back button press.
 */
export const usePreventBackPress = (
  preventBackPress: boolean,
  onClose?: () => void
) => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (preventBackPress) {
          onClose?.();
          return true;
        } else {
          return false;
        }
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [preventBackPress, onClose])
  );
};
