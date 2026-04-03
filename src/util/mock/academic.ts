export interface AcademicRecord {
  semester: string;
  gpa: number;
  credits: number;
}

export const MOCK_ACADEMIC_RECORDS: AcademicRecord[] = [
  { semester: 'Sem 1', gpa: 3.85, credits: 20 },
  { semester: 'Sem 2', gpa: 3.92, credits: 22 },
  { semester: 'Sem 3', gpa: 3.78, credits: 21 },
  { semester: 'Sem 4', gpa: 3.95, credits: 24 },
  { semester: 'Sem 5', gpa: 3.88, credits: 20 },
];

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

export const MOCK_COURSES: Course[] = [
  {
    id: 'TK101',
    name: 'Pemrograman Dasar',
    credits: 3,
    grade: 'A',
    semester: 'Gasal 2023/2024',
  },
  {
    id: 'TK102',
    name: 'Matematika Diskrit',
    credits: 3,
    grade: 'A-',
    semester: 'Gasal 2023/2024',
  },
  {
    id: 'TK103',
    name: 'Struktur Data',
    credits: 4,
    grade: 'A',
    semester: 'Gasal 2023/2024',
  },
  {
    id: 'TK104',
    name: 'Basis Data',
    credits: 3,
    grade: 'B+',
    semester: 'Gasal 2023/2024',
  },
  {
    id: 'TK105',
    name: 'Jaringan Komputer',
    credits: 3,
    grade: 'A',
    semester: 'Gasal 2023/2024',
  },
];
