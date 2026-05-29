ALTER TABLE `teacher_class_subjects` DROP INDEX `teacher_class_subjects_teacher_id_class_id_subject_id_semester_id_unique`;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'c39bd226-5411-4a8e-9d9e-c1d8ae36fe87';--> statement-breakpoint
ALTER TABLE `attachments` MODIFY COLUMN `data` longtext NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '83e57a78-270f-42bd-9305-13f074fa0e1e';--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT 'd5fc6ba6-8591-476a-b25b-644305f896e9';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT '9c97a5e5-f127-45ea-8bfc-122bfde13e4f';--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `ijasah` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `skhun` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `skl` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `akta_kelahiran` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `kk` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `ktp_ayah` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `ktp_ibu` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `kip` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `pass_foto` longtext;--> statement-breakpoint
ALTER TABLE `student_documents` MODIFY COLUMN `rapor` longtext;--> statement-breakpoint
ALTER TABLE `teacher_class_subjects` ADD CONSTRAINT `tcs_unique` UNIQUE(`teacher_id`,`class_id`,`subject_id`,`semester_id`);