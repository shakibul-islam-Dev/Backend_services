import { Prisma } from "../generated/prisma/client";
import { Role, UserStatus } from "../generated/prisma/enums";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, PaginationQuery } from "../utils/pagination";
import { publicUserSelect } from "./auth.service";

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserByAdminInput {
  role?: Role;
  status?: UserStatus;
}

export async function getUsers(query: PaginationQuery) {
  const { page, limit, skip, take } = getPagination(query);

  const where: Prisma.UserWhereInput = { isDeleted: false };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: publicUserSelect,
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.username) {
    const normalized = input.username.toLowerCase();
    const conflict = await prisma.user.findFirst({
      where: { username: normalized, id: { not: userId } },
    });
    if (conflict) throw ApiError.conflict("Username is already taken");
    input.username = normalized;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: publicUserSelect,
  });
  return user;
}

export async function updateUserByAdmin(
  id: string,
  input: UpdateUserByAdminInput
) {
  await getUserById(id);
  const user = await prisma.user.update({
    where: { id },
    data: input,
    select: publicUserSelect,
  });
  return user;
}

export async function softDeleteUser(userId: string, admin = false) {
  const target = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
  });
  if (!target) throw ApiError.notFound("User not found");

  if (!admin && target.id !== userId) {
    throw ApiError.forbidden("You can only delete your own account");
  }

  return prisma.user.update({
    where: { id: target.id },
    data: { isDeleted: true },
    select: publicUserSelect,
  });
}
