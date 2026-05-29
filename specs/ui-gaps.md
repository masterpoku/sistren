# UI Layout Gaps: docs/references vs src/

> Perbandingan layout, struktur CSS, dan pola komponen antara referensi SPA Vite (`docs/references/`) dan implementasi Next.js App Router (`src/`).

---

## 1. App Shell & Layout Wrapper

### 1.1 Sidebar Implementation

| Aspek | Reference (`docs/references/`) | Aktual (`src/`) |
|-------|-------------------------------|------------------|
| Komponen | `shadcn/ui Sidebar` — `SidebarProvider`, `SidebarInset`, `SidebarTrigger`, `AppSidebar` | Custom `<Sidebar>` — fixed `w-64`, transform-based open/close |
| Collapsible | `collapsible="icon"` — bisa ciut ke icon | Tidak ada mode collapsed/icon — selalu expanded |
| Desktop layout | `SidebarInset` auto-gap via flex | `lg:pl-64` hardcoded pada `<div className="flex flex-1 flex-col lg:pl-64">` |
| Mobile | `Sheet` (shadcn drawer) dari `Sidebar` component | Overlay `div.fixed.inset-0` + hamburger `button.fixed.bottom-4.right-4` |
| CSS framework | `@base-ui/react` (merge-props, use-render) + class-variance-authority | Plain Tailwind + cn() utility |
| Icons | `lucide-react` | `@phosphor-icons/react` |

**Gap:** Reference menggunakan shadcn/ui Sidebar yang mature dengan collapsible, keyboard shortcut (`Ctrl+B`), mobile Sheet, dan gap handling otomatis. Implementasi saat ini adalah custom sidebar tanpa collapsible dan tanpa fitur shadcn sidebar.

### 1.2 Header / Top Bar

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Desktop header | Sticky header dengan breadcrumb, search input `w-[300px]`, bell notification, avatar + user info, separator | **Tidak ada** desktop header — hanya ada mobile header (`lg:hidden`) |
| Breadcrumb | `Breadcrumb` component (SISTREN / currentTab) | Tidak ada breadcrumb |
| Search | Input search "Cari menu..." dengan icon Search | Tidak ada |
| Notifications | Bell icon + red dot badge | Tidak ada |
| User info | Avatar + name + ID + separator | Tidak ada |
| SidebarTrigger | Tombol collapse sidebar | Tidak ada |

**Gap:** Reference memiliki sticky header kaya fitur yang hilang sama sekali di implementasi. Layout app hanya berisi sidebar kiri + main content, tanpa top bar.

### 1.3 Content Padding & Spacing

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Page wrapper | `flex flex-col gap-6 p-4 md:p-6` | `space-y-6` (tanpa padding) |
| H1 sizing | `text-3xl font-bold tracking-tight` | `text-2xl font-bold` |
| H1 container | `flex flex-col gap-2` (eksplisit) | Langsung `<h1>` di dalam `<div>` (sama) |
| Subtitle | `text-muted-foreground` | `text-muted-foreground` (sama) |

**Gap:** Padding halaman (`p-4 md:p-6`) ada di semua halaman reference tapi **tidak ada** di implementasi. Halaman-halaman di `src/` mengandalkan `space-y-6` tanpa padding, sehingga konten menempel ke tepi. Heading juga lebih kecil (`text-2xl` vs `text-3xl`).

---

## 2. Data Display Components

### 2.1 Data Table Pattern

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Table component | `DataTable` — custom wrapper dengan search, export, pagination, checkbox selection | `<Table>` plain dari shadcn/ui |
| Search/filter | Built-in search via `searchKey` prop + Filter button | Tidak ada — tabel mentah |
| Export | `exportFilename` prop untuk download CSV/Excel | Tidak ada |
| Row selection | Checkbox column dengan `getIsAllPageRowsSelected()` | Tidak ada |
| Action column | DropdownMenu (Lihat/Edit/Hapus) | Inline buttons (action via form/server action) |
| Sorting | Column header buttons with `ArrowUpDown` + `column.toggleSorting()` | Tidak ada |

**Gap:** Reference menggunakan `DataTable` component dari `@tanstack/react-table` dengan fitur lengkap. Implementasi menggunakan `<Table>` polos tanpa search, sorting, pagination, atau export. Semua aksi berupa form/submit button langsung.

### 2.2 Card Stat Patterns (Dashboard, Finance, Attendance)

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Stat card header | `CardHeader flex flex-row items-center justify-between space-y-0 pb-2` + icon | `CardHeader pb-2` dengan `CardDescription` sebagai label |
| Stat value | `text-2xl font-bold` | `text-3xl font-bold` |
| Stat description | `text-xs text-muted-foreground` | `text-xs text-muted-foreground` (sama) |
| Grid | `grid gap-4 md:grid-cols-2 lg:grid-cols-4` atau `lg:grid-cols-3` | `grid grid-cols-2 sm:grid-cols-4 gap-4` |

