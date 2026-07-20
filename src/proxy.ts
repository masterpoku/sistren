import { and, eq, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, hasRoleLevel } from "@/lib/auth/permissions";
import {
  PUBLIC_ROUTES,
  ROLE_LEVEL_REQUIREMENTS,
  ROUTE_PERMISSIONS,
} from "@/lib/auth/route-permissions";
import { db } from "@/lib/db";
import { profiles, roles, users } from "@/lib/db/schema";

// Pre-sort routes by length (longest first) so more specific paths match first
const SORTED_ROUTE_ENTRIES = Object.entries(ROUTE_PERMISSIONS).sort(
  ([a], [b]) => b.length - a.length
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Soft-delete check — redirect to /login if user was deactivated
  const [userRecord] = await db
    .select({ deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userRecord && userRecord.deletedAt !== null) {
    await auth.api.signOut({ headers: request.headers });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const minLevel = ROLE_LEVEL_REQUIREMENTS[pathname];
  if (minLevel !== undefined) {
    const hasLevel = await hasRoleLevel(session.user.id, minLevel);
    if (!hasLevel) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  const requiredPermission = SORTED_ROUTE_ENTRIES.find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (requiredPermission) {
    const allowed = await hasPermission(session.user.id, requiredPermission);
    if (!allowed) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Verification gate for siswa — block access until profile is verified
  if (
    pathname !== "/students/pending" &&
    pathname !== "/students/profile/complete" &&
    !pathname.startsWith("/api/")
  ) {
    const [siswaRole] = await db
      .select({ level: roles.level })
      .from(roles)
      .innerJoin(users, eq(users.roleId, roles.id))
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (siswaRole && siswaRole.level === 40) {
      const [profile] = await db
        .select({ verificationStatus: profiles.verificationStatus })
        .from(profiles)
        .where(
          and(eq(profiles.userId, session.user.id), isNull(profiles.deletedAt))
        )
        .limit(1);

      if (profile) {
        const status = profile.verificationStatus;
        if (status === "pending") {
          return NextResponse.redirect(
            new URL("/students/pending", request.url)
          );
        }
        if (status === "draft" || status === "rejected") {
          return NextResponse.redirect(
            new URL("/students/profile/complete", request.url)
          );
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|api/auth|better-auth|css|images|fonts|js).*)",
  ],
};
