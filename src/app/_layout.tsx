import NetInfo from '@react-native-community/netinfo';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  Linking,
  Platform,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';

import { AuthSessionProvider } from '@/auth/context/AuthSessionProvider';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { OverlayLoader } from '@/components/ui/OverlayLoader';
import { OverlayLoaderProvider } from '@/contexts/OverlayLoaderContext';
import { useSetupPlayer } from '@/hooks/player/useSetupPlayer';
import { useDbInit } from '@/hooks/useDbInit';
import { HomeScreenSkeleton } from '@/screens/HomeScreen';
import { PlaybackService } from '@/services/playback/PlaybackService';
import { ThemeProvider } from '@/theme';
import { useTheme } from '@/theme/hooks/useTheme';

TrackPlayer.registerPlaybackService(() => PlaybackService);

SplashScreen.setOptions({ duration: 1000, fade: true });
SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://ee982592402fa1ed01fc7c47ada8bdc0@o4506185854156800.ingest.us.sentry.io/4509555266486272',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: false,

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

const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

function Inner() {
  const {
    isDark,
    theme: { colors },
  } = useTheme();

  const isPlayerReady = useSetupPlayer();
  const { isReady: isDbReady, error: dbError } = useDbInit();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => subscription.remove();
  }, []);

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
      text: colors.text,
      card: colors.card,
      border: colors.border,
      primary: colors.primary,
      background: colors.background,
      notification: colors.accent,
    },
  };

  if (dbError) {
    return <ErrorIndicator error={dbError.message} />;
  }

  if (!isPlayerReady || !isDbReady) {
    return <HomeScreenSkeleton />;
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

function ThemedBackground({ children }: { children: React.ReactNode }) {
  const {
    theme: { colors },
  } = useTheme();
  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      {children}
    </View>
  );
}

function RootLayout() {
  const isSystemInDark = useColorScheme() === 'dark';

  const onLayout = useCallback(() => {
    SplashScreen.hideAsync().catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <GestureHandlerRootView onLayout={onLayout}>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <ThemeProvider systemSchemeIsDark={isSystemInDark}>
            <ThemedBackground>
              <Inner />
            </ThemedBackground>
          </ThemeProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
