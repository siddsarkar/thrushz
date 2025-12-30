CREATE TABLE `playlists_songs_table` (
	`playlist_id` text NOT NULL,
	`song_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlists_table` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`author` text
);
--> statement-breakpoint
CREATE TABLE `songs_table` (
	`uuid` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);