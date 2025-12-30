import NetInfo from '@react-native-community/netinfo';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Linking,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';

import { AuthSessionProvider } from '@/auth/context/AuthSessionProvider';
import { OverlayLoader } from '@/components/ui/OverlayLoader';
import { OverlayLoaderProvider } from '@/contexts/OverlayLoaderContext';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { useSetupPlayer } from '@/hooks/player/useSetupPlayer';
import { PlaybackService } from '@/services/playback/PlaybackService';
import { ThemeProvider } from '@/theme';
import { useTheme, useThemeColors } from '@/theme/hooks/useTheme';

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

function RootLayoutInner() {
  const isPlayerReady = useSetupPlayer();
  const { isDark, theme } = useTheme();
  const colors = useThemeColors();
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      console.log('deepLinkHandler', data.url);
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    // When you launch the closed app from the notification or any other link
    Linking.getInitialURL().then((url) => console.log('getInitialURL', url));

    return () => {
      subscription.remove();
    };
  }, []);

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

  if (error) {
    return (
      <View>
        <Text style={{ color: colors.text }}>
          Migration error: {error.message}
        </Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View>
        <Text style={{ color: colors.text }}>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <OverlayLoaderProvider>
      <NavigationThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack>
      </NavigationThemeProvider>
      <OverlayLoader />
    </OverlayLoaderProvider>
  );
}

// Create a client
const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function RootLayout() {
  const isSystemInDark = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <ThemeProvider systemSchemeIsDark={isSystemInDark}>
            <RootLayoutInner />
          </ThemeProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
