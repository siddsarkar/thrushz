import { z } from 'zod';

export const SpotifyExternalUrlsSchema = z.object({
  spotify: z.string(),
});

export const SpotifyFollowersSchema = z.object({
  href: z.string().nullable(),
  total: z.number(),
});

export const SpotifyImageSchema = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export const SpotifyUserSchema = z.object({
  external_urls: SpotifyExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  type: z.string(),
  uri: z.string(),
  display_name: z.string().optional().nullable(),
});

export type SpotifyExternalUrls = z.infer<typeof SpotifyExternalUrlsSchema>;
export type SpotifyFollowers = z.infer<typeof SpotifyFollowersSchema>;
export type SpotifyImage = z.infer<typeof SpotifyImageSchema>;
export type SpotifyUser = z.infer<typeof SpotifyUserSchema>;