**Gap:** Reference menggunakan pola `CardHeader flex-row` dengan icon di kanan, implementasi menggunakan `CardDescription` di atas `CardTitle`. Layout grid konsisten, tapi reference lebih fleksibel (md:grid-cols-2 lg:grid-cols-4).

---

## 3. Feature-Specific Layout Gaps

### 3.1 Dashboard Page

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Welcome message | `text-3xl font-bold tracking-tight` | `text-2xl font-bold` |
| Subtitle description | Ada | Ada (sama) |
| Alumni banner | Card kuning dengan icon GraduationCap + teks | Tidak ada |
| Charts | Recharts (LineChart, AreaChart, BarChart, ResponsiveContainer) — grafik nilai + chart admin | Tidak ada — hanya stat cards polos |
| Quick action cards | Tidak ada | Grid card link ke Profil, Pembayaran, Pengumuman, dll |
| Activity feed | Timeline items dengan avatar + badge | Tidak ada |
| Schedule display | Timeline items dengan icon Clock, MapPin, badge | Tidak ada |

**Gap:** Dashboard reference kaya dengan chart, activity feed, alumni banner, dan schedule. Dashboard implementasi lebih sederhana — hanya stat cards + quick action links, tanpa visualisasi data.

### 3.2 Finance Page

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Page type | Client component — modal, cards | Server component — form actions + table |
| Summary cards | 3 cards: Total Tagihan (bg-primary), Status Pembayaran, Metode Favorit | Tidak ada summary cards |
| Bills table | Card dengan AlertCircle icon | Tidak ada |
| History table | Card dengan History icon | Tidak ada |
| Payment modal | Xendit-style modal dengan metode payment (VA, QRIS, Retail) | Tidak ada |
| Student finance page | `/finance` — ringkasan siswa | `/finance` — admin panel dengan form + all payments table |
| Admin payment list | `PaymentList.tsx` — DataTable + search/export | `src/app/(app)/payments/page.tsx` — terpisah, table polos |

**Gap:** Reference memiliki halaman keuangan siswa dengan card ringkasan + modal pembayaran Xendit. Implementasi menggabungkan form catat pembayaran admin + tabel semua pembayaran dalam satu halaman, tanpa UI pembayaran siswa.

### 3.3 Academic Page

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Layout | Tabs (KRS, KHS, Transkrip, Jadwal) dengan tabel nilai | Overview stats (class count, major count, subject count) + quick links |
| Table data | `MOCK_COURSES` dengan grade, SKS, IP kumulatif | Tidak ada — hanya link ke halaman manage |
| Search/filter | Search input + Filter button | Tidak ada |
| Download | "Unduh KHS" button | Tidak ada |
| Footer stats | Total SKS + IP Semester (text-xl font-bold) | Tidak ada |

**Gap:** Reference adalah halaman akademik siswa (KRS/KHS). Implementasi adalah admin overview stats. Dua halaman berbeda yang seharusnya ada di route berbeda — reference-nya belum diterjemahkan ke route siswa.

### 3.4 Announcements Page

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Display | Card-style (Card + CardHeader + CardContent per item) | Table-style (Table + rows) |
| Category badge | `Badge variant="outline"` | Kustom `span` dengan `bg-*-100 text-*-800` |
| Actions | Tidak ada (read-only) | Form actions: Publish, Unpublish, Hapus |

**Gap:** Reference menampilkan pengumuman sebagai card. Implementasi menampilkan sebagai tabel dengan action controls — functional gap karena implementasi butuh manageability dari admin.

### 3.5 Profile Page

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Layout | Grid 3 kolom: avatar (h-32 w-32) + info pribadi + detail | Single column max-w-2xl, form-based |
| Avatar | `Avatar` component with fallback + "Ubah Foto Profil" button | Tidak ada — hanya text avatar |
| Info display | Icon + text per field (Mail, Phone, MapPin, etc) | Label + Input fields + Read-only data section |
| Edit mode | "Edit Profil" button → mungkin modal | Inline form with "Simpan Perubahan" |

**Gap:** Reference menampilkan profil sebagai detail view. Implementasi adalah form edit — pendekatan berbeda untuk konteks berbeda.

### 3.6 Login Page

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Animation | `motion.div` with `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` | Tidak ada animasi |
| Icons | `lucide-react` (LogIn, UserPlus, ShieldCheck, GraduationCap, School) | `@phosphor-icons/react` (GraduationCap, ShieldCheck, Student, Warning) |
| Quick login emails | MOCK_ACCOUNTS (superadmin/ admin/ guru/ siswa @ sistren.sch.id) | Real users (@sister.com) |
| Forgot password | Link button "Lupa password?" | Tidak ada |
| Error display | `div.bg-destructive/10.p-3` | `div.flex.items-center.gap-2.bg-destructive/10.p-3` + Warning icon |

