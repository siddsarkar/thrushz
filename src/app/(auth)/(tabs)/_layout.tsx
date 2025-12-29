import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrack } from 'react-native-track-player';

import { MiniPlayer } from '@/components/player/MiniPlayer';
import { NowPlayingSheet } from '@/components/player/NowPlayingSheet';
import { TabButton } from '@/components/ui/TabButton';
import { withModalProvider } from '@/hoc/withModalProvider';
import { useBottomSheetBack } from '@/hooks/useBottomSheetBack';

const TabLayout = withModalProvider(() => {
  const insets = useSafeAreaInsets();
  const track = useActiveTrack();

  // states
  const [backdropPressBehavior] = useState<'none' | 'close' | 'collapse'>(
    'close'
  );

  // refs
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  useBottomSheetBack(isBottomSheetOpen, bottomSheetRef, () =>
    setIsBottomSheetOpen(false)
  );

  // variables
  const snapPoints = useMemo(() => ['100%'], []);

  // region callbacks
  const handleDismiss = useCallback(() => {
    setIsBottomSheetOpen(false);
  }, []);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.present();
    setIsBottomSheetOpen(true);
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // renders
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={backdropPressBehavior}
        appearsOnIndex={1}
        disappearsOnIndex={-1}
      />
    ),
    [backdropPressBehavior]
  );

  return (
    <Tabs>
      <View style={{ flex: 1 }}>
        <TabSlot />
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          handleComponent={null}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
          onDismiss={handleDismiss}
        >
          <NowPlayingSheet track={track} onClosePress={handleClosePress} />
        </BottomSheetModal>
      </View>

      {/* A custom tab bar */}
      <View style={{ paddingBottom: insets.bottom }}>
        <MiniPlayer track={track} onPress={handlePresentPress} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}
        >
          <TabTrigger name="home" asChild>
            <TabButton icon="home" />
          </TabTrigger>
          <TabTrigger name="search" asChild>
            <TabButton icon="magnifying-glass" />
          </TabTrigger>
          <TabTrigger name="library" asChild>
            <TabButton icon="book" />
          </TabTrigger>
        </View>
      </View>

      <TabList style={{ display: 'none' }}>
        <TabTrigger name="home" href="/" />
        <TabTrigger name="search" href="/search" />
        <TabTrigger name="library" href="/library" />
      </TabList>
    </Tabs>
  );
});

export default TabLayout;
