import { z } from 'zod';

import {
  SpotifyExternalUrlsSchema,
  SpotifyFollowersSchema,
  SpotifyImageSchema,
} from '@/api/spotify/models/User';

export const SpotifyAuthUserSchema = z.object({
  display_name: z.string(),
  email: z.string(),
  external_urls: SpotifyExternalUrlsSchema,
  followers: SpotifyFollowersSchema,
  href: z.string(),
  id: z.string(),
  images: z.array(SpotifyImageSchema),
  type: z.string(),
  uri: z.string(),
});

export type SpotifyAuthUser = z.infer<typeof SpotifyAuthUserSchema>;