**Gap:** Reference memiliki animasi masuk, forgot password link, dan menggunakan lucide-react. Implementasi tanpa animasi, tanpa forgot password, menggunakan phosphor icons.

---

## 4. CSS Class & Style Gaps

### 4.1 Responsive Breakpoint Patterns

| Pattern | Reference | Aktual |
|---------|-----------|--------|
| Padding | `p-4 md:p-6` | Tidak ada |
| Grid columns | `md:grid-cols-2 lg:grid-cols-4` | `sm:grid-cols-4 gap-4` (juga `grid-cols-2 sm:grid-cols-4`) |
| Heading size | `text-3xl` | `text-2xl` |
| Subtitle | `text-muted-foreground` | `text-muted-foreground` |
| Content gap | `gap-6` | `space-y-6` (gap-6 vs space-y-6 = sama, tapi reference bisa gap-x dan gap-y) |

### 4.2 Interactive Elements

| Pattern | Reference | Aktual |
|---------|-----------|--------|
| Button with icon + text | `<Button className="gap-2"><Icon className="h-4 w-4" />Teks</Button>` | `<Button><Icon />Teks</Button>` (tanpa gap-2 eksplisit) |
| Card hover | Tidak ada | `hover:shadow-md transition-shadow` (di dashboard quick links) |
| Sidebar active state | `data-[active=true]:bg-sidebar-accent` (menggunakan shadcn state) | `bg-primary text-primary-foreground` (manual active class) |

### 4.3 Empty States

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Empty data | Tidak konsisten — beberapa halaman tidak handle empty | Konsisten: `{list.length === 0 ? <p>Belum ada...</p> : <Table>...</Table>}` |
| Empty card | Tidak ada | Ada untuk payments: `Card > CardContent.py-8` dengan centered text |

### 4.4 Form Layout

| Aspek | Reference | Aktual |
|-------|-----------|--------|
| Form grid | Tidak ada form di reference (SPA mock) | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` + `space-y-2` per field |
| Label/Input pair | Tidak ada form pattern | `<Label htmlFor="...">` + `<Input id="..." />` + `space-y-2` |

---

## 5. Missing Pages / Features

| Fitur | Reference | Aktual | Status |
|-------|-----------|--------|--------|
| Attendance (Presensi) | `Attendance.tsx` — stat cards + riwayat tabel | Tidak ada | **MISSING** |
| Alumni-specific views | Alumni banner, alumni sidebar styling | Alumni login + transcript only | Sebagian |
| KRS/KHS/Tabs | Academic.tsx — tabs dengan nilai | Hanya admin overview | **MISSING** (student view) |
| Student Finance view | Finance.tsx — card + modal bayar | Hanya admin payment form | **MISSING** (student view) |
| Quick Login (alumni) | 5 akun demo (termasuk alumni) | 4 akun demo (tanpa alumni) | Minor |
| Payment modal (Xendit) | Modal pembayaran dengan metode | Tidak ada | **MISSING** |

---

## 6. Ringkasan Gap Prioritas

### Critical (visual inconsistency)
1. **Tidak ada padding halaman** — semua halaman `space-y-6` tanpa `p-4 md:p-6`, konten menempel ke tepi
2. **Tidak ada desktop header** — breadcrumb, search, notifikasi, user avatar hilang
3. **Sidebar tidak collapsible** — shadcn sidebar vs custom fixed sidebar
4. **Heading size `text-2xl` vs `text-3xl`** — inkonsisten dengan referensi

### High (functional difference)
5. **DataTable tidak ada** — semua tabel tanpa search, sort, filter, export, pagination
6. **Dashboard tanpa chart** — tidak ada visualisasi data (recharts)
7. **Halaman siswa (Academic, Finance) masih admin-only** — KRS/KHS dan ringkasan keuangan siswa belum ada
8. **Attendance (Presensi) belum ada**

### Medium (style inconsistency)
9. **Phosphor Icons vs Lucide Icons** — campuran phosphor dan lucide di beberapa file
10. **Empty state tidak seragam** — beberapa halaman handle empty, beberapa tidak
11. **Form layout pattern** — terkadang gap-4, terkadang space-y-2
12. **Card stat pattern berbeda** — flex-row with icon vs CardDescription + CardTitle

### Low (nice-to-have)
13. **Login tanpa animasi** — motion.div fade-in tidak ada
14. **Login tanpa forgot password** — link hilang
15. **Profile tanpa avatar display** — hanya form input
