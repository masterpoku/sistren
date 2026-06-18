CREATE TABLE `school_documents` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`file_name` varchar(255) NOT NULL,
	`file_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`encrypted_data` longtext NOT NULL,
	`category` varchar(50),
	`is_public` boolean NOT NULL DEFAULT false,
	`uploaded_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `school_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '3c437d8f-0d56-45da-818f-0b2f73bfd86b';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'c9f663f2-beac-4c0f-964c-d55ba9ebfd3a';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'f9585b3a-12fe-46b0-b6c7-5d6d0cd68111';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'aadbf9d7-d6f6-47de-bc2e-faf7e625d977';--> statement-breakpoint
ALTER TABLE `school_documents` ADD CONSTRAINT `school_documents_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;