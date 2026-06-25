CREATE TABLE `rpp_documents` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`teacher_id` varchar(36) NOT NULL,
	`class_id` bigint NOT NULL,
	`subject_id` bigint NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`file_name` varchar(255) NOT NULL,
	`file_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`encrypted_data` longtext NOT NULL,
	`status` enum('draft','submitted','approved','rejected','archived') NOT NULL DEFAULT 'draft',
	`reviewed_by` varchar(36),
	`reviewed_at` timestamp,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `rpp_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '7bf5aa52-211e-4ac8-a36d-554b1643cfd1';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'fc88eca4-5919-4dc6-bad9-3520839a6e14';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '6a77bc80-7657-4415-8a96-82ecc0892802';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'bdd558fe-4db2-47e6-af66-bf04c995462a';--> statement-breakpoint
ALTER TABLE `rpp_documents` ADD CONSTRAINT `rpp_documents_teacher_id_users_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rpp_documents` ADD CONSTRAINT `rpp_documents_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rpp_documents` ADD CONSTRAINT `rpp_documents_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rpp_documents` ADD CONSTRAINT `rpp_documents_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `rpp_documents_teacher_idx` ON `rpp_documents` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `rpp_documents_class_idx` ON `rpp_documents` (`class_id`);--> statement-breakpoint
CREATE INDEX `rpp_documents_subject_idx` ON `rpp_documents` (`subject_id`);--> statement-breakpoint
CREATE INDEX `rpp_documents_status_idx` ON `rpp_documents` (`status`);