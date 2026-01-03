import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/db';
import { playlistsTable } from '@/db/schema';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

function ListItemButton({
  Icon,
  title,
  onPress,
}: {
  Icon: React.ReactNode;
  title: string;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        {Icon}
      </View>
      <Text style={{ color: colors.text }}>{title}</Text>
    </Pressable>
  );
}

export function PlaylistInfoSheet({
  playlist,
  onDeletePlaylistPress,
}: {
  playlist: typeof playlistsTable.$inferSelect;
  onDeletePlaylistPress?: () => void;
}) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { card: backgroundColor } = colors;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    data: [offlinePlaylist],
  } = useLiveQuery(
    db
      .select()
      .from(playlistsTable)
      .where(
        and(eq(playlistsTable.id, playlist.id), eq(playlistsTable.offline, 1))
      ),
    [playlist.id]
  );

  const onToggleOfflinePress = useCallback(async () => {
    console.log('keep offline');

    // grab offline status
    const dbPlaylist = await db
      .select()
      .from(playlistsTable)
      .where(eq(playlistsTable.id, playlist.id));

    if (dbPlaylist.length > 0) {
      const offlinePlaylist = dbPlaylist[0];
      if (offlinePlaylist.offline === 1) {
        await db
          .update(playlistsTable)
          .set({ offline: 0 })
          .where(eq(playlistsTable.id, playlist.id));
        console.log('removed from offline');
      } else {
        await db
          .update(playlistsTable)
          .set({ offline: 1 })
          .where(eq(playlistsTable.id, playlist.id));
        console.log('added to offline');
      }
    }
  }, [playlist.id]);

  const isOffline = !!offlinePlaylist;

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor }}
    >
      <View
        style={{
          paddingTop: insets.top,
          minHeight: windowHeight - insets.bottom - insets.top,
        }}
      >
        <ListItemButton
          Icon={<MaterialIcons name="delete" size={24} color={colors.text} />}
          title="Delete playlist"
          onPress={onDeletePlaylistPress}
        />
        <ListItemButton
          Icon={
            <MaterialIcons
              name={isOffline ? 'cloud-off' : 'cloud'}
              size={24}
              color={colors.text}
            />
          }
          title={isOffline ? 'Remove from offline' : 'Keep offline'}
          onPress={onToggleOfflinePress}
        />
      </View>
    </BottomSheetScrollView>
  );
}
