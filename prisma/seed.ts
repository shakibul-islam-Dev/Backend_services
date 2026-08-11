import "dotenv/config";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import {
  CategoryStatus,
  ProductStatus,
  Role,
  ReviewStatus,
  UserStatus,
} from "../src/generated/prisma/enums";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      username: "admin",
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@example.com",
      username: "demo_user",
      password: userPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and accessories",
      status: CategoryStatus.ACTIVE,
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "wireless-headphones" },
    update: {},
    create: {
      title: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "High-quality noise cancelling wireless headphones.",
      shortDescription: "Noise cancelling headphones",
      quantity: 100,
      stock: 50,
      listPrice: new Prisma.Decimal("199.99"),
      salePrice: new Prisma.Decimal("149.99"),
      status: ProductStatus.ACTIVE,
      sellerId: admin.id,
      categoryId: electronics.id,
    },
  });

  await prisma.review.upsert({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    update: {},
    create: {
      rating: 5,
      title: "Amazing product",
      comment: "Highly recommended!",
      status: ReviewStatus.APPROVED,
      userId: user.id,
      productId: product.id,
    },
  });

  console.log("Seed completed:");
  console.log(`  Admin: admin@example.com / admin123`);
  console.log(`  User:  user@example.com / user123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
