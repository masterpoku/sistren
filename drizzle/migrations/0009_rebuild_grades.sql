-- Rebuild grades table: replace enrollment_id with direct student_id + class_id + semester_id
-- Step 1: Save existing data (if any) into a temp table
SET @has_data = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'grades');

-- Step 2: Drop foreign keys and indexes on grades
SET @drop_fk_enrollment = (SELECT IFNULL(CONCAT('ALTER TABLE grades DROP FOREIGN KEY ', CONSTRAINT_NAME), 'SELECT 1')
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE table_schema = DATABASE() AND table_name = 'grades' AND column_name = 'enrollment_id'
  AND referenced_table_name IS NOT NULL LIMIT 1);
PREPARE stmt FROM @drop_fk_enrollment;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_fk_teacher = (SELECT IFNULL(CONCAT('ALTER TABLE grades DROP FOREIGN KEY ', CONSTRAINT_NAME), 'SELECT 1')
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE table_schema = DATABASE() AND table_name = 'grades' AND column_name = 'teacher_id'
  AND referenced_table_name IS NOT NULL LIMIT 1);
PREPARE stmt FROM @drop_fk_teacher;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_fk_subject = (SELECT IFNULL(CONCAT('ALTER TABLE grades DROP FOREIGN KEY ', CONSTRAINT_NAME), 'SELECT 1')
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE table_schema = DATABASE() AND table_name = 'grades' AND column_name = 'subject_id'
  AND referenced_table_name IS NOT NULL LIMIT 1);
PREPARE stmt FROM @drop_fk_subject;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop indexes
DROP INDEX IF EXISTS `grades_est_unique` ON `grades`;
DROP INDEX IF EXISTS `grades_teacher_idx` ON `grades`;

-- Step 3: Save existing grades data with resolved student_id, class_id, semester_id
RENAME TABLE `grades` TO `grades_old`;

-- Step 4: Create new grades table
CREATE TABLE `grades` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(36) NOT NULL,
  `class_id` bigint(20) NOT NULL,
  `semester_id` bigint(20) NOT NULL,
  `subject_id` bigint(20) NOT NULL,
  `type` enum('knowledge','skill','attitude','extracurricular') NOT NULL,
  `daily_test_1` decimal(5,2) DEFAULT NULL,
  `daily_test_2` decimal(5,2) DEFAULT NULL,
  `daily_test_3` decimal(5,2) DEFAULT NULL,
  `daily_test_4` decimal(5,2) DEFAULT NULL,
  `midterm` decimal(5,2) DEFAULT NULL,
  `final_exam` decimal(5,2) DEFAULT NULL,
  `practical` decimal(5,2) DEFAULT NULL,
  `project` decimal(5,2) DEFAULT NULL,
  `portfolio` decimal(5,2) DEFAULT NULL,
  `teacher_id` varchar(36) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `grade` char(2) DEFAULT NULL,
  `predicate` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grades_sss_unique` (`student_id`,`class_id`,`semester_id`,`subject_id`,`type`),
  KEY `grades_student_idx` (`student_id`),
  KEY `grades_class_idx` (`class_id`),
  KEY `grades_semester_idx` (`semester_id`),
  CONSTRAINT `grades_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `grades_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `grades_semester_id_semesters_id_fk` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `grades_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `grades_teacher_id_users_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Migrate existing data from old table
INSERT INTO `grades` (`student_id`, `class_id`, `semester_id`, `subject_id`, `type`, `daily_test_1`, `daily_test_2`, `daily_test_3`, `daily_test_4`, `midterm`, `final_exam`, `practical`, `project`, `portfolio`, `teacher_id`, `score`, `grade`, `predicate`, `description`, `created_at`, `updated_at`, `deleted_at`)
SELECT
  e.`student_id`,
  e.`class_id`,
  e.`semester_id`,
  g_old.`subject_id`,
  g_old.`type`,
  g_old.`daily_test_1`,
  g_old.`daily_test_2`,
  g_old.`daily_test_3`,
  g_old.`daily_test_4`,
  g_old.`midterm`,
  g_old.`final_exam`,
  g_old.`practical`,
  g_old.`project`,
  g_old.`portfolio`,
  g_old.`teacher_id`,
  g_old.`score`,
  g_old.`grade`,
  g_old.`predicate`,
  g_old.`description`,
  g_old.`created_at`,
  g_old.`updated_at`,
  g_old.`deleted_at`
FROM `grades_old` g_old
INNER JOIN `enrollments` e ON e.`id` = g_old.`enrollment_id`;

-- Step 6: Drop old table
DROP TABLE IF EXISTS `grades_old`;