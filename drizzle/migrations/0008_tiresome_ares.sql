ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'e2f366fe-89c9-4d40-a1a5-9048d225ecc3';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '32f90a75-1ed8-4767-a8c3-84818f4014c7';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '668dfeb4-0578-460c-bc30-8c64b7090b3a';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '8d5f75e0-d17e-469e-95e7-3493aee21f39';