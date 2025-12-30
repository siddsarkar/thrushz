import Icon from '@expo/vector-icons/Ionicons';
import { Directory, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Pressable, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/context/AuthSessionProvider';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatBytes } from '@/utils/format/bytes';

export default function SettingsScreen() {
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const [cacheSize, setCacheSize] = useState(
    new Directory(Paths.cache).size || 0
  );

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
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color={colors.text} />
      </Pressable>
      <Text style={[typography.h1, { color: colors.text }]}>Settings</Text>

      <View>
        <Button
          title={`Clear cache (${formatBytes(cacheSize)})`}
          onPress={clearCache}
        />
        <Button title="Sign out" onPress={handleSignOut} />
      </View>
    </View>
  );
}
