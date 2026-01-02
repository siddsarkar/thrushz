import { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/theme/hooks/useTheme';

export enum ANIMATION_DIRECTION {
  leftToRight = 'leftToRight',
  rightToLeft = 'rightToLeft',
  topToBottom = 'topToBottom',
  bottomToTop = 'bottomToTop',
}

export enum ANIMATION_TYPE {
  shiver = 'shiver',
  pulse = 'pulse',
}

interface SkeletonLoaderProps {
  height?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  direction?: ANIMATION_DIRECTION;
  animationType?: ANIMATION_TYPE;
}

export const SkeletonLoader = ({
  height,
  width,
  style,
}: SkeletonLoaderProps) => {
  const colors = useThemeColors();
  //to create pulse animation by increasing and decreasing opacity of parent
  const opacity = useSharedValue(1);

  useEffect(() => {
    //create pulse effect by repeating opacity animation
    opacity.value = withRepeat(
      withTiming(0.4, {
        duration: 500,
        easing: Easing.linear,
      }),
      -1,
      true
    );

    return () => {
      //cancel running animations after component unmounts
      cancelAnimation(opacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyleParent = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        { height, width, backgroundColor: colors.card },
        style,
        animatedStyleParent,
      ]}
    ></Animated.View>
  );
};
