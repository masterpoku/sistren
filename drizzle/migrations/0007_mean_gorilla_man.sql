CREATE TABLE `attendance` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`enrollment_id` bigint NOT NULL,
	`session_date` timestamp NOT NULL,
	`status` enum('present','sick','permit','absent','late') NOT NULL,
	`notes` text,
	`recorded_by_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_unique` UNIQUE(`enrollment_id`,`session_date`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '0e3e155c-f0a0-499a-8ef2-376ffd5fd342';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'd464de2d-e2de-4e1a-bf2f-91427c4913f5';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'd8606bbd-cadc-4d04-8b3c-51280c037c24';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '2a3765da-02e5-4a2e-bf84-f9869ce09144';--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_enrollment_id_enrollments_id_fk` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_recorded_by_id_users_id_fk` FOREIGN KEY (`recorded_by_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `attendance_enrollment_idx` ON `attendance` (`enrollment_id`);--> statement-breakpoint
CREATE INDEX `attendance_session_date_idx` ON `attendance` (`session_date`);