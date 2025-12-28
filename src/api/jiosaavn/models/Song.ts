import { z } from 'zod';

import {
  JiosaavnApiArtistMapSchema,
  JiosaavnApiSongRightsSchema,
} from '@/api/jiosaavn/models/Common';

export const JiosaavnApiSongMoreInfoSchema = z.object({
  music: z.string().optional(),
  album_id: z.string().optional(),
  album: z.string().optional(),
  label: z.string().optional(),
  label_id: z.string().nullable().optional(),
  origin: z.string().optional(),
  is_dolby_content: z.boolean().optional(),
  '320kbps': z.string().optional(),
  encrypted_media_url: z.string().optional(),
  encrypted_cache_url: z.string().optional(),
  encrypted_drm_cache_url: z.string().optional(),
  encrypted_drm_media_url: z.string().optional(),
  album_url: z.string().optional(),
  duration: z.string().optional(),
  rights: JiosaavnApiSongRightsSchema.optional(),
  cache_state: z.string().optional(),
  has_lyrics: z.string().optional(),
  lyrics_snippet: z.string().optional(),
  starred: z.string().optional(),
  copyright_text: z.string().optional(),
  artistMap: JiosaavnApiArtistMapSchema.optional(),
  release_date: z.string().nullable().optional(),
  label_url: z.string().optional(),
  vcode: z.string().optional(),
  vlink: z.string().optional(),
  triller_available: z.boolean().optional(),
  request_jiotune_flag: z.boolean().optional(),
  webp: z.string().optional(),
  lyrics_id: z.string().optional(),
});

export const JiosaavnApiSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  header_desc: z.string(),
  type: z.string(),
  perma_url: z.string(),
  image: z.string(),
  language: z.string(),
  year: z.string(),
  play_count: z.string(),
  explicit_content: z.string(),
  list_count: z.string(),
  list_type: z.string(),
  list: z.string(),
  more_info: JiosaavnApiSongMoreInfoSchema,
  button_tooltip_info: z.array(z.string()),
});

export type JiosaavnApiSong = z.infer<typeof JiosaavnApiSongSchema>;
