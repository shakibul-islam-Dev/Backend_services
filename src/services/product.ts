import { Router } from "express";
import prisma from "../lib/prisma";

// Create a new Express Router instance (group of routes for products)
const router = Router();

// POST route to create a new product -> URL: /products
router.post("/products", async (req, res) => {
  try {
    // Grab the product data that the client sends in the request body
    const productData = req.body;

    // Insert the product into the database.
    // "await" is important: prisma.product.create() returns a Promise,
    // so without await we get back a Promise instead of the created product.
    const data = await prisma.product.create({
      data: productData,
    });

    // Send a success response back to the client with the created product
    res.send({
      sucess: true,
      message: "Data Create Suceesfully",
      data: data,
    });
  } catch (err) {
    // If anything goes wrong (e.g. missing fields, DB error), log it
    console.log(err);
    // Also return a proper error status to the client
    res.status(400).send({
      sucess: false,
      message: "Failed to create product",
    });
  }
});

// Export the router so it can be mounted in src/app.ts
export default router;
