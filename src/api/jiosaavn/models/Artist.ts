import { z } from 'zod';

import { JiosaavnApiAlbumMiniSchema } from '@/api/jiosaavn/models/Common';
import { JiosaavnApiSongSchema } from '@/api/jiosaavn/models/Song';

export const JiosaavnApiArtistSchema = z.object({
  artistId: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string(),
  follower_count: z.string(),
  type: z.string(),
  isVerified: z.boolean(),
  dominantLanguage: z.string(),
  dominantType: z.string(),
  topSongs: z.array(JiosaavnApiSongSchema),
  topAlbums: z.array(JiosaavnApiAlbumMiniSchema),
});

export type JiosaavnApiArtist = z.infer<typeof JiosaavnApiArtistSchema>;
