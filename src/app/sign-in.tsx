import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect } from 'expo-router';

import { useSession } from '@/auth/context/AuthSessionProvider';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

export default function SignIn() {
  const { signIn, user, request } = useSession();
  const colors = useThemeColors();
  if (user) {
    return <Redirect href="/" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <FontAwesome name="spotify" size={24} color="white" />
      <Text
        style={{ color: colors.text }}
        disabled={!request}
        onPress={() => signIn()}
      >
        Sign In with Spotify
      </Text>
    </View>
  );
}
