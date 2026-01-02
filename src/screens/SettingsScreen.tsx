import Icon from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Directory, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Button, Pressable, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/context/AuthSessionProvider';
import { ThemeMode, ThemeScheme } from '@/theme';
import {
  useTheme,
  useThemeColors,
  useThemeTypography,
} from '@/theme/hooks/useTheme';
import { formatBytes } from '@/utils/format/bytes';

export default function SettingsScreen() {
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

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

  const clearCache = () => {
    const dir = new Directory(Paths.cache);

    ToastAndroid.show(`${formatBytes(dir.size || 0)}`, ToastAndroid.SHORT);
    if (dir.exists) {
      const files = dir.list();
      for (const file of files) {
        file.delete();
      }
    }
  };

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
          title={`Clear cache (${formatBytes(cacheSize)})`}
          onPress={clearCache}
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
        </View>
      </View>
    </View>
  );
}
