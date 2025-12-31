import { beforeAll, describe, expect, it } from '@jest/globals';

import { JiosaavnApiClient } from '@/api/jiosaavn';
import { GetHomepageDataSchema, GetLaunchDataSchema } from '@/api/jiosaavn/dto';
import {
  JiosaavnApiArtistSchema,
  JiosaavnApiItemSchema,
  JiosaavnApiSongSchema,
} from '@/api/jiosaavn/models';
import { JiosaavnPaginatedResponseSchema } from '@/api/jiosaavn/models/Common';

describe('JiosaavnApiClient Integration Tests', () => {
  let apiClient: JiosaavnApiClient;

  beforeAll(() => {
    apiClient = new JiosaavnApiClient();
  });

  describe('Content API', () => {
    it('getHomepageData() returns data matching GetHomepageDataSchema', async () => {
      const response = await apiClient.getHomepageData();

      expect(response).toBeDefined();

      const result = GetHomepageDataSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });

    it('getLaunchData() returns data matching GetLaunchDataSchema', async () => {
      const response = await apiClient.getLaunchData();

      expect(response).toBeDefined();

      const result = GetLaunchDataSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });

    it('getTopSearches() returns data matching JiosaavnApiItemSchema array', async () => {
      const response = await apiClient.getTopSearches();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      const ItemArraySchema = JiosaavnApiItemSchema.array();
      const result = ItemArraySchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });
  });

  describe('Search API', () => {
    it('searchSongs() returns paginated songs matching schema', async () => {
      const response = await apiClient.searchSongs('Tum Hi Ho', {
        page: 1,
        perPage: 5,
      });

      expect(response).toBeDefined();

      const PaginatedSongsSchema = JiosaavnPaginatedResponseSchema(
        JiosaavnApiSongSchema
      );
      const result = PaginatedSongsSchema.safeParse(response);
      if (!result.success) {
        throw result.error;
      }
      expect(result.success).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
    });

    it('searchAlbums() returns paginated albums matching schema', async () => {
      const response = await apiClient.searchAlbums('Rockstar', {
        page: 1,
        perPage: 5,
      });

      expect(response).toBeDefined();

      // For search results, albums are mini objects
      const PaginatedAlbumsSchema = JiosaavnPaginatedResponseSchema(
        JiosaavnApiItemSchema
      );
      const result = PaginatedAlbumsSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
    });

    it('searchPlaylists() returns paginated playlists matching schema', async () => {
      const response = await apiClient.searchPlaylists('Bollywood Hits', {
        page: 1,
        perPage: 5,
      });

      expect(response).toBeDefined();

      // For search results, playlists are mini objects
      const PaginatedPlaylistsSchema = JiosaavnPaginatedResponseSchema(
        JiosaavnApiItemSchema
      );
      const result = PaginatedPlaylistsSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
    });

    it('searchArtists() returns paginated artists matching schema', async () => {
      const response = await apiClient.searchArtists('AR Rahman', {
        page: 1,
        perPage: 5,
      });

      expect(response).toBeDefined();

      // For search results, artists are mini objects
      const PaginatedArtistsSchema = JiosaavnPaginatedResponseSchema(
        JiosaavnApiItemSchema
      );
      const result = PaginatedArtistsSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
    });
  });

  describe('Details API', () => {
    it('getSongDetailsById() returns song details matching JiosaavnApiSongSchema', async () => {
      // First search for a song to get a valid ID
      const searchResponse = await apiClient.searchSongs('Tum Hi Ho', {
        page: 1,
        perPage: 1,
      });

      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      const songId = searchResponse.results[0]?.id;
      if (!songId) {
        throw new Error('No song ID found');
      }
      const response = await apiClient.getSongDetailsById(songId);

      expect(response).toBeDefined();
      expect(response.songs).toBeDefined();
      expect(Array.isArray(response.songs)).toBe(true);

      if (response.songs.length > 0) {
        const SongsSchema = JiosaavnApiSongSchema.array();
        const result = SongsSchema.safeParse(response.songs);
        if (!result.success) {
          console.error(
            'Validation errors:',
            JSON.stringify(result.error.issues, null, 2)
          );
        }
        expect(result.success).toBe(true);
      }
    });

    it('getSongDetailsById() returns song details matching multiple song IDs', async () => {
      const searchResponse = await apiClient.searchSongs('Tum Hi Ho', {
        page: 1,
        perPage: 1,
      });
      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      const songIds = searchResponse.results.map((result) => result.id);
      if (!songIds.length) {
        throw new Error('No song IDs found');
      }
      const response = await apiClient.getSongDetailsById(songIds);
      expect(response).toBeDefined();
      expect(response.songs).toBeDefined();
      expect(Array.isArray(response.songs)).toBe(true);
    });

    it('getSongDetails() returns song details matching JiosaavnApiSongSchema', async () => {
      // Use a known song token - we'll extract from a search
      const searchResponse = await apiClient.searchSongs('Tum Hi Ho', {
        page: 1,
        perPage: 1,
      });
      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      const songId =
        searchResponse.results[0]?.perma_url.split('/').pop() || '';
      if (!songId) {
        throw new Error('No song ID found');
      }

      const response = await apiClient.getSongDetails(songId);

      expect(response).toBeDefined();
      expect(response.songs).toBeDefined();
      expect(Array.isArray(response.songs)).toBe(true);

      if (response.songs.length > 0) {
        const SongsSchema = JiosaavnApiSongSchema.array();
        const result = SongsSchema.safeParse(response.songs);
        if (!result.success) {
          console.error(
            'Validation errors:',
            JSON.stringify(result.error.issues, null, 2)
          );
        }
        expect(result.success).toBe(true);
      }
    });

    it('getPlaylistDetails() returns playlist with songs matching schema', async () => {
      // Use a known playlist token - we'll extract from a search
      const searchResponse = await apiClient.searchPlaylists('Top 50', {
        page: 1,
        perPage: 1,
      });
      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      // Extract token from perma_url
      const permaUrl = searchResponse.results[0]?.perma_url;
      if (!permaUrl) {
        throw new Error('No perma URL found');
      }
      const token = permaUrl.split('/').pop() || '';

      const response = await apiClient.getPlaylistDetails(token, {
        page: 1,
        perPage: 10,
      });

      expect(response).toBeDefined();
      expect(response.list).toBeDefined();
      expect(Array.isArray(response.list)).toBe(true);

      const result = JiosaavnApiSongSchema.array().safeParse(response.list);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });

    it('getAlbumDetails() returns album with songs matching schema', async () => {
      // Search for an album to get a valid token
      const searchResponse = await apiClient.searchAlbums('Aashiqui 2', {
        page: 1,
        perPage: 1,
      });
      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      // Extract token from perma_url
      const permaUrl = searchResponse.results[0]?.perma_url;
      if (!permaUrl) {
        throw new Error('No perma URL found');
      }
      const token = permaUrl.split('/').pop() || '';

      const response = await apiClient.getAlbumDetails(token, {
        page: 1,
        perPage: 10,
      });

      expect(response).toBeDefined();
      expect(response.list).toBeDefined();
      expect(Array.isArray(response.list)).toBe(true);

      const result = JiosaavnApiSongSchema.array().safeParse(response.list);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });

    it('getArtistDetails() returns artist matching schema', async () => {
      // Search for an artist to get a valid token
      const searchResponse = await apiClient.searchArtists('Arijit Singh', {
        page: 1,
        perPage: 1,
      });
      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      // Extract token from perma_url - artist search returns item-like objects
      const artist = searchResponse.results[0];
      if (!artist) {
        throw new Error('No artist found');
      }
      const permaUrl = artist.perma_url;
      if (!permaUrl) {
        throw new Error('No perma URL found');
      }
      const token = permaUrl.split('/').pop() || '';

      const response = await apiClient.getArtistDetails(token, {
        page: 1,
        perPage: 10,
      });

      expect(response).toBeDefined();
      expect(response.artistId).toBeDefined();

      const result = JiosaavnApiArtistSchema.safeParse(response);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });
  });

  describe('Recommendations API', () => {
    it('getRecommendations() returns songs matching schema', async () => {
      // First get a song ID
      const searchResponse = await apiClient.searchSongs('Kabira', {
        page: 1,
        perPage: 1,
      });
      expect(searchResponse).toBeDefined();
      expect(searchResponse.results).toBeDefined();
      expect(searchResponse.results.length).toBeGreaterThan(0);

      const songId = searchResponse.results[0]?.id;
      if (!songId) {
        throw new Error('No song ID found');
      }
      const songs = await apiClient.getRecommendations(songId);

      expect(songs).toBeDefined();
      expect(songs.length).toBeGreaterThan(0);

      const SongsSchema = JiosaavnApiSongSchema.array();
      const result = SongsSchema.safeParse(songs);
      if (!result.success) {
        console.error(
          'Validation errors:',
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });
  });
});
