CREATE TABLE `payment_items` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`standard_price` decimal(10,2) NOT NULL,
	`type` enum('recurring','one_time','variable') DEFAULT 'one_time',
	`semester_id` bigint,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `payment_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_items_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '2fa2ab24-ab8a-4357-8f93-893dc2b1112e';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '8278d77f-9228-4a75-a417-50da617e023c';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '37449567-107d-42af-9f70-b41221c6bf70';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'dea83e31-0c12-4641-bbd1-a91cee723ffb';--> statement-breakpoint
ALTER TABLE `payments` ADD `payment_item_id` bigint;--> statement-breakpoint
ALTER TABLE `payment_items` ADD CONSTRAINT `payment_items_semester_id_semesters_id_fk` FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_payment_item_id_payment_items_id_fk` FOREIGN KEY (`payment_item_id`) REFERENCES `payment_items`(`id`) ON DELETE no action ON UPDATE no action;