ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'b4958235-5caf-4644-8da9-3a3959e47e94';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'c3df042f-72aa-4ff8-9bca-73660983175b';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '3323fe29-da20-43a7-b6b5-8fe1c023404d';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '1311309e-d0b8-46b9-8af7-6c2528a17f76';