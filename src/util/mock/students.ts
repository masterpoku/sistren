export interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  email: string;
  status: 'aktif' | 'non-aktif' | 'lulus';
  joinDate: string;
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Ahmad Fauzi',
    studentId: '2024001',
    class: 'X-TKJ-1',
    email: 'ahmad@siswa.id',
    status: 'aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    studentId: '2024002',
    class: 'X-RPL-2',
    email: 'budi@siswa.id',
    status: 'aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '3',
    name: 'Citra Lestari',
    studentId: '2024003',
    class: 'XI-TKJ-1',
    email: 'citra@siswa.id',
    status: 'aktif',
    joinDate: '2023-07-15',
  },
  {
    id: '4',
    name: 'Dedi Kurniawan',
    studentId: '2024004',
    class: 'XII-RPL-1',
    email: 'dedi@siswa.id',
    status: 'aktif',
    joinDate: '2022-07-15',
  },
  {
    id: '5',
    name: 'Eka Putri',
    studentId: '2024005',
    class: 'X-TKJ-2',
    email: 'eka@siswa.id',
    status: 'non-aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '6',
    name: 'Fajar Ramadhan',
    studentId: '2024006',
    class: 'XI-RPL-1',
    email: 'fajar@siswa.id',
    status: 'aktif',
    joinDate: '2023-07-15',
  },
  {
    id: '7',
    name: 'Gita Permata',
    studentId: '2024007',
    class: 'XII-TKJ-2',
    email: 'gita@siswa.id',
    status: 'lulus',
    joinDate: '2021-07-15',
  },
  {
    id: '8',
    name: 'Hadi Wijaya',
    studentId: '2024008',
    class: 'X-RPL-1',
    email: 'hadi@siswa.id',
    status: 'aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '9',
    name: 'Indah Sari',
    studentId: '2024009',
    class: 'XI-TKJ-2',
    email: 'indah@siswa.id',
    status: 'aktif',
    joinDate: '2023-07-15',
  },
  {
    id: '10',
    name: 'Joko Susilo',
    studentId: '2024010',
    class: 'XII-RPL-2',
    email: 'joko@siswa.id',
    status: 'aktif',
    joinDate: '2022-07-15',
  },
];
