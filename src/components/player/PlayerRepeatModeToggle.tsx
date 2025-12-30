import Icon from '@expo/vector-icons/Ionicons';
import { ComponentProps, useCallback, useEffect, useState } from 'react';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';

import { useThemeColors } from '@/theme/hooks/useTheme';

export const useTrackPlayerRepeatMode = () => {
  const [repeatMode, setRepeatMode] = useState<RepeatMode>();

  const changeRepeatMode = useCallback(async (repeatMode: RepeatMode) => {
    await TrackPlayer.setRepeatMode(repeatMode);

    setRepeatMode(repeatMode);
  }, []);

  useEffect(() => {
    TrackPlayer.getRepeatMode().then(setRepeatMode);
  }, []);

  return { repeatMode, changeRepeatMode };
};

type IconProps = Omit<ComponentProps<typeof Icon>, 'name'>;
type IconName = ComponentProps<typeof Icon>['name'];

const repeatOrder = [
  RepeatMode.Off,
  RepeatMode.Track,
  RepeatMode.Queue,
] as const;

export const PlayerRepeatModeToggle = ({ ...iconProps }: IconProps) => {
  const colors = useThemeColors();
  const { repeatMode, changeRepeatMode } = useTrackPlayerRepeatMode();

  const toggleRepeatMode = () => {
    if (repeatMode == null) return;

    const currentIndex = repeatOrder.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % repeatOrder.length;

    changeRepeatMode(repeatOrder[nextIndex]);
  };

  const icon: IconName =
    repeatMode === RepeatMode.Off
      ? 'repeat-outline'
      : repeatMode === RepeatMode.Track
      ? 'repeat-sharp'
      : repeatMode === RepeatMode.Queue
      ? 'repeat'
      : 'eye-off';

  return (
    <Icon
      name={icon}
      onPress={toggleRepeatMode}
      color={colors.text}
      {...iconProps}
    />
  );
};
