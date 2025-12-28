import { z } from 'zod';

import { SpotifyArtistSchema } from '@/api/spotify/models/Artist';
import {
  SpotifyExternalUrlsSchema,
  SpotifyImageSchema,
} from '@/api/spotify/models/User';

export const SpotifyReleaseDatePrecisionEnum = z.enum(['year', 'month', 'day']);

export const SpotifyRestrictionSchema = z.object({
  reason: z.string(),
});

export const SpotifyAlbumSchema = z.object({
  album_type: z.string(),
  total_tracks: z.number(),
  available_markets: z.array(z.string()),
  external_urls: SpotifyExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  images: z.array(SpotifyImageSchema),
  name: z.string(),
  release_date: z.string(),
  release_date_precision: SpotifyReleaseDatePrecisionEnum,
  restrictions: SpotifyRestrictionSchema.optional(),
  type: z.string(),
  uri: z.string(),
  artists: z.array(SpotifyArtistSchema),
});

export type SpotifyReleaseDatePrecision = z.infer<
  typeof SpotifyReleaseDatePrecisionEnum
>;
export type SpotifyRestriction = z.infer<typeof SpotifyRestrictionSchema>;
export type SpotifyAlbum = z.infer<typeof SpotifyAlbumSchema>;
