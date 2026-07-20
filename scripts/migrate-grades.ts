import "dotenv/config";
import { createConnection } from "mysql2/promise";

async function migrate() {
  const connection = await createConnection({
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
  });

  console.log("Connected. Recreating grades table...");

  await connection.query("DROP TABLE IF EXISTS grades_old");
  await connection.query("DROP TABLE IF EXISTS grades");

  await connection.query(`
    CREATE TABLE grades (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      student_id varchar(36) NOT NULL,
      class_id bigint(20) NOT NULL,
      semester_id bigint(20) NOT NULL,
      subject_id bigint(20) NOT NULL,
      type enum('knowledge','skill','attitude','extracurricular') NOT NULL,
      daily_test_1 decimal(5,2) DEFAULT NULL,
      daily_test_2 decimal(5,2) DEFAULT NULL,
      daily_test_3 decimal(5,2) DEFAULT NULL,
      daily_test_4 decimal(5,2) DEFAULT NULL,
      midterm decimal(5,2) DEFAULT NULL,
      final_exam decimal(5,2) DEFAULT NULL,
      practical decimal(5,2) DEFAULT NULL,
      project decimal(5,2) DEFAULT NULL,
      portfolio decimal(5,2) DEFAULT NULL,
      teacher_id varchar(36) NOT NULL,
      score decimal(5,2) DEFAULT NULL,
      grade char(2) DEFAULT NULL,
      predicate varchar(20) DEFAULT NULL,
      description text DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      updated_at timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
      deleted_at timestamp NULL DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY grades_sss_unique (student_id,class_id,semester_id,subject_id,type),
      KEY grades_student_idx (student_id),
      KEY grades_class_idx (class_id),
      KEY grades_semester_idx (semester_id),
      CONSTRAINT grades_student_id_fk FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT grades_class_id_fk FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
      CONSTRAINT grades_semester_id_fk FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
      CONSTRAINT grades_subject_id_fk FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
      CONSTRAINT grades_teacher_id_fk FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci
  `);

  console.log("Grades table recreated successfully!");
  await connection.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
