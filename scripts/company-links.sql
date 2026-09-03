-- The company's own social profiles, shown in the site footer.
--
-- Written by hand rather than pushed with `drizzle-kit push`, for the reason
-- given in `team-and-traffic.sql`: push needs a TTY and offers to drop
-- unrelated columns it thinks have drifted. This statement is additive —
-- nothing existing is touched, and re-running it is a no-op thanks to
-- IF NOT EXISTS.
--
--   mysql "$DATABASE" < scripts/company-links.sql
--
-- The `platform` enum must stay in step with `socialPlatforms` in
-- `src/lib/social.ts`; adding a platform there is an ALTER here.

CREATE TABLE IF NOT EXISTS `company_links` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`platform` enum('linkedin','x','github','telegram','whatsapp','instagram','facebook','youtube','tiktok','website','email') NOT NULL,
	`url` varchar(500) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	KEY `company_links_sort_idx` (`sort_order`)
);
