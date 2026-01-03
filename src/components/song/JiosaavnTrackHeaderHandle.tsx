import {
  BottomSheetHandle,
  BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { JiosaavnApiSong } from '@/api';
import { ListItem } from '@/components/ui/ListItem';
import { useThemeColors } from '@/theme/hooks/useTheme';

const JiosaavnTrackHeaderHandleComponent = ({
  item,
  ...props
}: BottomSheetHandleProps & { item: JiosaavnApiSong | null }) => {
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
        title={item?.title || ''}
        image={item?.image || ''}
        description={item?.more_info.artistMap?.primary_artists[0]?.name || ''}
      />
    </BottomSheetHandle>
  );
};

export const JiosaavnTrackHeaderHandle = memo(
  JiosaavnTrackHeaderHandleComponent
);
