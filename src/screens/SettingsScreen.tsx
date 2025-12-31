import Icon from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Directory, Paths } from 'expo-file-system';
import { router } from 'expo-router';
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

        <View style={{ gap: 10 }}>
          <SegmentedControl
            appearance={'dark'}
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
          <SegmentedControl
            appearance={'dark'}
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
        </View>
      </View>
    </View>
  );
}
