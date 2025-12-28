import { z } from 'zod';

import { JiosaavnApiPlaylistMiniSchema } from '@/api/jiosaavn/models/Common';

export const GetHomepageDataSchema = z.object({
  featured_playlists: z.array(JiosaavnApiPlaylistMiniSchema),
});

export type GetHomepageDataResponse = z.infer<typeof GetHomepageDataSchema>;
