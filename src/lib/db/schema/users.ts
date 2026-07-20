import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { accounts } from "./accounts";
import { announcementRecipients } from "./announcement_recipients";
import { announcements } from "./announcements";
import { auditLogs } from "./audit_logs";
import { calendarEvents } from "./calendarEvents";
import { enrollments } from "./enrollments";
import { grades } from "./grades";
import { payments } from "./payments";
import { profileAssets } from "./profile_assets";
import { profiles } from "./profiles";
import { roles } from "./roles";
import { sessions } from "./sessions";
import { studentDocuments } from "./studentDocuments";
import { teacherClassSubjects } from "./teacherClassSubjects";
import { userPermissions } from "./user_permissions";

/**
 * Users table — core authentication (Better Auth compatible).
 *
 * Columns:
 * - id: UUID v4 (Better Auth compatible)
 * - email: unique login
 * - emailVerified: boolean flag (Better Auth convention)
 * - password: hashed
 * - role_id: FK to roles
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  roleId: bigint("role_id", { mode: "number" }).references(() => roles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  accounts: many(accounts),
  enrollments: many(enrollments),
  payments: many(payments),
  teacherClassSubjects: many(teacherClassSubjects),
  grades: many(grades),
  announcements: many(announcements),
  calendarEvents: many(calendarEvents),
  auditLogs: many(auditLogs),
  announcementRecipients: many(announcementRecipients),
  sessions: many(sessions),
  userPermissions: many(userPermissions),
  profiles: many(profiles),
  profileAssets: many(profileAssets),
  studentDocuments: many(studentDocuments),
}));
