// Rehash passwords to Better Auth's scrypt format
// Run: bun run src/lib/db/rehash-passwords.ts

import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { accounts, users } from "./schema";

async function rehashPasswords() {
  console.log("=== Re-hashing passwords to Better Auth scrypt format ===\n");

  // Get all users
  const userRows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .limit(10);

  console.log(`Found ${userRows.length} users to process\n`);

  for (const row of userRows) {
    console.log(`Processing: ${row.email}`);

    try {
      // Generate new scrypt hash (Better Auth uses this format)
      const newHash = await hashPassword("Password123!");
      console.log(`  New hash: ${newHash.substring(0, 40)}...`);

      // Check if account already exists
      const existing = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.userId, row.id))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(accounts)
          .set({ password: newHash })
          .where(eq(accounts.userId, row.id));
      } else {
        // Insert new
        await db.insert(accounts).values({
          id: crypto.randomUUID(),
          userId: row.id,
          accountId: row.email,
          providerId: "credential",
          password: newHash,
        });
      }

      console.log(`  ✓ Updated successfully`);
    } catch (e: any) {
      console.error(`  ✗ Error: ${e.message}`);
    }
  }

  console.log("\n=== Done ===");
  process.exit(0);
}

rehashPasswords().catch((e) => {
  console.error(e);
  process.exit(1);
});
