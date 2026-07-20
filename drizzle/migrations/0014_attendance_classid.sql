-- Add class_id to attendance for direct class-based filtering (no join needed)

ALTER TABLE `attendance` ADD COLUMN `class_id` BIGINT(20) NOT NULL AFTER `id`;
ALTER TABLE `attendance` ADD INDEX `attendance_class_idx` (`class_id`);
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_class_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

-- Backfill class_id from enrollments for existing rows
UPDATE `attendance` a
  INNER JOIN `enrollments` e ON a.`enrollment_id` = e.`id`
  SET a.`class_id` = e.`class_id`;
