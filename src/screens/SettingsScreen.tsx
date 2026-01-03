import Icon from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as Expo from 'expo';
import { Directory, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Pressable,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import { useSession } from '@/auth/context/AuthSessionProvider';
import { db } from '@/db';
import {
  downloadedSongsTable,
  downloadsTable,
  metadataTable,
  songsMetadataTable,
} from '@/db/schema';
import { ThemeMode, ThemeScheme } from '@/theme';
import {
  useTheme,
  useThemeColors,
  useThemeTypography,
} from '@/theme/hooks/useTheme';
import { formatBytes } from '@/utils/format/bytes';

type DownloadQuality = '320kbps' | '160kbps' | '96kbps' | '48kbps' | '12kbps';

export default function SettingsScreen() {
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const [downloadQuality, setDownloadQuality] =
    useState<DownloadQuality>('320kbps');

  const { scheme, setScheme, mode, setMode } = useTheme();
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
    Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      // Update has successfully downloaded; apply it now
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  // If true, we show the button to download and run the update
  const showDownloadButton = isUpdateAvailable;

  // Show whether or not we are running embedded code or an update
  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
    ? 'This app is running from built-in code'
    : 'This app is running on a update';

  const cacheSize = new Directory(Paths.cache).size || 0;

  const handleSignOut = () => {
    signOut();
  };

  const checkForUpdate = () => {
    Updates.checkForUpdateAsync()
      .then((update) => {
        if (update.isAvailable) {
          ToastAndroid.show('Update available', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('No update available', ToastAndroid.SHORT);
        }
      })
      .catch((error) => {
        ToastAndroid.show(
          error.message || 'Error checking for update',
          ToastAndroid.SHORT
        );
      });
  };

  const clearOfflineSongs = async () => {
    Alert.alert(
      'Are you sure?',
      'This will clear all offline songs and cache',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await TrackPlayer.stop();
              await TrackPlayer.reset();
              await db.delete(downloadedSongsTable);
              await db.delete(songsMetadataTable);
              await db.delete(metadataTable);
              await db.delete(downloadsTable);

              // delete the offline songs directory
              const dir = new Directory(Paths.cache);
              let size = formatBytes(dir.size || 0);

              dir.delete();

              await Expo.reloadAppAsync('Cache cleared!');
              ToastAndroid.show(
                'Freed up ' + size + ' of cache',
                ToastAndroid.SHORT
              );
            } catch (error) {
              console.error(error);
              ToastAndroid.show('Error clearing cache', ToastAndroid.SHORT);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        gap: 10,
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color={colors.text} />
      </Pressable>
      <Text style={[typography.h1, { color: colors.text }]}>Settings</Text>

      <View style={{ gap: 10 }}>
        <Button
          title={`Clear Cache (${formatBytes(cacheSize)})`}
          onPress={clearOfflineSongs}
        />
        <Button title="Sign out" onPress={handleSignOut} />

        <Text style={{ color: colors.text }}>{runTypeMessage}</Text>
        <Button onPress={checkForUpdate} title="Check manually for updates" />
        {showDownloadButton ? (
          <Button
            onPress={() => Updates.fetchUpdateAsync()}
            title="Download and run update"
          />
        ) : null}

        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.text }}>Theme</Text>
          <SegmentedControl
            appearance={mode === 'dark' ? 'light' : 'dark'}
            tintColor={colors.border}
            backgroundColor={colors.card}
            values={['light', 'dark', 'system'] as ThemeMode[]}
            selectedIndex={['light', 'dark', 'system'].indexOf(mode)}
            onChange={async (event) => {
              setMode(
                ['light', 'dark', 'system'][
                  event.nativeEvent.selectedSegmentIndex
                ] as ThemeMode
              );
            }}
          />
          <Text style={{ color: colors.text }}>Color scheme</Text>
          <SegmentedControl
            appearance={mode === 'dark' ? 'light' : 'dark'}
            tintColor={colors.border}
            backgroundColor={colors.card}
            values={['minimal', 'girly-pop', 'forest'] as ThemeScheme[]}
            selectedIndex={['minimal', 'girly-pop', 'forest'].indexOf(scheme)}
            onChange={async (event) => {
              setScheme(
                ['minimal', 'girly-pop', 'forest'][
                  event.nativeEvent.selectedSegmentIndex
                ] as ThemeScheme
              );
            }}
          />
          <Text style={{ color: colors.text }}>Download quality</Text>
          <SegmentedControl
            appearance={mode === 'dark' ? 'light' : 'dark'}
            tintColor={colors.border}
            backgroundColor={colors.card}
            values={['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']}
            selectedIndex={[
              '320kbps',
              '160kbps',
              '96kbps',
              '48kbps',
              '12kbps',
            ].indexOf(downloadQuality)}
            onChange={async (event) => {
              setDownloadQuality(
                ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'][
                  event.nativeEvent.selectedSegmentIndex
                ] as DownloadQuality
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}
