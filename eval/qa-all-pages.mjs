import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

const ROLES = {
  superadmin: { button: 'Superadmin', pages: [
    '/dashboard', '/students', '/teachers', '/users', '/enrollments',
    '/academic', '/academic/classes', '/academic/subjects', '/academic/majors',
    '/academic/semesters', '/academic/grades', '/academic/assignments',
    '/announcements', '/payments', '/payments/methods', '/payments/catalog',
    '/documents', '/attendance', '/finance', '/roles', '/permissions',
    '/admin/users', '/admin/payment-items', '/admin/approvals',
    '/settings', '/settings/school', '/settings/system',
    '/profile', '/boarding', '/calendar'
  ]},
  admin: { button: 'Admin', pages: [
    '/dashboard', '/students', '/teachers', '/users', '/enrollments',
    '/academic', '/academic/classes', '/academic/subjects', '/academic/majors',
    '/academic/semesters', '/academic/grades', '/academic/assignments',
    '/announcements', '/payments', '/payments/methods', '/payments/catalog',
    '/documents', '/attendance', '/finance',
    '/admin/users', '/admin/payment-items', '/admin/approvals',
    '/settings', '/settings/school',
    '/profile', '/boarding', '/calendar'
  ]},
  guru: { button: 'Guru', pages: [
    '/dashboard', '/students', '/teachers', '/enrollments',
    '/academic', '/academic/classes', '/academic/subjects',
    '/academic/grades', '/academic/assignments',
    '/announcements', '/attendance', '/documents',
    '/profile'
  ]},
  siswa: { button: 'Siswa', pages: [
    '/dashboard', '/announcements', '/attendance', '/documents',
    '/enrollments', '/payments', '/boarding',
    '/profile'
  ]},
  alumni: { button: 'Alumni', pages: [
    '/dashboard', '/announcements', '/alumni/transcript',
    '/profile',
    // Should be blocked:
    '/students', '/admin/users', '/roles'
  ]}
};

const browser = await chromium.launch({ headless: true });
const results = {};

for (const [roleName, config] of Object.entries(ROLES)) {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console errors and network failures
  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('favicon')) {
      networkErrors.push(`${resp.status()} ${resp.url()}`);
    }
  });

  // Login via quick-login button
  await page.goto(BASE);
  await page.click(`button:has-text("${config.button}")`);
  await page.waitForLoadState('networkidle');
  
  // Verify login
  const userText = await page.locator('p:has-text("@")').first().textContent().catch(() => 'NOT FOUND');
  results[roleName] = { login: userText, pages: {}, consoleErrors: [], networkErrors: [] };

  // Test each page
  for (const path of config.pages) {
    const url = BASE + path;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    
    const h1 = await page.locator('h1').first().textContent().catch(() => 'NO H1');
    const body = await page.locator('body').innerText().catch(() => '');
    
    let status = 'ok';
    if (body.includes('This page could not be found') || body.includes('404')) status = '404';
    else if (body.includes('Internal Server Error') || body.includes('500')) status = '500';
    else if (body.includes('Akses Ditolak')) status = 'access-denied';
    else if (h1 === 'NO H1') status = 'error';
    
    // Check for table rows or empty state
    const hasTable = await page.locator('table').count() > 0;
    const emptyText = await page.locator('text=/baris total|tidak ada|Belum|0 baris/i').count() > 0;
    const dataStatus = hasTable ? (emptyText ? 'empty' : 'has-data') : 'no-table';
    
    results[roleName].pages[path] = { h1: h1?.trim(), status, dataStatus };
  }
  
  // Collect errors after all pages
  results[roleName].consoleErrors = consoleErrors;
  results[roleName].networkErrors = networkErrors;
  
  await context.close();
  console.log(`✓ ${roleName} done`);
}

await browser.close();

// Print report
console.log('\n\n========== SISTREN QA REPORT ==========\n');

for (const [role, data] of Object.entries(results)) {
  console.log(`\n## ${role.toUpperCase()} (${data.login})`);
  console.log(`Console errors: ${data.consoleErrors.length}`);
  if (data.consoleErrors.length) data.consoleErrors.forEach(e => console.log(`  - ${e}`));
  console.log(`Network errors (4xx/5xx): ${data.networkErrors.length}`);
  if (data.networkErrors.length) data.networkErrors.forEach(e => console.log(`  - ${e}`));
  console.log('\n| Page | H1 | Status | Data |');
  console.log('|------|-----|--------|------|');
  for (const [path, info] of Object.entries(data.pages)) {
    console.log(`| ${path} | ${info.h1} | ${info.status} | ${info.dataStatus} |`);
  }
}

console.log('\n========== END REPORT ==========\n');
