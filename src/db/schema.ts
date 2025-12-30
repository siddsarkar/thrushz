import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
});

export const playlistsSongsTable = sqliteTable('playlists_songs_table', {
  playlistId: text('playlist_id').notNull(),
  songId: text('song_id').notNull(),
});
