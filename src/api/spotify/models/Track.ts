import { z } from 'zod';

import {
  SpotifyAlbumSchema,
  SpotifyRestrictionSchema,
} from '@/api/spotify/models/Album';
import { SpotifyArtistSchema } from '@/api/spotify/models/Artist';
import { SpotifyExternalUrlsSchema } from '@/api/spotify/models/User';

export const SpotifyExternalIdsSchema = z.object({
  isrc: z.string().optional(),
  ean: z.string().optional(),
  upc: z.string().optional(),
});

export const SpotifyTrackSchema = z.object({
  album: SpotifyAlbumSchema,
  artists: z.array(SpotifyArtistSchema),
  available_markets: z.array(z.string()),
  disc_number: z.number(),
  duration_ms: z.number(),
  explicit: z.boolean(),
  external_ids: SpotifyExternalIdsSchema,
  external_urls: SpotifyExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  is_playable: z.boolean().optional(),
  linked_from: z.object({}).optional(),
  restrictions: SpotifyRestrictionSchema.optional(),
  name: z.string(),
  popularity: z.number(),
  preview_url: z.string().nullable(),
  track_number: z.number(),
  type: z.string(),
  uri: z.string(),
  is_local: z.boolean(),
});

export type SpotifyExternalIds = z.infer<typeof SpotifyExternalIdsSchema>;
export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
