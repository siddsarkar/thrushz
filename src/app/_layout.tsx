import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Stack } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';

import { AuthSessionProvider } from '@/auth/context/AuthSessionProvider';
import { useSetupPlayer } from '@/hooks/player/useSetupPlayer';
import { PlaybackService } from '@/services/playback/PlaybackService';
import { ThemeProvider } from '@/theme';
import { useTheme } from '@/theme/hooks/useTheme';

TrackPlayer.registerPlaybackService(() => PlaybackService);

Sentry.init({
  dsn: 'https://ee982592402fa1ed01fc7c47ada8bdc0@o4506185854156800.ingest.us.sentry.io/4509555266486272',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const expo = SQLite.openDatabaseSync('db.db');
const db = drizzle(expo);

function RootLayoutInner() {
  const isPlayerReady = useSetupPlayer();
  const { isDark, theme } = useTheme();

  // Create navigation theme based on our theme
  const navigationTheme: ReactNavigation.Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      text: theme.colors.text,
      card: theme.colors.surface,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.error,
      background: theme.colors.background,
    },
  };

  if (!isPlayerReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

function RootLayout() {
  const isSystemInDark = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView>
      <AuthSessionProvider>
        <ThemeProvider systemSchemeIsDark={isSystemInDark}>
          <RootLayoutInner />
        </ThemeProvider>
      </AuthSessionProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
