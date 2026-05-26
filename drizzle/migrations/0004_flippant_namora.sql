ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '9e34588d-c40f-49f0-af97-9a067e81e221';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '9095f381-8432-4195-aad3-b5cbcb0dbd79';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '5a84a40b-6910-4964-a56c-b400da040791';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '56608a00-cc38-44e1-8095-48786fdf26e4';