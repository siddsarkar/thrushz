import type { SpotifyApiResponse } from '@/api/spotify/dto';
import type {
  SpotifyAuthUser,
  SpotifyPlaylist,
  SpotifyPlaylistDetails,
  SpotifyPlaylistDetailsWithFields,
  SpotifyPlaylistTrack,
} from '@/api/spotify/models';

export class SpotifyApiClient {
  private readonly baseUrl = 'https://api.spotify.com';

  private async request<T>(
    endpoint: string,
    params: Record<string, string>,
    options?: RequestInit
  ): Promise<T> {
    const searchParams = new URLSearchParams(params);
    const paramsStr = searchParams.toString();
    console.log('[SPOTIFY]', `${endpoint}${paramsStr}`);

    return fetch(`${this.baseUrl}${endpoint}?${paramsStr}`, options).then(
      (res) => res.json()
    ) as Promise<T>;
  }

  async fetchUserPlaylists(
    userId: string,
    options?: RequestInit
  ): Promise<SpotifyApiResponse<SpotifyPlaylist>> {
    return this.request<SpotifyApiResponse<SpotifyPlaylist>>(
      `/v1/users/${userId}/playlists`,
      { limit: '50', offset: '0' },
      options
    );
  }

  async fetchAllUserPlaylists(
    userId: string,
    options?: RequestInit
  ): Promise<SpotifyPlaylist[]> {
    const allPlaylists: SpotifyPlaylist[] = [];
    let offset = 0;
    let total = 1;

    while (offset < total) {
      const response = await this.request<SpotifyApiResponse<SpotifyPlaylist>>(
        `/v1/users/${userId}/playlists`,
        { limit: '50', offset: offset.toString() },
        options
      );

      allPlaylists.push(...response.items);
      total = response.total;
      offset += response.limit;
    }

    return allPlaylists;
  }

  async fetchPlaylistDetails<
    T extends readonly (keyof SpotifyPlaylistDetails)[] =
      readonly (keyof SpotifyPlaylistDetails)[],
  >(
    playlistId: string,
    fields?: T,
    options?: RequestInit
  ): Promise<SpotifyPlaylistDetailsWithFields<T>> {
    return this.request<SpotifyPlaylistDetailsWithFields<T>>(
      `/v1/playlists/${playlistId}`,
      {
        ...(fields ? { fields: fields.join(',') } : {}),
        limit: '50',
        offset: '0',
      },
      options
    );
  }

  async fetchPlaylistItems(
    playlistId: string,
    options?: RequestInit
  ): Promise<SpotifyApiResponse<SpotifyPlaylistTrack>> {
    return this.request<SpotifyApiResponse<SpotifyPlaylistTrack>>(
      `/v1/playlists/${playlistId}/tracks`,
      { limit: '50', offset: '0' },
      options
    );
  }

  async fetchAllItemsInPlaylist(
    playlistId: string,
    options?: RequestInit
  ): Promise<SpotifyPlaylistTrack[]> {
    const allItems: SpotifyPlaylistTrack[] = [];
    let offset = 0;
    let total = 1;

    while (offset < total) {
      const response = await this.request<
        SpotifyApiResponse<SpotifyPlaylistTrack>
      >(
        `/v1/playlists/${playlistId}/tracks`,
        { limit: '50', offset: offset.toString() },
        options
      );

      allItems.push(...response.items);
      total = response.total;
      offset += response.limit;
    }

    return allItems;
  }

  async fetchUserProfile(options?: RequestInit): Promise<SpotifyAuthUser> {
    return this.request<SpotifyAuthUser>('/v1/me', {}, options);
  }
}

export const spotifyApi = new SpotifyApiClient();
