ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '0815f0be-4074-4500-8965-af1d57ab1271';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'e3603a2d-210b-4e90-b956-0733d3ecc88e';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '91bd5a1a-bc4d-41a0-954a-9c077387da6d';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'd1bd369c-cf84-4c9f-97b0-05dcb9cf1a70';--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_student_id_semester_id_unique` UNIQUE(`student_id`,`semester_id`);