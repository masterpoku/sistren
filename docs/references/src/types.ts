import * as React from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

export type User = {
  name: string;
  email: string;
  avatar: string;
  role: string;
  studentId: string;
  faculty: string;
  major: string;
};

export type AcademicRecord = {
  semester: string;
  gpa: number;
  credits: number;
};

export type Course = {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: "umum" | "akademik" | "keuangan";
};
