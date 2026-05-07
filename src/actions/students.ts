'use server'
'use node'

import { verifyAdmin } from '@/lib/auth/verify-session'
import { getStudents, createProfile } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'argon2'

export async function fetchStudents() {
  await verifyAdmin()
  return await getStudents()
}

export interface CreateStudentData {
  email: string
  password: string
  name: string
  nik?: string
  nisn?: string
  birthPlace?: string
  birthDate?: string
  gender?: 'male' | 'female'
  address?: string
  phone?: string
  fatherName?: string
  motherName?: string
  parentsPhone?: string
  religion?: string
}

export async function createStudent(data: CreateStudentData) {
  await verifyAdmin()

  const hashedPassword = await hash(data.password)

  // Insert user
  await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    roleId: 4, // siswa
    confirmed: true,
  })

  // Get the newly created user
  const [newUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  if (newUser) {
    // Create profile
    await createProfile({
      userId: newUser.id,
      name: data.name,
      nik: data.nik || null,
      nisn: data.nisn || null,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender || null,
      address: data.address || null,
      phone: data.phone || null,
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      parentsPhone: data.parentsPhone || null,
      religion: data.religion || null,
    })
  }

  return { success: true, userId: newUser?.id }
}

export interface UpdateStudentData {
  id: number
  name?: string
  nik?: string
  nisn?: string
  birthPlace?: string
  birthDate?: string
  gender?: 'male' | 'female'
  address?: string
  phone?: string
  fatherName?: string
  motherName?: string
  parentsPhone?: string
  religion?: string
}

export async function updateStudent(data: UpdateStudentData) {
  await verifyAdmin()

  const { id, ...profileData } = data

  // Update user name
  if (profileData.name) {
    await db.update(users).set({ name: profileData.name }).where(eq(users.id, id))
  }

  // Update profile
  const { updateProfile } = await import('@/lib/db/queries')
  await updateProfile(id, {
    name: profileData.name,
    nik: profileData.nik,
    nisn: profileData.nisn,
    birthPlace: profileData.birthPlace,
    birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
    gender: profileData.gender,
    address: profileData.address,
    phone: profileData.phone,
    fatherName: profileData.fatherName,
    motherName: profileData.motherName,
    parentsPhone: profileData.parentsPhone,
    religion: profileData.religion,
  })

  return { success: true }
}

export async function deleteStudent(id: number) {
  await verifyAdmin()
  
  // Delete profile first (foreign key)
  const { deleteProfile } = await import('@/lib/db/queries')
  await deleteProfile(id)
  
  // Delete user
  await db.delete(users).where(eq(users.id, id))
  
  return { success: true }
}