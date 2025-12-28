import { z } from 'zod';

import { SpotifyExternalUrlsSchema } from '@/api/spotify/models/User';

export const SpotifyArtistSchema = z.object({
  external_urls: SpotifyExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  name: z.string(),
  type: z.string(),
  uri: z.string(),
});

export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>;
