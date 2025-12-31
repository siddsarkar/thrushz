import { z } from 'zod';

export const SpotifyApiResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    href: z.string(),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
    items: z.array(itemSchema),
  });

export type SpotifyApiResponse<T> = {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
};
