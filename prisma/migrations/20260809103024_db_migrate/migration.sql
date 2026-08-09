-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users_table" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "phone" TEXT,

    CONSTRAINT "users_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_table" (
    "produt_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "discount_id" INTEGER NOT NULL,
    "list_price" INTEGER NOT NULL,
    "sale_price" INTEGER NOT NULL,
    "currency_type" TEXT NOT NULL,

    CONSTRAINT "products_table_pkey" PRIMARY KEY ("produt_id")
);

-- CreateTable
CREATE TABLE "Orders_table" (
    "order_id" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,
    "order_quitnty" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "time_stamp" TEXT NOT NULL,
    "transact_status" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_table_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "category_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subCategories" BOOLEAN NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "productCategory" (
    "p_category_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "productCategory_pkey" PRIMARY KEY ("p_category_id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "reviews_id" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("reviews_id")
);

-- CreateIndex
CREATE INDEX "users_table_email_username_id_idx" ON "users_table"("email", "username", "id");

-- CreateIndex
CREATE UNIQUE INDEX "users_table_email_username_key" ON "users_table"("email", "username");

-- AddForeignKey
ALTER TABLE "Orders_table" ADD CONSTRAINT "Orders_table_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
