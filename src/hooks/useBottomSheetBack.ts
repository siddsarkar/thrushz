import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/**
 * Hook that listens for the back button press and closes the bottom sheet modal if it's open.
 */
export const useBottomSheetBack = (
  bottomSheetOpen: boolean,
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>,
  onClose?: () => void
) => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (bottomSheetOpen && bottomSheetModalRef.current) {
          bottomSheetModalRef.current.close();
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
    }, [bottomSheetModalRef, bottomSheetOpen, onClose])
  );
};
