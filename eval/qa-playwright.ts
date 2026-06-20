import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const ROLES: Record<string, { button: string; pages: string[]; expectGating?: string[] }> = {
  superadmin: {
    button: "Superadmin",
    pages: [
      "/dashboard", "/students", "/teachers", "/users", "/enrollments",
      "/academic", "/academic/classes", "/academic/subjects", "/academic/majors",
      "/academic/semesters", "/academic/grades", "/academic/assignments",
      "/announcements", "/payments", "/payments/methods", "/payments/catalog",
      "/documents", "/attendance", "/finance", "/roles", "/permissions",
      "/admin/users", "/admin/payment-items", "/admin/approvals",
      "/settings", "/settings/school", "/settings/system",
      "/profile", "/boarding", "/calendar",
    ],
  },
  admin: {
    button: "Admin",
    pages: [
      "/dashboard", "/students", "/teachers", "/users", "/enrollments",
      "/academic", "/academic/classes", "/academic/subjects", "/academic/majors",
      "/academic/semesters", "/academic/grades", "/academic/assignments",
      "/announcements", "/payments", "/payments/methods", "/payments/catalog",
      "/documents", "/attendance", "/finance",
      "/admin/users", "/admin/payment-items", "/admin/approvals",
      "/settings", "/settings/school",
      "/profile", "/boarding", "/calendar",
    ],
  },
  guru: {
    button: "Guru",
    pages: [
      "/dashboard", "/students", "/teachers", "/enrollments",
      "/academic", "/academic/classes", "/academic/subjects",
      "/academic/grades", "/academic/assignments",
      "/announcements", "/attendance", "/documents",
      "/profile",
    ],
  },
  siswa: {
    button: "Siswa",
    pages: [
      "/dashboard", "/announcements", "/attendance", "/documents",
      "/enrollments", "/payments", "/boarding",
      "/profile",
    ],
  },
  alumni: {
    button: "Alumni",
    pages: [
      "/dashboard", "/announcements", "/alumni/transcript",
      "/profile",
    ],
    expectGating: ["/students", "/admin/users", "/roles", "/permissions", "/admin/approvals"],
  },
};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const report: Record<string, unknown> = {};

  for (const [roleName, config] of Object.entries(ROLES)) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(10000);

    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (!text.includes("favicon") && !text.includes("Download the React DevTools") && !text.includes("Warning:")) {
          consoleErrors.push(text);
        }
      }
    });

    page.on("response", (resp) => {
      if (resp.status() >= 400) {
        const url = resp.url();
        if (!url.includes("favicon")) {
          networkErrors.push(`${resp.status()} ${url.split("?")[0]}`);
        }
      }
    });

    // Login
    console.log(`Logging in as ${roleName}...`);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    // Click by index within quick-login grid to avoid "PPDB - Pendaftaran Siswa" matching "Siswa"
    const roleMap: Record<string, number> = { Superadmin: 0, Admin: 1, Guru: 2, Siswa: 3, Alumni: 4 };
    const idx = roleMap[config.button] ?? 0;
    await page.locator(".grid.grid-cols-2 button").nth(idx).click();
    await page.waitForTimeout(1500);

    const userText = await page.locator('p:has-text("@")').first().textContent().catch(() => "NOT FOUND");
    report[roleName] = { login: userText, pages: {} as Record<string, unknown>, consoleErrors, networkErrors };
    const results = report[roleName] as { pages: Record<string, unknown> };

    // Test pages
    for (const path of config.pages) {
      try {
        await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 10000 });
        await page.waitForTimeout(500);
      } catch {
        results.pages[path] = { status: "timeout", h1: "N/A", dataStatus: "N/A" };
        continue;
      }

      const body = await page.locator("body").innerText().catch(() => "");
      const h1 = await page.locator("h1").first().textContent().catch(() => "NO H1");
      const hasTable = await page.locator("table").count() > 0;
      const emptyText = await page.locator('text=/baris total|tidak ada|Belum|0 baris|belum ada/i').count() > 0;
      const dataStatus = hasTable ? (emptyText ? "empty" : "has-data") : "no-table";

      let status = "ok";
      if (body.includes("This page could not be found")) status = "404";
      else if (body.includes("Internal Server Error") || body.includes("500")) status = "500";
      else if (body.includes("Akses Ditolak") || body.includes("akses ditolak")) status = "access-denied";

      results.pages[path] = { status, h1: h1?.trim(), dataStatus };
    }

    // Test gating
    if (config.expectGating) {
      for (const path of config.expectGating) {
        try {
          await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 10000 });
          await page.waitForTimeout(500);
        } catch {
          results.pages[path] = { status: "timeout-gating", h1: "N/A", dataStatus: "N/A" };
          continue;
        }
        const body = await page.locator("body").innerText().catch(() => "");
        const h1 = await page.locator("h1").first().textContent().catch(() => "NO H1");
        const blocked = body.includes("Akses Ditolak") || body.includes("akses ditolak");
        results.pages[path] = {
          status: blocked ? "blocked-correct" : "NOT-BLOCKED-FAIL",
          h1: h1?.trim(),
          dataStatus: "N/A",
        };
      }
    }

    // Logout
    try {
      const logoutBtn = page.locator('button:has-text("Logout")');
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        await page.waitForTimeout(500);
      }
    } catch { /* skip */ }

    await context.close();
    console.log(`  ✓ ${roleName}: ${Object.keys(results.pages).length} pages tested`);
  }

  await browser.close();

  // Print report
  console.log("\n\n" + "=".repeat(70));
  console.log("SISTREN QA REPORT");
  console.log("=".repeat(70));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Base URL: ${BASE}\n`);

  let totalPages = 0;
  let totalErrors = 0;
  let totalNetworkErrors = 0;

  for (const [role, data] of Object.entries(report)) {
    const d = data as { login: string; pages: Record<string, { status: string; h1: string; dataStatus: string }>; consoleErrors: string[]; networkErrors: string[] };
    console.log(`\n## ${role.toUpperCase()} (${d.login})`);
    console.log(`Console errors: ${d.consoleErrors.length} | Network errors: ${d.networkErrors.length}`);
    if (d.consoleErrors.length) {
      d.consoleErrors.slice(0, 3).forEach((e) => console.log(`  [ERROR] ${e.substring(0, 150)}`));
    }
    if (d.networkErrors.length) {
      d.networkErrors.slice(0, 3).forEach((e) => console.log(`  [NET] ${e}`));
    }
    console.log("\n  Page                          | H1                           | Status | Data");
    console.log("  ------------------------------|-------------------------------|--------|------");
    for (const [path, info] of Object.entries(d.pages)) {
      const pad = path.padEnd(28).substring(0, 28);
      const h1 = (info.h1 || "NO H1").padEnd(27).substring(0, 27);
      const icon = info.status === "ok" ? "✅" : info.status === "access-denied" ? "🔒" : info.status === "blocked-correct" ? "🔒✅" : info.status === "NOT-BLOCKED-FAIL" ? "🚨" : info.status === "404" ? "❌" : info.status === "500" ? "💥" : "⚠️";
      console.log(`  ${pad} | ${h1} | ${icon} ${info.status.padEnd(6)} | ${info.dataStatus}`);
      if (info.status !== "ok" && info.status !== "blocked-correct" && info.status !== "access-denied") {
        totalErrors++;
      }
    }
    totalPages += Object.keys(d.pages).length;
    totalNetworkErrors += d.networkErrors.length;
  }

  console.log("\n" + "=".repeat(70));
  console.log(`SUMMARY: ${totalPages} pages tested | ${totalErrors} page errors | ${totalNetworkErrors} network errors`);
  console.log("=".repeat(70));
}

run().catch(console.error);
