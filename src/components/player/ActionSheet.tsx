import { useThemeColors } from '@/theme/hooks/useTheme';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { Button, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { Spacer } from './Spacer';

const onUpdateNotificationMetadata = async () => {
  const randomTitle = Math.random().toString(36).substring(7);
  await TrackPlayer.updateNowPlayingMetadata({
    title: `Random: ${randomTitle}`,
    artwork: `https://random.imagecdn.app/800/800?dummy=${Date.now()}`,
  });
};

const onUpdateCurrentTrackMetadata = async () => {
  const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
  if (currentTrackIndex !== undefined) {
    const randomTitle = Math.random().toString(36).substring(7);
    await TrackPlayer.updateMetadataForTrack(currentTrackIndex, {
      title: `Random: ${randomTitle}`,
      artwork: `https://random.imagecdn.app/800/800?dummy=${Date.now()}`,
      duration: Math.floor(Math.random()),
    });
  }
};

const onReset = async () => {
  await TrackPlayer.reset();
};

export const ActionSheet: React.FC = () => {
  const { accent: backgroundColor } = useThemeColors();
  return (
    <BottomSheetScrollView style={{ backgroundColor }}>
      <Spacer />
      <Button
        title={'Update Notification Metadata Randomly'}
        onPress={onUpdateNotificationMetadata}
      />
      <Button
        title={'Update Current Track Metadata Randomly'}
        onPress={onUpdateCurrentTrackMetadata}
      />
      <Button title={'Reset'} onPress={onReset} />
      <View style={{ height: 100 }} />
    </BottomSheetScrollView>
  );
};
