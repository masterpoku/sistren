import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Gets the current session from better-auth.
 * Returns the raw session object where session.user.id is a string UUID.
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
