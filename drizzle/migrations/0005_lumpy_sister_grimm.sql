ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '6bb16502-3c7c-43f9-97e0-637859b6e715';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'd11c2d5f-a8ea-4f46-919c-d6c58eac1004';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '6354557d-ebd8-4734-9c89-2b30b5752647';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'b1882d2c-59c1-4b96-85e8-226ebc4bcf32';--> statement-breakpoint
ALTER TABLE `enrollments` ADD `status` enum('active','transferred','dropped','graduated') DEFAULT 'active' NOT NULL;