import { z } from 'zod';

import { SpotifyApiResponseSchema } from '@/api/spotify/dto';
import { SpotifyTrackSchema } from '@/api/spotify/models/Track';
import {
  SpotifyExternalUrlsSchema,
  SpotifyImageSchema,
  SpotifyUserSchema,
} from '@/api/spotify/models/User';

export const SpotifyPlaylistTrackSchema = z.object({
  added_at: z.string(),
  added_by: SpotifyUserSchema,
  is_local: z.boolean(),
  track: SpotifyTrackSchema,
});

export const SpotifyPlaylistDetailsSchema = z.object({
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
  tracks: SpotifyApiResponseSchema(SpotifyPlaylistTrackSchema),
  type: z.string(),
  uri: z.string(),
});

export type SpotifyPlaylistTrack = z.infer<typeof SpotifyPlaylistTrackSchema>;
export type SpotifyPlaylistDetails = z.infer<
  typeof SpotifyPlaylistDetailsSchema
>;
export type SpotifyPlaylistDetailsWithFields<
  T extends readonly (keyof SpotifyPlaylistDetails)[],
> = Pick<SpotifyPlaylistDetails, T[number]>;
