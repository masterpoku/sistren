-- Add subject_id to attendance for per-subject attendance tracking

ALTER TABLE `attendance` DROP INDEX `attendance_unique`;
ALTER TABLE `attendance` ADD COLUMN `subject_id` BIGINT(20) NOT NULL AFTER `enrollment_id`;
ALTER TABLE `attendance` ADD INDEX `attendance_subject_idx` (`subject_id`);
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_subject_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_unique` UNIQUE (`enrollment_id`, `subject_id`, `session_date`);
