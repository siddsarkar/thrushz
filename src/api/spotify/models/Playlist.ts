import { z } from 'zod';

import {
  SpotifyExternalUrlsSchema,
  SpotifyImageSchema,
  SpotifyUserSchema,
} from '@/api/spotify/models/User';

export const SpotifyTracksSchema = z.object({
  href: z.string(),
  total: z.number(),
});

export const SpotifyPlaylistSchema = z.object({
  collaborative: z.boolean(),
  description: z.string(),
  external_urls: SpotifyExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  images: z.array(SpotifyImageSchema),
  name: z.string(),
  owner: SpotifyUserSchema,
  public: z.boolean(),
  snapshot_id: z.string(),
  tracks: SpotifyTracksSchema,
  type: z.string(),
  uri: z.string(),
});

export type SpotifyTracks = z.infer<typeof SpotifyTracksSchema>;
export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>;
