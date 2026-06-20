import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("1. Navigating to login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  console.log("   URL:", page.url());
  
  console.log("2. Clicking Siswa button...");
  await page.click('button:has-text("Siswa")');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  console.log("   URL:", page.url());
  
  const body = await page.locator("body").innerText();
  console.log("   Body (first 200 chars):", body.substring(0, 200));
  console.log("   h1:", await page.locator("h1").first().textContent().catch(() => "none"));
  console.log("   Has 'Logout' button:", await page.locator('button:has-text("Logout")').count() > 0);
  
  console.log("\n3. Navigating to /payments...");
  await page.goto("http://localhost:3000/payments", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  console.log("   URL:", page.url());
  
  const body2 = await page.locator("body").innerText();
  console.log("   Body (first 200 chars):", body2.substring(0, 200));
  console.log("   h1:", await page.locator("h1").first().textContent().catch(() => "none"));
  console.log("   Breadcrumb text:", await page.locator("nav[aria-label='breadcrumb']").innerText().catch(() => "none"));
  
  console.log("\n4. Checking cookies...");
  const cookies = await context.cookies();
  console.log("   Cookies:", cookies.map(c => `${c.name}=${c.value.substring(0, 10)}...`).join(", "));

  await browser.close();
}

run().catch(console.error);
