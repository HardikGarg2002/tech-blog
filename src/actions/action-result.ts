import { AppError } from "@/lib/errors";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export function actionError(err: unknown): ActionResult<never> {
  if (err instanceof AppError) {
    return { ok: false, error: err.message, code: err.code };
  }
  console.error(err);
  return { ok: false, error: "Something went wrong", code: "INTERNAL" };
}
