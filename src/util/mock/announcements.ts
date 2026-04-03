export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'umum' | 'akademik' | 'keuangan';
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Libur Awal Puasa',
    content:
      'Diberitahukan kepada seluruh siswa bahwa kegiatan belajar mengajar diliburkan selama 3 hari awal puasa.',
    date: '2026-04-05',
    author: 'Admin TU',
    category: 'umum',
  },
  {
    id: '2',
    title: 'Jadwal Ujian Tengah Semester',
    content:
      'Ujian Tengah Semester (UTS) akan dilaksanakan pada tanggal 15-20 April 2026. Mohon persiapkan diri dengan baik.',
    date: '2026-04-02',
    author: 'Bagian Akademik',
    category: 'akademik',
  },
  {
    id: '3',
    title: 'Pembayaran SPP Bulan April',
    content:
      'Batas akhir pembayaran SPP bulan April adalah tanggal 10 April 2026. Harap segera melakukan pembayaran.',
    date: '2026-04-01',
    author: 'Bagian Keuangan',
    category: 'keuangan',
  },
];
