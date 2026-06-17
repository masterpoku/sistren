CREATE TABLE `notifications` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('announcement','grade','payment','system') DEFAULT 'system',
	`entity_id` bigint,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_roles_id_fk`;
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'c82a8b5d-0eb6-435c-97c0-306d920af16d';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'ec0041d8-a4c3-4881-b44f-64a5e6919e87';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '7e37ea5b-28bd-4958-842e-5185eaf242b6';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'db53bd6e-d923-4306-b6f9-21e8bfae5bf1';--> statement-breakpoint
ALTER TABLE `announcement_recipients` ADD PRIMARY KEY(`announcement_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `announcement_recipients` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `profile_assets` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ar_user_idx` ON `announcement_recipients` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `calendar_events_created_by_idx` ON `calendar_events` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `enrollments_student_idx` ON `enrollments` (`student_id`);--> statement-breakpoint
CREATE INDEX `grades_teacher_idx` ON `grades` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `payments_student_idx` ON `payments` (`student_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `tcs_teacher_idx` ON `teacher_class_subjects` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `tcs_class_idx` ON `teacher_class_subjects` (`class_id`);--> statement-breakpoint
CREATE INDEX `tcs_semester_idx` ON `teacher_class_subjects` (`semester_id`);