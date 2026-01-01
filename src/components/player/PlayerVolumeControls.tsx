import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

import { usePlayerVolume } from '@/hooks/player/usePlayerVolume';
import { useThemeColors } from '@/theme/hooks/useTheme';

export const PlayerVolumeControls = ({ style }: ViewProps) => {
  const colors = useThemeColors();
  const { textMuted: backgroundColor, text: color, text: colorAccent } = colors;

  const { volume, updateVolume } = usePlayerVolume();

  const isSliding = useSharedValue(false);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  useEffect(() => {
    if (!isSliding.value && volume !== undefined) {
      progress.value = volume;
    }

    // eslint-disable-next-line
  }, [volume]);

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name="volume-low"
          size={20}
          color={color}
          style={{ opacity: 0.8 }}
        />

        <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 10 }}>
          <Slider
            progress={progress}
            minimumValue={min}
            containerStyle={[
              styles.slider,
              {
                backgroundColor,
              },
            ]}
            onSlidingStart={() => (isSliding.value = true)}
            onValueChange={(value) => {
              updateVolume(value);
            }}
            renderBubble={() => null}
            theme={{
              maximumTrackTintColor: colorAccent,
              minimumTrackTintColor: colorAccent,
            }}
            thumbWidth={10}
            maximumValue={max}
          />
        </View>

        <Ionicons
          name="volume-high"
          size={20}
          color={color}
          style={{ opacity: 0.8 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 16,
    // backgroundColor: colors.sliderBackground,
    backgroundColor: 'white',
  },
});
