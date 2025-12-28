import { z } from 'zod';

import { JiosaavnApiPlaylistMiniSchema } from '@/api/jiosaavn/models/Common';
import { JiosaavnApiSongSchema } from '@/api/jiosaavn/models/Song';

export const JiosaavnApiPlaylistSchema = JiosaavnApiPlaylistMiniSchema.extend({
  header_desc: z.string(),
  image: z.string(),
  language: z.string(),
  year: z.string(),
  play_count: z.string(),
  explicit_content: z.string(),
  list_count: z.string(),
  list_type: z.string(),
  list: z.array(JiosaavnApiSongSchema),
  button_tooltip_info: z.array(z.string()),
});

export type JiosaavnApiPlaylist = z.infer<typeof JiosaavnApiPlaylistSchema>;
