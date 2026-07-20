ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '4d2c469e-08de-4b94-85fc-b7261bb5ffe7';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '61337927-077b-44c6-ac43-913a76f04ef3';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '06fc0a0c-4b2d-43cb-83dd-60e25de3fa10';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '27ce03e6-e8e4-464e-aed4-0e49080a2948';