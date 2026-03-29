export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  NOT_FOUND: (entity: string, id: string) =>
    new AppError("NOT_FOUND", `${entity} not found: ${id}`, 404),
  SLUG_CONFLICT: (slug: string) =>
    new AppError("SLUG_CONFLICT", `Slug already exists: ${slug}`, 409),
  INVALID_INPUT: (msg: string) =>
    new AppError("INVALID_INPUT", msg, 422),
  UPLOAD_REJECTED: (msg: string) =>
    new AppError("UPLOAD_REJECTED", msg, 400),
  UNAUTHORIZED: () =>
    new AppError("UNAUTHORIZED", "Authentication required", 401),
};
