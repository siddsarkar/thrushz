import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import dotenv from 'dotenv';

import { SpotifyApiClient } from '@/api/spotify/client';
import {
  SpotifyPlaylistDetailsSchema,
  SpotifyPlaylistSchema,
  SpotifyPlaylistTrackSchema,
  type SpotifyPlaylistDetailsWithFields,
} from '@/api/spotify/models';

// mock the auth interceptor, not needed for tests
jest.mock('@/api/spotify/auth-interceptor', () => ({
  spotifyRequestInterceptor: jest.fn(),
}));

dotenv.config({ path: ['.env.local'] });

const CLIENT_ID = process.env.TESTS_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.TESTS_SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.TESTS_SPOTIFY_REFRESH_TOKEN!;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  throw new Error('Missing Spotify credentials');
}

interface TokenResponse {
  scope: string;
  token_type: string;
  access_token: string;
  expires_in: number;
}

/**
 * Uses a refresh token to obtain a new access token.
 * This allows tests to access user-specific endpoints like /v1/me
 */
async function obtainAccessTokenWithRefreshToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to refresh token: ${response.status} ${response.statusText}`
    );
  }

  const data: TokenResponse = await response.json();
  return data.access_token;
}

describe('SpotifyApiClient', () => {
  let client: SpotifyApiClient;
  let userId: string;
  let options: RequestInit = {};

  beforeAll(async () => {
    try {
      const accessToken = await obtainAccessTokenWithRefreshToken();
      options = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      client = new SpotifyApiClient();

      const userResponse = await client.fetchUserProfile(options);
      userId = userResponse.id;
    } catch (error) {
      console.error('Error fetching user profile', error);
      throw error;
    }
  });

  describe('Playlist API', () => {
    it('fetchPlaylistDetails() handles undefined fields parameter', async () => {
      // const userPlaylists = await client.fetchUserPlaylists(userId, options);
      // const playlistId = userPlaylists.items[0]?.id ?? '';
      // if (!playlistId) {
      //   throw new Error('No playlist found');
      // }
      const playlistId = '4MwUfOcEXKsnYmi2cX48j9';
      // Call without fields parameter to test the false branch
      const response = await client.fetchPlaylistDetails(
        playlistId,
        undefined,
        options
      );
      expect(response.name).toBeDefined();
    });

    it('fetchUserPlaylists() returns data matching SpotifyPlaylistSchema', async () => {
      const response = await client.fetchUserPlaylists(userId, options);
      expect(response.items.length).toBeGreaterThan(0);

      // schema validation
      const result = response.items.map((item) =>
        SpotifyPlaylistSchema.safeParse(item)
      );
      expect(result.every((r) => r.success)).toBe(true);
    });

    it('fetchAllUserPlaylists() returns data matching SpotifyPlaylistSchema', async () => {
      const response = await client.fetchAllUserPlaylists(userId, options);
      expect(response.length).toBeGreaterThan(0);

      // schema validation
      const result = response.map((item) =>
        SpotifyPlaylistSchema.safeParse(item)
      );
      expect(result.every((r) => r.success)).toBe(true);
    });

    it('fetchPlaylistDetails() returns data matching SpotifyPlaylistDetailsSchema', async () => {
      const userPlaylists = await client.fetchUserPlaylists(userId, options);
      const playlistId = userPlaylists.items[0]?.id ?? '';
      if (!playlistId) {
        throw new Error('No playlist found');
      }
      const response = await client.fetchPlaylistDetails(
        playlistId,
        undefined,
        options
      );
      expect(response.name).toBeDefined();
      expect(response.images.length).toBeGreaterThan(0);

      // schema validation
      const result = SpotifyPlaylistDetailsSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });

    it('fetchPlaylistDetails() returns data matching SpotifyPlaylistDetailsSchema with fields parameter', async () => {
      const userPlaylists = await client.fetchUserPlaylists(userId, options);
      const playlistId = userPlaylists.items[0]?.id ?? '';
      if (!playlistId) {
        throw new Error('No playlist found');
      }

      const response: SpotifyPlaylistDetailsWithFields<['name', 'images']> =
        await client.fetchPlaylistDetails(
          playlistId,
          ['name', 'images'],
          options
        );

      expect(response.name).toBeDefined();
      expect(response.images.length).toBeGreaterThan(0);
    });

    it('fetchAllItemsInPlaylist() returns data matching SpotifyPlaylistTrackSchema', async () => {
      const userPlaylists = await client.fetchUserPlaylists(userId, options);
      const playlistId = userPlaylists.items[0]?.id ?? '';
      if (!playlistId) {
        throw new Error('No playlist found');
      }
      const response = await client.fetchAllItemsInPlaylist(
        playlistId,
        options
      );
      expect(response.length).toBeGreaterThan(0);
    });

    it('fetchPlaylistItems() returns data matching SpotifyPlaylistTrackSchema', async () => {
      const userPlaylists = await client.fetchUserPlaylists(userId, options);
      const playlistId = userPlaylists.items[0]?.id ?? '';
      if (!playlistId) {
        throw new Error('No playlist found');
      }
      const response = await client.fetchPlaylistItems(playlistId, options);
      expect(response.items.length).toBeGreaterThan(0);

      // schema validation
      const result = response.items.map((item) =>
        SpotifyPlaylistTrackSchema.safeParse(item)
      );
      expect(result.every((r) => r.success)).toBe(true);
    });
  });
});
