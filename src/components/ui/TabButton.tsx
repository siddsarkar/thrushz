import IconPack from '@expo/vector-icons/Ionicons';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, forwardRef, Ref } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

type Icon = ComponentProps<typeof IconPack>['name'];

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: Icon;
  title?: string;
};

export const TabButton = forwardRef(
  ({ icon, title, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    const { accent: accentColor, icon: iconColor } = useThemeColors();
    return (
      <Pressable
        ref={ref}
        {...props}
        style={[
          {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 5,
            padding: 14,
          },
        ]}
      >
        <IconPack
          name={icon}
          size={24}
          color={isFocused ? accentColor : iconColor}
        />
        {title && (
          <Text
            style={{
              fontSize: 12,
              color: isFocused ? accentColor : iconColor,
              fontWeight: 600,
            }}
          >
            {title}
          </Text>
        )}
      </Pressable>
    );
  }
);

TabButton.displayName = 'TabButton';
