import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): Response {
  const body: Record<string, unknown> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}
