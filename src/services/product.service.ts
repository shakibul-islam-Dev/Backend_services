import { ProductStatus, ReviewStatus } from "../generated/prisma/enums";
import prisma, { Prisma, toDecimal } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, PaginationQuery } from "../utils/pagination";
import { slugify } from "../utils/slugify";

export interface CreateProductInput {
  title: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  quantity?: number;
  stock?: number;
  listPrice: number | string;
  salePrice: number | string;
  currency?: string;
  discountPercent?: number | string;
  categoryId: string;
  status?: string;
}

export interface UpdateProductInput {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  quantity?: number;
  stock?: number;
  listPrice?: number | string;
  salePrice?: number | string;
  currency?: string;
  discountPercent?: number | string | null;
  categoryId?: string;
  status?: string;
}

export interface ListProductsQuery extends PaginationQuery {
  categoryId?: string;
  sellerId?: string;
  status?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
}

async function ensureCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, isDeleted: false },
  });
  if (!category) throw ApiError.badRequest("Category does not exist");
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.product.findFirst({
    where: { slug, id: excludeId ? { not: excludeId } : undefined },
  });
  if (existing) throw ApiError.conflict("Product slug already exists");
}

async function ensureProductExists(id: string, withSeller = false) {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
    ...(withSeller ? { select: { id: true, sellerId: true } } : {}),
  });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
}

const approvedReviewFilter = { status: ReviewStatus.APPROVED, isDeleted: false };

export async function createProduct(
  sellerId: string,
  input: CreateProductInput
) {
  const slug = slugify(input.slug ?? input.title);
  await Promise.all([ensureCategoryExists(input.categoryId), ensureUniqueSlug(slug)]);

  return prisma.product.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      quantity: input.quantity ?? 0,
      stock: input.stock ?? 0,
      listPrice: toDecimal(input.listPrice),
      salePrice: toDecimal(input.salePrice),
      currency: input.currency ?? "USD",
      discountPercent:
        input.discountPercent !== undefined
          ? toDecimal(input.discountPercent)
          : null,
      status: (input.status as ProductStatus | undefined) ?? ProductStatus.DRAFT,
      sellerId,
      categoryId: input.categoryId,
    },
    include: {
      category: true,
      seller: { select: { id: true, name: true, username: true } },
    },
  });
}

export async function getProducts(query: ListProductsQuery) {
  const { page, limit, skip, take } = getPagination(query);

  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.sellerId ? { sellerId: query.sellerId } : {}),
    ...(query.status ? { status: query.status as ProductStatus } : {}),
    ...(query.minPrice || query.maxPrice
      ? {
          salePrice: {
            ...(query.minPrice ? { gte: toDecimal(query.minPrice) } : {}),
            ...(query.maxPrice ? { lte: toDecimal(query.maxPrice) } : {}),
          },
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { slug: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: { select: { id: true, name: true, username: true } },
        _count: { select: { reviews: { where: approvedReviewFilter } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  const productIds = products.map((p) => p.id);
  const ratingGroups =
    productIds.length > 0
      ? await prisma.review.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds }, ...approvedReviewFilter },
          _avg: { rating: true },
        })
      : [];

  const ratings = new Map(
    ratingGroups.map((g) => [g.productId, g._avg.rating])
  );

  const data = products.map((product) => ({
    ...product,
    averageRating: ratings.get(product.id) ?? null,
  }));

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
    include: {
      category: true,
      seller: { select: { id: true, name: true, username: true } },
      reviews: {
        where: approvedReviewFilter,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: { where: approvedReviewFilter } } },
    },
  });
  if (!product) throw ApiError.notFound("Product not found");

  const average = await prisma.review.aggregate({
    where: { productId: id, ...approvedReviewFilter },
    _avg: { rating: true },
  });

  return { ...product, averageRating: average._avg.rating };
}

export async function updateProduct(
  id: string,
  actorId: string,
  isAdmin: boolean,
  input: UpdateProductInput
) {
  const existing = await ensureProductExists(id, true);
  if (!isAdmin && existing.sellerId !== actorId) {
    throw ApiError.forbidden("You can only update your own products");
  }

  if (input.categoryId) await ensureCategoryExists(input.categoryId);

  const data: Prisma.ProductUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = slugify(input.slug);
  if (input.description !== undefined) data.description = input.description;
  if (input.shortDescription !== undefined)
    data.shortDescription = input.shortDescription;
  if (input.quantity !== undefined) data.quantity = input.quantity;
  if (input.stock !== undefined) data.stock = input.stock;
  if (input.listPrice !== undefined) data.listPrice = toDecimal(input.listPrice);
  if (input.salePrice !== undefined) data.salePrice = toDecimal(input.salePrice);
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.discountPercent !== undefined)
    data.discountPercent =
      input.discountPercent === null
        ? null
        : toDecimal(input.discountPercent);
  if (input.status !== undefined) data.status = input.status as ProductStatus;
  if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };

  if (data.slug) await ensureUniqueSlug(String(data.slug), id);

  return prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      seller: { select: { id: true, name: true, username: true } },
    },
  });
}

export async function softDeleteProduct(
  id: string,
  actorId: string,
  isAdmin: boolean
) {
  const existing = await ensureProductExists(id, true);
  if (!isAdmin && existing.sellerId !== actorId) {
    throw ApiError.forbidden("You can only delete your own products");
  }
  return prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
}
