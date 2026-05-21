ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'ec359880-c353-4ae7-be1b-de91049f6385';--> statement-breakpoint
ALTER TABLE `announcement_recipients` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `author_id` varchar(36);--> statement-breakpoint
ALTER TABLE `attachments` MODIFY COLUMN `uploaded_by` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_logs` MODIFY COLUMN `user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `enrollments` MODIFY COLUMN `student_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '9522aae6-a6d9-48e4-89e0-edefecbeb749';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'e7585342-7aca-4546-a793-665b2c6658db';--> statement-breakpoint
ALTER TABLE `profiles` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `student_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `profile_assets` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `verifications` ADD `id` varchar(36) DEFAULT '80fcfdb6-fe33-45d7-a388-61821174c48a' NOT NULL;