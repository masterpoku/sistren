ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '67f61e2b-b0c5-4702-9532-bc4c7f796650';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '4ad7f0bb-7c6e-49ac-92c9-83250cd1e2dd';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '790e1b5e-fa76-46cb-89a3-8f25599d2820';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '47e448a9-0ce1-4439-b573-ab0e2a513160';--> statement-breakpoint
ALTER TABLE `profiles` ADD `verification_status` varchar(20) DEFAULT 'draft';