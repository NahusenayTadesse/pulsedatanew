-- Tables for the database-backed team and the built-in traffic counter.
--
-- Written by hand rather than pushed with `drizzle-kit push`, which needs a TTY
-- and offers to drop unrelated columns it thinks have drifted. These three
-- statements are additive: nothing existing is touched, and re-running them is
-- a no-op thanks to IF NOT EXISTS.
--
--   mysql "$DATABASE" < scripts/team-and-traffic.sql

CREATE TABLE IF NOT EXISTS `team_members` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(200) NOT NULL,
	`name_am` varchar(200),
	`role` varchar(200),
	`role_am` varchar(200),
	`bio` text,
	`bio_am` text,
	`photo` varchar(255),
	`photo_alt` varchar(255),
	`photo_alt_am` varchar(255),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `team_members_status_sort_idx` (`status`, `sort_order`)
);

CREATE TABLE IF NOT EXISTS `team_member_links` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`member_id` int unsigned NOT NULL,
	`platform` enum('linkedin','x','github','telegram','whatsapp','instagram','facebook','youtube','tiktok','website','email') NOT NULL,
	`url` varchar(500) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	KEY `team_member_links_member_idx` (`member_id`),
	CONSTRAINT `team_member_links_member_fk` FOREIGN KEY (`member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `page_views` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`path` varchar(191) NOT NULL,
	`locale` varchar(8) NOT NULL DEFAULT 'en',
	`visitor` varchar(64) NOT NULL,
	`referrer_host` varchar(191),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `page_views_created_idx` (`created_at`),
	KEY `page_views_path_idx` (`path`, `created_at`)
);
