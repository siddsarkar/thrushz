import {
  AccessTokenRequest,
  AuthRequest,
  DiscoveryDocument,
  fetchUserInfoAsync,
  makeRedirectUri,
  TokenResponse,
  useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { UserInfo } from '@/auth/types/UserInfo';
import { useStorageState } from '@/hooks/useStorageState';

WebBrowser.maybeCompleteAuthSession();

// Spotify API discovery document
export const discovery: DiscoveryDocument = {
  userInfoEndpoint: 'https://api.spotify.com/v1/me',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
};

// Spotify API credentials
export const client_id = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
export const client_secret = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET!;

type AuthContextType = {
  token: string | null;
  signIn: () => void;
  signOut: () => void;
  user?: UserInfo | null;
  request?: AuthRequest | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  signIn: () => null,
  signOut: () => null,
  isLoading: true,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [[isLoadingSession, session], setSession] = useStorageState('session');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      usePKCE: false,
      clientId: client_id,
      redirectUri: makeRedirectUri({ scheme: 'siddsarkar' }),
      scopes: [
        'user-read-email',
        'playlist-modify-public',
        'playlist-read-private',
        'playlist-read-collaborative',
      ],
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      let tokenRequest = new AccessTokenRequest({
        code: code,
        clientId: client_id,
        clientSecret: client_secret,
        redirectUri: makeRedirectUri({ scheme: 'siddsarkar' }),
      });

      tokenRequest.performAsync(discovery).then((tokenResponse) => {
        setSession(JSON.stringify(tokenResponse));

        fetchUserInfoAsync(tokenResponse, discovery).then((userInfo) => {
          setUser(userInfo as UserInfo);
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  useEffect(() => {
    if (isLoadingSession === false) {
      if (!session) {
        setIsLoading(false);
        return;
      }

      let token = new TokenResponse(JSON.parse(session));

      if (token.shouldRefresh()) {
        console.log('Token needs refresh, refreshing..');

        token
          .refreshAsync(
            {
              clientId: client_id,
              clientSecret: client_secret,
            },
            discovery
          )
          .then((refreshedToken) => {
            token = refreshedToken;
            console.log('Token refreshed!');

            setSession(JSON.stringify(refreshedToken));

            fetchUserInfoAsync(refreshedToken, discovery)
              .then((userInfo) => {
                setUser(userInfo as UserInfo);
              })
              .finally(() => {
                setIsLoading(false);
              });
          })
          .catch((error) => {
            console.error('Exception: Token Refresh Error => ', error);
            setSession(null);
            setUser(null);
            setIsLoading(false);
          });

        return;
      }

      console.log('Token still valid, fetching user info..');

      fetchUserInfoAsync(token, discovery)
        .then((user) => {
          if (user.error) {
            console.error('Exception: User Info Error => ', user.error);
            return;
          }

          console.log('User fetched!');
          setUser(user as UserInfo);
        })
        .catch(console.error)
        .finally(() => {
          console.log('Session loaded!');
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingSession]);

  const token = useMemo(() => {
    if (!session) return null;
    let token = new TokenResponse(JSON.parse(session));
    return token.accessToken;
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        token,
        signIn: promptAsync,
        signOut: () => {
          setSession(null);
          setUser(null);
        },
        user,
        request,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
