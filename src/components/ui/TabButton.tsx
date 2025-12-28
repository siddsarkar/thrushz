import { useThemeColors } from '@/theme/hooks/useTheme';
import IconPack from '@expo/vector-icons/FontAwesome';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, forwardRef, Ref } from 'react';
import { Pressable, Text, View } from 'react-native';

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
          // isFocused ? { backgroundColor: iconColor } : undefined,
        ]}
      >
        <IconPack
          name={icon}
          size={24}
          color={isFocused ? accentColor : iconColor}
        />
        {title && (
          <Text
            style={{ fontSize: 16, color: isFocused ? accentColor : iconColor }}
          >
            {title}
          </Text>
        )}
      </Pressable>
    );
  }
);

TabButton.displayName = 'TabButton';
