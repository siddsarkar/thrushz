import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/context/AuthSessionProvider';
import { db } from '@/db';
import { playlistsTable } from '@/db/schema';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { uuidv4 } from '@/utils/uuid';

export default function PlaylistCreateScreen() {
  const { user } = useSession();
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const insets = useSafeAreaInsets();

  const [playlistName, setPlaylistName] = useState('');

  const handleCreatePlaylist = useCallback(() => {
    let id = uuidv4();
    db.insert(playlistsTable)
      .values({
        id: id,
        name: playlistName,
        image: null,
        author: user?.id,
      })
      .then((result) => {
        console.log('playlist created', result);
        if (result.lastInsertRowId) {
          router.replace(
            {
              pathname: '/playlist/[id]',
              params: { id },
            },
            { relativeToDirectory: true }
          );
        }
      });
  }, [playlistName, user?.id]);

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top + 16, paddingHorizontal: 16 }}
    >
      <Text style={[typography.h6, { color: colors.text }]}>
        Create Playlist
      </Text>
      <View style={{ marginVertical: 16 }}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          placeholder="Enter playlist name"
          value={playlistName}
          onChangeText={setPlaylistName}
          style={{
            color: colors.text,
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 8,
          }}
        />
      </View>
      <Button title="Create" onPress={handleCreatePlaylist} />
    </View>
  );
}
