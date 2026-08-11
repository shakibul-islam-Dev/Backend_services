import { Prisma } from "../generated/prisma/client";
import { CategoryStatus } from "../generated/prisma/enums";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, PaginationQuery } from "../utils/pagination";
import { slugify } from "../utils/slugify";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  status?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  status?: string;
}

async function ensureParentExists(parentId?: string): Promise<void> {
  if (!parentId) return;
  const parent = await prisma.category.findFirst({
    where: { id: parentId, isDeleted: false },
  });
  if (!parent) throw ApiError.badRequest("Parent category does not exist");
}

async function ensureUniqueSlug(
  slug: string,
  excludeId?: string
): Promise<void> {
  const existing = await prisma.category.findFirst({
    where: { slug, id: excludeId ? { not: excludeId } : undefined },
  });
  if (existing) throw ApiError.conflict("Category slug already exists");
}

export async function createCategory(input: CreateCategoryInput) {
  const slug = slugify(input.slug ?? input.name);
  await Promise.all([ensureParentExists(input.parentId), ensureUniqueSlug(slug)]);

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      parentId: input.parentId,
      status: (input.status as CategoryStatus | undefined) ?? CategoryStatus.ACTIVE,
    },
  });
}

export async function getCategories(query: PaginationQuery & { parentId?: string }) {
  const { page, limit, skip, take } = getPagination(query);

  const where: Prisma.CategoryWhereInput = {
    isDeleted: false,
    parentId: query.parentId ?? null,
  };

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      include: {
        _count: { select: { children: true, products: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    data: categories,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    include: {
      parent: true,
      children: { where: { isDeleted: false } },
      _count: { select: { products: true } },
    },
  });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategoryById(id);

  const data: Prisma.CategoryUncheckedUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.slug !== undefined) data.slug = slugify(input.slug);
  if (input.description !== undefined) data.description = input.description;
  if (input.parentId !== undefined) data.parentId = input.parentId;
  if (input.status !== undefined) data.status = input.status as CategoryStatus;

  if (data.slug) await ensureUniqueSlug(String(data.slug), id);
  if (input.parentId) {
    await ensureParentExists(input.parentId);
    if (input.parentId === id) {
      throw ApiError.badRequest("A category cannot be its own parent");
    }
  }

  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function softDeleteCategory(id: string) {
  await getCategoryById(id);
  return prisma.category.update({
    where: { id },
    data: { isDeleted: true },
  });
}
