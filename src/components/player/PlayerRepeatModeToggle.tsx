import Icon from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { RepeatMode } from 'react-native-track-player';

import { usePlayerRepeatMode } from '@/hooks/player/usePlayerRepeatMode';
import { useThemeColors } from '@/theme/hooks/useTheme';

type IconProps = Omit<ComponentProps<typeof Icon>, 'name'>;
type IconName = ComponentProps<typeof Icon>['name'];

const repeatOrder = [
  RepeatMode.Off,
  RepeatMode.Track,
  RepeatMode.Queue,
] as const;

export const PlayerRepeatModeToggle = ({ ...iconProps }: IconProps) => {
  const colors = useThemeColors();
  const { repeatMode, changeRepeatMode } = usePlayerRepeatMode();

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
