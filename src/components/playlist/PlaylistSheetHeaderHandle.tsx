import {
  BottomSheetHandle,
  BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { ListItem } from '@/components/ui/ListItem';
import { playlistsTable } from '@/db/schema';
import { useThemeColors } from '@/theme/hooks/useTheme';

const PlaylistSheetHeaderHandleComponent = ({
  playlist,
  ...props
}: BottomSheetHandleProps & {
  playlist: typeof playlistsTable.$inferSelect | null;
}) => {
  const colors = useThemeColors();
  const { card: backgroundColor, text: indicatorColor } = colors;

  return (
    <BottomSheetHandle
      {...props}
      indicatorStyle={{ height: 4, backgroundColor: indicatorColor }}
      style={{
        height: 80,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        zIndex: 99999,
        backgroundColor: backgroundColor,
      }}
    >
      <ListItem
        title={playlist?.name || ''}
        image={playlist?.image || ''}
        description="playlist by you"
      />
    </BottomSheetHandle>
  );
};

export const PlaylistSheetHeaderHandle = memo(
  PlaylistSheetHeaderHandleComponent
);
