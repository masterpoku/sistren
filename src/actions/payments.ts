'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getPayments, createPayment, updatePayment, markPaymentAsPaid, cancelPayment, deletePayment as deletePaymentQuery } from '@/lib/db/queries'
import { randomBytes } from 'crypto'

export async function fetchPayments(userId?: number, roleId?: number) {
  await verifyPermission('payments.read_any')
  return await getPayments(userId, roleId)
}

export interface CreatePaymentData {
  studentId: number
  description: string
  price: number
  quantity?: number
}

export async function createPaymentRecord(data: CreatePaymentData) {
  await verifyPermission('payments.create')

  const code = `PAY-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`
  const total = data.price * (data.quantity || 1)

  return await createPayment({
    studentId: data.studentId,
    code,
    description: data.description,
    price: data.price.toString(),
    quantity: data.quantity || 1,
    total: total.toString(),
    status: 'draft',
  })
}

export interface UpdatePaymentData {
  id: number
  description?: string
  price?: number
  quantity?: number
  status?: 'draft' | 'pending' | 'paid' | 'cancelled'
}

export async function updatePaymentRecord(data: UpdatePaymentData) {
  await verifyPermission('payments.update')

  const updateFields: Record<string, unknown> = {}
  
  if (data.description !== undefined) updateFields.description = data.description
  if (data.price !== undefined) updateFields.price = data.price.toString()
  if (data.quantity !== undefined) updateFields.quantity = data.quantity
  if (data.status !== undefined) updateFields.status = data.status
  
  if (data.price !== undefined || data.quantity !== undefined) {
    // Recalculate total
    updateFields.total = (data.price || 0) * (data.quantity || 1)
  }

  return await updatePayment(data.id, updateFields)
}

export async function markPaymentAsPaidAction(id: number) {
  await verifyPermission('payments.approve')
  return await markPaymentAsPaid(id)
}

export async function cancelPaymentAction(id: number) {
  await verifyPermission('payments.update')
  return await cancelPayment(id)
}

export async function deletePaymentAction(id: number) {
  await verifyPermission('payments.delete')
  return await deletePaymentQuery(id)
}