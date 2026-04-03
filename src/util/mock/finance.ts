export interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  amount: number;
  type: 'SPP' | 'Uang Gedung' | 'Seragam' | 'Lainnya';
  status: 'lunas' | 'belum-lunas' | 'menunggu-konfirmasi';
  date: string;
}

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    studentName: 'Ahmad Fauzi',
    studentId: '2024001',
    amount: 500000,
    type: 'SPP',
    status: 'lunas',
    date: '2024-04-01',
  },
  {
    id: '2',
    studentName: 'Budi Santoso',
    studentId: '2024002',
    amount: 500000,
    type: 'SPP',
    status: 'belum-lunas',
    date: '2024-04-01',
  },
  {
    id: '3',
    studentName: 'Citra Lestari',
    studentId: '2024003',
    amount: 1500000,
    type: 'Uang Gedung',
    status: 'lunas',
    date: '2024-03-15',
  },
  {
    id: '4',
    studentName: 'Dedi Kurniawan',
    studentId: '2024004',
    amount: 750000,
    type: 'Seragam',
    status: 'menunggu-konfirmasi',
    date: '2024-03-20',
  },
  {
    id: '5',
    studentName: 'Eka Putri',
    studentId: '2024005',
    amount: 500000,
    type: 'SPP',
    status: 'lunas',
    date: '2024-04-02',
  },
];
