/**
 * Route-to-permission mapping for middleware enforcement.
 * Maps Next.js route patterns to required permissions.
 *
 * Usage: Import ROUTE_PERMISSIONS in middleware.ts to check
 * permissions before allowing access to protected routes.
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  // Users Management
  "/admin": "users.manage",
  "/admin/users": "users.manage",
  "/admin/approvals": "users.manage",
  "/permissions": "system_configs.manage",
  "/users": "users.read",
  "/users/create": "users.create",
  "/users/:id/edit": "users.update",
  "/users/:id/delete": "users.delete",

  // Students
  "/alumni": "students.read",
  "/students": "students.read",
  "/students/create": "students.create",
  "/students/:id/edit": "students.update",
  "/students/:id/delete": "students.delete",
  "/students/manage-class": "students.manage_class",
  "/students/:id/graduate": "students.graduate",
  "/students/graduate": "students.graduate",
  "/students/import": "students.import",

  // Teachers
  "/teachers": "teachers.read",
  "/teachers/create": "teachers.create",
  "/teachers/:id/edit": "teachers.update",
  "/teachers/:id/delete": "teachers.delete",
  "/teachers/assign-class": "teachers.assign_class",
  "/teachers/assign-subject": "teachers.assign_subject",

  // Academic
  "/academic": "classes.manage",
  "/academic/classes": "classes.manage",
  "/academic/rpp": "documents.create",
  "/academic/rpp/admin": "documents.review_rpp",
  "/academic/rpp/student": "documents.read",

  "/academic/subjects": "subjects.manage",
  "/academic/semesters": "semesters.manage",

  // Enrollments
  "/enrollments": "enrollments.read",
  "/enrollments/create": "enrollments.create",
  "/enrollments/:id/edit": "enrollments.update",
  "/enrollments/:id/delete": "enrollments.delete",

  // Grades
  "/grades": "grades.read_any",
  "/grades/input": "grades.input",
  "/grades/approve": "grades.approve",
  "/grades/print": "grades.print",

  // Announcements
  "/announcements": "announcements.read",
  "/announcements/create": "announcements.create",
  "/announcements/:id/edit": "announcements.update",
  "/announcements/:id/delete": "announcements.delete",
  "/announcements/publish": "announcements.publish",

  // Payments
  "/finance": "payments.read_any",
  "/payments/catalog": "payments.manage",
  "/payments/create": "payments.create",
  "/payments/:id/edit": "payments.update",
  "/payments/:id/approve": "payments.approve",
  "/payments/report": "payments.generate_report",
  "/payment-methods": "payment_methods.manage",

  // System Config
  "/settings": "system_configs.manage",
  "/settings/school": "system_configs.manage",
  "/settings/system": "system_configs.manage",
  "/system-configs": "system_configs.manage",

  // Profile (own profile is always accessible, edit_own)
  "/profile": "profile.edit_own",
  "/profile/edit": "profile.edit_own",

  // Academic
  "/academic/enrollments": "enrollments.read",
  "/academic/attendance": "attendance.read",

  // Calendar
  "/calendar": "calendar.read",
};

/**
 * Public routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/error",
  "/auth/sign-out",
  "/",
  "/_not-found",
  "/api/health",
  "/absen",
];

/**
 * Routes that require specific minimum role level.
 * Format: route -> minimum level
 */
export const ROLE_LEVEL_REQUIREMENTS: Record<string, number> = {
  "/users": 80, // administrator minimum
  "/academic": 60, // guru minimum
  "/finance": 40, // siswa (40) + admin (80) can view own/all payments
  "/admin": 80, // administrator minimum
  "/admin/users": 80, // administrator minimum
  "/payments/catalog": 80, // administrator minimum
  "/permissions": 100, // superadmin only
  "/settings": 100, // superadmin only
  "/settings/school": 80, // administrator minimum
  "/settings/system": 100, // superadmin only
  "/system-configs": 100, // superadmin only
  "/calendar": 40,
  "/academic/rpp": 60,
  "/academic/rpp/admin": 80,
  "/academic/rpp/student": 40,
  "/alumni": 60,
  "/students/manage-class": 80,
  "/students/profile/complete": 40,
  "/students/pending": 40,
  "/academic/attendance": 40,
};

/**
 * Permission groups for UI rendering decisions.
 */
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    "users.create",
    "users.read",
    "users.update",
    "users.delete",
  ],
  STUDENT_MANAGEMENT: [
    "students.create",
    "students.read",
    "students.update",
    "students.delete",
    "students.manage_class",
    "students.graduate",
    "students.import",
  ],
  TEACHER_MANAGEMENT: [
    "teachers.create",
    "teachers.read",
    "teachers.update",
    "teachers.delete",
    "teachers.assign_class",
    "teachers.assign_subject",
  ],
  ACADEMIC: ["classes.manage", "subjects.manage", "semesters.manage"],
  ENROLLMENTS: [
    "enrollments.create",
    "enrollments.read",
    "enrollments.update",
    "enrollments.delete",
  ],
  GRADES: [
    "grades.input",
    "grades.read_any",
    "grades.read_own",
    "grades.approve",
    "grades.print",
  ],
  ANNOUNCEMENTS: [
    "announcements.create",
    "announcements.read",
    "announcements.update",
    "announcements.delete",
    "announcements.publish",
  ],
  PAYMENTS: [
    "payments.create",
    "payments.read_any",
    "payments.read_own",
    "payments.update",
    "payments.approve",
    "payments.generate_report",
  ],
  CONFIG: ["payment_methods.manage", "system_configs.manage"],
  PROFILE: ["profile.edit_own", "profile.edit_any", "profile.assets.upload"],
  CALENDAR: ["calendar.read", "calendar.manage"],
} as const;
