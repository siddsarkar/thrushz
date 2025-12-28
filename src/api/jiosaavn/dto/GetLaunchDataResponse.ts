import { z } from 'zod';

import {
  JiosaavnApiItemSchema,
  JiosaavnApiPlaylistMiniSchema,
} from '@/api/jiosaavn/models/Common';

export const GetLaunchDataSchema = z.object({
  new_trending: z.array(JiosaavnApiItemSchema),
  new_albums: z.array(JiosaavnApiItemSchema),
  top_playlists: z.array(JiosaavnApiPlaylistMiniSchema),
  charts: z.array(JiosaavnApiPlaylistMiniSchema),
});

export type GetLaunchDataResponse = z.infer<typeof GetLaunchDataSchema>;
