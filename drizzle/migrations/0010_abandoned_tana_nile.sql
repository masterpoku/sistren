ALTER TABLE `classes` ADD `major_id` bigint;--> statement-breakpoint
ALTER TABLE `classes` ADD `capacity` int DEFAULT 32;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_major_id_majors_id_fk` FOREIGN KEY (`major_id`) REFERENCES `majors`(`id`) ON DELETE no action ON UPDATE no action;