-- The client logo band, and portraits on testimonials.
--
-- Written by hand rather than pushed with `drizzle-kit push`, for the reason
-- given in `team-and-traffic.sql`: push needs a TTY and offers to drop
-- unrelated columns it thinks have drifted. Everything here is additive —
-- nothing existing is touched, and re-running it is a no-op.
--
--   mysql "$DATABASE" < scripts/clients-and-quote-photos.sql
--
-- MariaDB supports `ADD COLUMN IF NOT EXISTS`; MySQL proper does not. If this
-- is ever run against MySQL, drop the `IF NOT EXISTS` and run it once.

-- ---------------------------------------------------------------------------
-- Clients — the marks in the "trusted by" band on the home page.
-- ---------------------------------------------------------------------------
--
-- `logo` is NOT NULL: a row here exists to put a mark on the page, and a
-- client with no logo has nothing to contribute to a logo band.
--
-- `project_id` is ON DELETE SET NULL, matching `testimonials`: withdrawing a
-- case study does not withdraw permission to show the client's mark.

CREATE TABLE IF NOT EXISTS `clients` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(200) NOT NULL,
	`name_am` varchar(200),
	`logo` varchar(255) NOT NULL,
	`logo_alt` varchar(255),
	`logo_alt_am` varchar(255),
	`note` varchar(255),
	`note_am` varchar(255),
	`website_url` varchar(500),
	`project_id` int unsigned,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `clients_status_sort_idx` (`status`, `sort_order`),
	KEY `clients_project_idx` (`project_id`),
	CONSTRAINT `clients_project_id_fk` FOREIGN KEY (`project_id`)
		REFERENCES `projects` (`id`) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- A portrait of whoever gave the quote.
-- ---------------------------------------------------------------------------
--
-- Beside the existing logo columns rather than in place of them: the logo says
-- which company stands behind the words, the portrait says a specific person
-- did, and a quote carrying both is worth more than either alone.

ALTER TABLE `testimonials`
	ADD COLUMN IF NOT EXISTS `photo` varchar(255) AFTER `logo_alt_am`,
	ADD COLUMN IF NOT EXISTS `photo_alt` varchar(255) AFTER `photo`,
	ADD COLUMN IF NOT EXISTS `photo_alt_am` varchar(255) AFTER `photo_alt`;
