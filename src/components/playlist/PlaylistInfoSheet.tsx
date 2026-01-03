import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { decode } from 'html-entities';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      </View>
    </BottomSheetScrollView>
  );
}

function InfoRow({
  label,
  value,
  colors,
  typography,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
  typography: ReturnType<typeof useThemeTypography>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text
        style={[typography.caption, { color: colors.textMuted, flex: 0.3 }]}
      >
        {label}:
      </Text>
      <Text style={[typography.body, { color: colors.text, flex: 0.7 }]}>
        {decode(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    paddingHorizontal: 16,
  },
  artwork: {
    width: '90%',
    aspectRatio: 1,
    marginTop: '2%',
    marginBottom: '5%',
  },
  titleText: {
    // textAlign: 'center',
    fontWeight: '600',
    marginTop: 30,
  },
  subtitleText: {
    // textAlign: 'center',
    marginTop: 8,
  },
  artistText: {
    // textAlign: 'center',
    fontWeight: '200',
    marginTop: '2%',
  },
  infoSection: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    // alignItems: 'flex-start',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
