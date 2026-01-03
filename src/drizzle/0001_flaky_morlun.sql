CREATE TABLE `downloaded_songs_table` (
	`song_id` text NOT NULL,
	`download_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `downloads_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uri` text NOT NULL,
	`type` text NOT NULL,
	`duration` integer NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metadata_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`artwork` text NOT NULL,
	`duration` integer NOT NULL,
	`album` text NOT NULL,
	`year` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `songs_metadata_table` (
	`song_id` text NOT NULL,
	`metadata_id` integer NOT NULL
);
