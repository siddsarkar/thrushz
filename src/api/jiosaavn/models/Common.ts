import { z } from 'zod';

// ----- Base Schemas -----
export const JiosaavnApiItemTypeEnum = z.enum([
  'playlist',
  'artist',
  'album',
  'song',
  'mix',
  'show',
  'channel',
  'radio_station',
]);

export const JiosaavnApiItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  name: z.string().optional(),
  subtitle: z.string().optional(),
  type: JiosaavnApiItemTypeEnum,
  image: z.string(),
  perma_url: z.string(),
  explicit_content: z.string().optional(),
  mini_obj: z.boolean().optional(),
});

export const JiosaavnApiSongRightsSchema = z.object({
  code: z.string(),
  cacheable: z.string(),
  delete_cached_object: z.string(),
  reason: z.string(),
});

export const JiosaavnApiArtistMiniSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  image: z.string(),
  type: JiosaavnApiItemTypeEnum,
  perma_url: z.string(),
});

export const JiosaavnApiArtistMapSchema = z.object({
  primary_artists: z.array(JiosaavnApiArtistMiniSchema),
  featured_artists: z.array(JiosaavnApiArtistMiniSchema),
  artists: z.array(JiosaavnApiArtistMiniSchema),
});

// ---------- More Info Schemas ----------

export const JiosaavnApiPlaylistMiniMoreInfoSchema = z.object({
  song_count: z.string().optional(),
  firstname: z.string().optional(),
  follower_count: z.string().optional(),
  last_updated: z.string().optional(),
  uid: z.string().optional(),
});

export const JiosaavnApiAlbumMiniMoreInfoSchema = z.object({
  song_count: z.string(),
  release_date: z.string().optional(),
  artistMap: JiosaavnApiArtistMapSchema,
});

// ---------- Mini Schemas ----------

export const JiosaavnApiPlaylistMiniSchema = JiosaavnApiItemSchema.extend({
  more_info: JiosaavnApiPlaylistMiniMoreInfoSchema,
});

export const JiosaavnApiAlbumMiniSchema = JiosaavnApiItemSchema.extend({
  more_info: JiosaavnApiAlbumMiniMoreInfoSchema,
});

// ----- Export Types -----

export type JiosaavnApiItem = z.infer<typeof JiosaavnApiItemSchema>;
export type JiosaavnApiArtistMini = z.infer<typeof JiosaavnApiArtistMiniSchema>;
export type JiosaavnApiPlaylistMini = z.infer<
  typeof JiosaavnApiPlaylistMiniSchema
>;
export type JiosaavnApiAlbumMini = z.infer<typeof JiosaavnApiAlbumMiniSchema>;

// ---------- Paginated Response Schemas ----------

export const JiosaavnPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    total: z.number(),
    start: z.number(),
    results: z.array(itemSchema),
  });
