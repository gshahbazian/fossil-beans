CREATE TABLE `teams` (
	`team_id` integer PRIMARY KEY NOT NULL,
	`team_name` text NOT NULL,
	`abbreviation` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_team_name_unique` ON `teams` (`team_name`);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_abbreviation_unique` ON `teams` (`abbreviation`);
--> statement-breakpoint
CREATE TABLE `games` (
	`game_id` text PRIMARY KEY NOT NULL,
	`game_time` integer NOT NULL,
	`pst_date` text NOT NULL,
	`home_team_id` integer NOT NULL,
	`away_team_id` integer NOT NULL,
	`home_score` integer DEFAULT 0 NOT NULL,
	`away_score` integer DEFAULT 0 NOT NULL,
	`game_status` text,
	`period` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_games_pst_date` ON `games` (`pst_date`);
--> statement-breakpoint
CREATE TABLE `players` (
	`player_id` integer PRIMARY KEY NOT NULL,
	`player_name` text NOT NULL,
	`jersey_num` text,
	`position` text,
	`height` text,
	`team_id` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_stats` (
	`game_id` text NOT NULL,
	`player_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`minutes_seconds` integer DEFAULT 0,
	`points` integer,
	`rebounds` integer,
	`assists` integer,
	`steals` integer,
	`blocks` integer,
	`field_goals_made` integer,
	`field_goals_attempted` integer,
	`three_pointers_made` integer,
	`three_pointers_attempted` integer,
	`free_throws_made` integer,
	`free_throws_attempted` integer,
	`turnovers` integer,
	`fouls` integer,
	`plus_minus` integer,
	`espn_points` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `player_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`game_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_player_stats_order` ON `player_stats` (`espn_points` DESC, `minutes_seconds` DESC, `player_id`);
