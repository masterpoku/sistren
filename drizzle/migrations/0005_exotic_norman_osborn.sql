CREATE TABLE `payment_slips` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`payment_id` bigint NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`encrypted_data` longtext NOT NULL,
	`slip_filename` varchar(255) NOT NULL,
	`file_size` bigint NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewed_by` varchar(36),
	`reviewed_at` timestamp,
	`rejection_reason` longtext,
	`deleted_at` timestamp,
	CONSTRAINT `payment_slips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'f385c911-d7b2-4b7c-99c4-5a49ea838118';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '18bfd95d-ee12-4e68-88d6-37035300f27b';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '3038948a-2595-41cd-950f-0ebef2f044f4';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '04647901-84fd-4a83-acac-cb4ab5cfeaab';--> statement-breakpoint
ALTER TABLE `payment_slips` ADD CONSTRAINT `payment_slips_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_slips` ADD CONSTRAINT `payment_slips_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payment_slips_payment_idx` ON `payment_slips` (`payment_id`);--> statement-breakpoint
CREATE INDEX `payment_slips_student_idx` ON `payment_slips` (`student_id`);--> statement-breakpoint
CREATE INDEX `payment_slips_status_idx` ON `payment_slips` (`status`);