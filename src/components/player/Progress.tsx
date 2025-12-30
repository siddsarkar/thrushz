import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import TrackPlayer, { useProgress } from 'react-native-track-player';

import { Spacer } from '@/components/player/Spacer';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export const Progress = ({ live }: { live?: boolean }) => {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { position, duration } = useProgress();

  const isSliding = useSharedValue(false);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  useEffect(() => {
    if (!isSliding.value) {
      progress.value = duration > 0 ? position / duration : 0;
    }

    // eslint-disable-next-line
  }, [duration, position]);

  return (
    <View style={styles.container}>
      {live || duration === Infinity ? (
        <Text
          style={[typography.body, styles.liveText, { color: colors.text }]}
        >
          Live Stream
        </Text>
      ) : (
        <View style={{ width: '90%' }}>
          <Slider
            progress={progress}
            minimumValue={min}
            maximumValue={max}
            containerStyle={{ borderRadius: 4 }}
            // containerStyle={[styles.slider, { backgroundColor: colors.border }]}
            thumbWidth={12}
            renderBubble={() => null}
            theme={{
              minimumTrackTintColor: colors.text,
              maximumTrackTintColor: colors.textMuted,
            }}
            onSlidingStart={() => (isSliding.value = true)}
            onValueChange={async (value) => {
              await TrackPlayer.seekTo(value * duration);
              progress.value = value;
            }}
            onSlidingComplete={async (value) => {
              if (!isSliding.value) return;
              isSliding.value = false;
              await TrackPlayer.seekTo(value * duration);
            }}
          />

          <View style={styles.labelContainer}>
            <Text
              style={[
                typography.body,
                styles.labelText,
                { color: colors.textSecondary },
              ]}
            >
              {formatSeconds(position)}
            </Text>
            <Spacer mode={'expand'} />
            <Text
              style={[
                typography.body,
                styles.labelText,
                { color: colors.textSecondary },
              ]}
            >
              -{formatSeconds(Math.max(0, duration - position))}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const formatSeconds = (time: number) =>
  new Date(time * 1000).toISOString().slice(14, 19);

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveText: {
    alignSelf: 'center',
  },
  slider: {
    height: 40,
    marginTop: 25,
    flexDirection: 'row',
  },
  labelContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  labelText: {
    fontVariant: ['tabular-nums'],
  },
});

// import React, { useEffect } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Slider } from 'react-native-awesome-slider';
// import { useSharedValue } from 'react-native-reanimated';
// import TrackPlayer, { useProgress } from 'react-native-track-player';

// import { ThemedText } from '@/components/ui/base/ThemedText';
// import { useThemeColor } from '@/hooks/useThemeColor';
// import { formatSecondsToMinutes } from '@/utils';

// export const PlayerProgressBar: React.FC<{ live?: boolean }> = ({ live }) => {
//   const { duration, position } = useProgress(250);
//   const backgroundColor = useThemeColor(
//     {
//       light: 'rgba(0, 0, 0, 0.1)',
//       dark: 'rgba(255, 255, 255, 0.1)',
//     },
//     'background',
//   );

//   const color = useThemeColor({}, 'accent');

//   const isSliding = useSharedValue(false);
//   const progress = useSharedValue(0);
//   const min = useSharedValue(0);
//   const max = useSharedValue(1);

//   const trackElapsedTime = formatSecondsToMinutes(position);
//   const trackRemainingTime = formatSecondsToMinutes(duration - position);

//   useEffect(() => {
//     if (!isSliding.value) {
//       progress.value = duration > 0 ? position / duration : 0;
//     }

//     // eslint-disable-next-line
//   }, [duration, position]);

//   return (
//     <View style={{ width: '90%', margin: 'auto' }}>
//       {live ? (
//         <ThemedText style={{ textAlign: 'center' }}>Live</ThemedText>
//       ) : (
//         <>
//           <Slider
//             progress={progress}
//             minimumValue={min}
//             maximumValue={max}
//             containerStyle={{
//               ...styles.slider,
//               backgroundColor,
//             }}
//             thumbWidth={10}
//             renderBubble={() => null}
//             theme={{
//               minimumTrackTintColor: color,
//               maximumTrackTintColor: color,
//             }}
//             onSlidingStart={() => (isSliding.value = true)}
//             onValueChange={async (value) => {
//               // await TrackPlayer.seekTo(value * duration);
//               progress.value = value;
//             }}
//             onSlidingComplete={async (value) => {
//               // if the user is not sliding, we should not update the position
//               if (!isSliding.value) return;

//               isSliding.value = false;

//               await TrackPlayer.seekTo(value * duration);
//             }}
//           />

//           <View style={styles.timeRow}>
//             <ThemedText style={styles.timeText}>{trackElapsedTime}</ThemedText>

//             <ThemedText style={styles.timeText}>
//               {'-'} {trackRemainingTime}
//             </ThemedText>
//           </View>
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   slider: {
//     height: 4,
//     borderRadius: 2,
//     marginHorizontal: 16,
//     // backgroundColor: colors.sliderBackground,
//     backgroundColor: 'white',
//   },
//   timeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'baseline',
//     // marginTop: 20,
//   },
//   timeText: {
//     // color: colors.text,
//     opacity: 0.75,
//     // fontSize: fontSize.xs,
//     letterSpacing: 0.7,
//     fontWeight: '500',
//     fontSize: 12,
//   },
// });
