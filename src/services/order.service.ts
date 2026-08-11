import { OrderStatus, PaymentStatus, ProductStatus } from "../generated/prisma/enums";
import prisma, { Prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, PaginationQuery } from "../utils/pagination";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateOrderInput {
  status?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

async function getNextOrderNumber(): Promise<number> {
  const last = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (last?.orderNumber ?? 1000) + 1;
}

async function ensureOwnership(
  orderId: string,
  userId: string,
  admin = false
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, isDeleted: false },
    include: { orderItems: true },
  });
  if (!order) throw ApiError.notFound("Order not found");
  if (!admin && order.userId !== userId) {
    throw ApiError.forbidden("You can only access your own orders");
  }
  return order;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const orderNumber = await getNextOrderNumber();

  const items = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const resolved: {
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      title: string;
    }[] = [];

    for (const item of input.items) {
      const product = await tx.product.findFirst({
        where: {
          id: item.productId,
          isDeleted: false,
          status: ProductStatus.ACTIVE,
        },
      });
      if (!product) {
        throw ApiError.badRequest(
          `Product ${item.productId} is not available for purchase`
        );
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for product "${product.title}"`
        );
      }

      const unitPrice = product.salePrice;
      const subtotal = unitPrice.mul(item.quantity);
      resolved.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        title: product.title,
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const totalAmount = resolved.reduce(
      (acc, item) => acc.add(item.subtotal),
      new Prisma.Decimal(0)
    );

    const order = await tx.order.create({
      data: {
        orderNumber,
        totalAmount,
        userId,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        orderItems: {
          create: resolved.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { orderItems: true },
    });

    return { order, titles: resolved.map((i) => i.title) };
  });

  return items;
}

export async function getOrders(
  query: PaginationQuery & { status?: string },
  userId?: string,
  admin = false
) {
  const { page, limit, skip, take } = getPagination(query);

  const where: Prisma.OrderWhereInput = {
    isDeleted: false,
    ...(admin ? {} : { userId }),
    ...(query.status ? { status: query.status as OrderStatus } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    data: orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrderById(id: string, userId: string, admin = false) {
  const order = await ensureOwnership(id, userId, admin);
  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput,
  admin = false
) {
  const order = await ensureOwnership(id, "", admin);
  if (!admin) {
    throw ApiError.forbidden("Only admins can update orders");
  }

  const data: Prisma.OrderUpdateInput = {};
  if (input.status !== undefined) data.status = input.status as OrderStatus;
  if (input.paymentStatus !== undefined)
    data.paymentStatus = input.paymentStatus as PaymentStatus;
  if (input.shippingAddress !== undefined)
    data.shippingAddress = input.shippingAddress;
  if (input.paymentMethod !== undefined) data.paymentMethod = input.paymentMethod;
  if (input.notes !== undefined) data.notes = input.notes;

  return prisma.order.update({
    where: { id: order.id },
    data,
    include: { orderItems: true },
  });
}

export async function cancelOrder(id: string, userId: string, admin = false) {
  const order = await ensureOwnership(id, userId, admin);
  if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED) {
    throw ApiError.badRequest(
      `An order in "${order.status}" status cannot be cancelled`
    );
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    });
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  return prisma.order.findUnique({ where: { id: order.id } });
}

export async function softDeleteOrder(id: string) {
  await ensureOwnership(id, "", true);
  return prisma.order.update({
    where: { id },
    data: { isDeleted: true },
  });
}
