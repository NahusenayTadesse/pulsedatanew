-- The outbound mail record.
--
-- Additive and re-runnable, like `team-and-traffic.sql`, and written by hand for
-- the same reason: `drizzle-kit push` needs a TTY and offers to drop columns it
-- believes have drifted.
--
--   mysql "$DATABASE" < scripts/sent-emails.sql

CREATE TABLE IF NOT EXISTS `sent_emails` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`recipient` varchar(320) NOT NULL,
	`cc` varchar(500),
	`bcc` varchar(500),
	`subject` varchar(500) NOT NULL,
	`body_html` mediumtext NOT NULL,
	`body_text` mediumtext,
	`kind` enum('acknowledgement','notification','reply','composed','proposal','other') NOT NULL DEFAULT 'other',
	`status` enum('sent','failed') NOT NULL DEFAULT 'sent',
	`error` text,
	`message_id` varchar(255),
	`attachments` varchar(1000),
	`sent_by` varchar(160),
	`enquiry_id` int unsigned,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `sent_emails_created_idx` (`created_at`),
	KEY `sent_emails_status_idx` (`status`, `created_at`),
	KEY `sent_emails_enquiry_idx` (`enquiry_id`)
);
