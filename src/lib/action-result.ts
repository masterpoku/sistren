/**
 * Centralized action result types and error codes.
 * All server actions return ActionResult<T> for consistent error handling.
 */

import type { ErrorCode } from './errors/codes';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string; code?: ErrorCode };

export function success<T>(data?: T): ActionResult<T> {
  return { success: true, data };
}

export function error(message: string, code?: ErrorCode): ActionResult<never> {
  return { error: message, code };
}
