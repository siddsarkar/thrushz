import type { GetHomepageDataResponse } from '@/api/jiosaavn/dto/GetHomepageDataResponse';
import type { GetLaunchDataResponse } from '@/api/jiosaavn/dto/GetLaunchDataResponse';
import type { JiosaavnApiAlbum } from '@/api/jiosaavn/models/Album';
import type { JiosaavnApiArtist } from '@/api/jiosaavn/models/Artist';
import {
  type JiosaavnApiArtistMini,
  type JiosaavnApiItem,
} from '@/api/jiosaavn/models/Common';
import type { JiosaavnApiPlaylist } from '@/api/jiosaavn/models/Playlist';
import type { JiosaavnApiSong } from '@/api/jiosaavn/models/Song';
import type { JiosaavnPaginatedResponse } from '@/api/jiosaavn/types/PaginatedResponse';
import type { JiosaavnPaginationParams } from '@/api/jiosaavn/types/PaginationParams';

export class JiosaavnApiClient {
  private readonly baseUrl = 'https://www.jiosaavn.com';
  private readonly apiVersion = '4';
  private readonly ctx = 'web6dot0';
  private readonly format = 'json';
  private readonly marker = '0';

  // ---------- HELPERS ----------

  private buildPagination({
    page = 1,
    perPage = 10,
  }: JiosaavnPaginationParams = {}) {
    return { n: perPage, p: page };
  }

  private fetchFromWebApi<T>(
    type: string,
    token: string,
    opts?: JiosaavnPaginationParams,
  ) {
    return this.fetchData<T>({
      __call: 'webapi.get',
      type,
      token,
      ...this.buildPagination(opts),
    });
  }

  // ---------- CONTENT API ----------

  getHomepageData() {
    return this.fetchData<GetHomepageDataResponse>({
      __call: 'content.getHomepageData',
    });
  }

  getLaunchData() {
    return this.fetchData<GetLaunchDataResponse>({
      __call: 'webapi.getLaunchData',
    });
  }

  getTopSearches(opts?: JiosaavnPaginationParams) {
    return this.fetchData<JiosaavnApiItem[]>({
      __call: 'content.getTopSearches',
      ...this.buildPagination(opts),
    });
  }

  getRecommendations(pid: string) {
    return this.fetchData<JiosaavnApiSong[]>({
      __call: 'reco.getreco',
      pid,
    });
  }

  getSongDetailsById(songId: string | string[]) {
    return this.fetchData<{ songs: JiosaavnApiSong[] }>({
      __call: 'song.getDetails',
      pids: Array.isArray(songId) ? songId.join(',') : songId,
    });
  }

  // ---------- WEB API ----------

  getSongDetails(token: string, opts?: JiosaavnPaginationParams) {
    return this.fetchFromWebApi<{ songs: JiosaavnApiSong[] }>(
      'song',
      token,
      opts,
    );
  }

  getArtistDetails(token: string, opts?: JiosaavnPaginationParams) {
    return this.fetchFromWebApi<JiosaavnApiArtist>('artist', token, opts);
  }

  getAlbumDetails(token: string, opts?: JiosaavnPaginationParams) {
    return this.fetchFromWebApi<JiosaavnApiAlbum>('album', token, opts);
  }

  getPlaylistDetails(token: string, opts?: JiosaavnPaginationParams) {
    return this.fetchFromWebApi<JiosaavnApiPlaylist>('playlist', token, opts);
  }

  // ---------- SEARCH ----------

  private search<T>(
    call: string,
    query: string,
    opts?: JiosaavnPaginationParams,
  ) {
    return this.fetchData<JiosaavnPaginatedResponse<T>>({
      __call: call,
      q: query,
      ...this.buildPagination(opts),
    });
  }

  searchSongs(query: string, opts?: JiosaavnPaginationParams) {
    return this.search<JiosaavnApiSong>('search.getResults', query, opts);
  }

  searchAlbums(query: string, opts?: JiosaavnPaginationParams) {
    return this.search<JiosaavnApiAlbum>('search.getAlbumResults', query, opts);
  }

  searchPlaylists(query: string, opts?: JiosaavnPaginationParams) {
    return this.search<JiosaavnApiPlaylist>(
      'search.getPlaylistResults',
      query,
      opts,
    );
  }

  searchArtists(query: string, opts?: JiosaavnPaginationParams) {
    return this.search<JiosaavnApiArtistMini>(
      'search.getArtistResults',
      query,
      opts,
    );
  }

  // ---------- Core fetch ----------

  private fetchData<T>(queryParams: Record<string, unknown>): Promise<T> {
    const params: Record<string, string> = {
      ctx: this.ctx,
      api_version: this.apiVersion,
      _format: this.format,
      _marker: this.marker,
      ...queryParams,
    };

    const searchParams = new URLSearchParams(params);
    const paramsStr = searchParams.toString();
    console.log(paramsStr);

    return fetch(`${this.baseUrl}/api.php?${paramsStr}`).then((res) =>
      res.json(),
    );
  }
}
