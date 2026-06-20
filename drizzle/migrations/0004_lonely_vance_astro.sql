ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'c094b023-73c8-4626-9f6e-ab1115a130a6';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '0646f1e6-89c9-4ec3-88a1-2c232b40c640';--> statement-breakpoint
ALTER TABLE `school_documents` MODIFY COLUMN `uploaded_by` varchar(36);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '53b83edc-ea5b-4730-9e56-e1989fe8f1a4';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '5152b277-677e-434b-9584-4649ee672bc1';