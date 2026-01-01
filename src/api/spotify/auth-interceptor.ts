import { TokenResponse } from 'expo-auth-session/build/TokenRequest';
import * as SecureStore from 'expo-secure-store';

import { RequestConfig } from '@/api/http';
import {
  client_id,
  client_secret,
  discovery,
} from '@/auth/context/AuthSessionProvider';

export async function spotifyRequestInterceptor(
  config: RequestConfig
): Promise<RequestConfig> {
  const session = await SecureStore.getItemAsync('session');
  let token = new TokenResponse(JSON.parse(session || '{}'));
  if (token.shouldRefresh()) {
    let refreshedToken = await token.refreshAsync(
      {
        clientId: client_id,
        clientSecret: client_secret,
      },
      discovery
    );
    SecureStore.setItemAsync('session', JSON.stringify(refreshedToken));
    token = refreshedToken;
  }
  config.headers.Authorization = `Bearer ${token.accessToken}`;
  return config;
}
