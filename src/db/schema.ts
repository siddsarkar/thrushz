import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
});

export const songsTable = sqliteTable('songs_table', {
  id: text('uuid').primaryKey(),
});

export const playlistsTable = sqliteTable('playlists_table', {
  id: text('uuid').primaryKey(),
  name: text().notNull(),
  image: text(),
  author: text(),
  offline: integer('offline').notNull().default(0),
});

export const playlistsSongsTable = sqliteTable('playlists_songs_table', {
  playlistId: text('playlist_id').notNull(),
  songId: text('song_id').notNull(),
});

export const metadataTable = sqliteTable('metadata_table', {
  id: int().primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  artwork: text('artwork').notNull(),
  duration: int('duration').notNull(),
  album: text('album').notNull(),
  year: text('year').notNull(),
});

export const downloadsTable = sqliteTable('downloads_table', {
  id: int().primaryKey({ autoIncrement: true }),
  uri: text('uri').notNull(),
  type: text('type').notNull(),
  duration: int('duration').notNull(),
  size: int('size').notNull(),
  createdAt: int('created_at').notNull(),
  updatedAt: int('updated_at').notNull(),
});

export const songsMetadataTable = sqliteTable('songs_metadata_table', {
  songId: text('song_id').notNull(),
  metadataId: int('metadata_id').notNull(),
});

export const downloadedSongsTable = sqliteTable('downloaded_songs_table', {
  songId: text('song_id').notNull(),
  downloadId: int('download_id').notNull(),
});
