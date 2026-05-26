CREATE TABLE `student_documents` (
	`student_id` varchar(36) NOT NULL,
	`ijasah` binary(16777215),
	`skhun` binary(16777215),
	`skl` binary(16777215),
	`akta_kelahiran` binary(16777215),
	`kk` binary(16777215),
	`ktp_ayah` binary(16777215),
	`ktp_ibu` binary(16777215),
	`kip` binary(16777215),
	`pass_foto` binary(16777215),
	`rapor` binary(16777215),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `student_documents_student_id` PRIMARY KEY(`student_id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_class_subjects` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`teacher_id` varchar(36) NOT NULL,
	`class_id` bigint NOT NULL,
	`subject_id` bigint NOT NULL,
	`semester_id` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `teacher_class_subjects_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacher_class_subjects_teacher_id_class_id_subject_id_semester_id_unique` UNIQUE(`teacher_id`,`class_id`,`subject_id`,`semester_id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'df349ae0-e51e-4bea-807a-f1c5001499ad';--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '95c5c908-b541-4813-8fe1-5f9a260616bf';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '5d21baaf-abb4-441d-b2b0-d52cadf47b23';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'ff6a8625-9022-4bf1-8e6c-a7c0b1251254';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` varchar(255);--> statement-breakpoint
ALTER TABLE `user_permissions` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `student_documents` ADD CONSTRAINT `student_documents_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_class_subjects` ADD CONSTRAINT `teacher_class_subjects_teacher_id_users_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_class_subjects` ADD CONSTRAINT `teacher_class_subjects_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_class_subjects` ADD CONSTRAINT `teacher_class_subjects_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_class_subjects` ADD CONSTRAINT `teacher_class_subjects_semester_id_semesters_id_fk` FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE cascade ON UPDATE no action;