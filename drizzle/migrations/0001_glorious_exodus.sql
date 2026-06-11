CREATE TABLE `calendar_events` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1000),
	`start_at` timestamp NOT NULL,
	`end_at` timestamp,
	`all_day` boolean DEFAULT false,
	`category` enum('academic','holiday','event','meeting','exam','other') DEFAULT 'event',
	`created_by_id` varchar(36),
	`is_public` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '5edc96c2-8300-4dd8-bf26-4ccbc0eab022';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '1df3b451-f9af-4b46-8957-fbfa949d14e3';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'bcd6c753-96e0-4013-972f-376de7c2b756';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '3dc838d0-c5eb-4ab2-a35e-19c98d3f47d9';--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `entity_id_str` varchar(36);--> statement-breakpoint
ALTER TABLE `grades` ADD `teacher_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `system_configs` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_teacher_id_users_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;