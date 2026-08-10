import bcrypt from "bcrypt";
import { Pool } from "pg";
import * as jose from "jose";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const handleLogin = async (req: any, res: any) => {
  const { user, pwd } = req.body;

  // Validation Check
  if (!user || !pwd) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  try {
    const foundUser = await prisma.user.findUnique({
      where: { username: user },
    });

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {
      const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
      const secret2 = new TextEncoder().encode(
        process.env.REFRESH_TOKEN_SECRET,
      );

      // Create Access Token
      const accessToken = await new jose.SignJWT({
        username: foundUser.username,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("60s")
        .sign(secret);

      // Create Refresh Token
      const refreshToken = await new jose.SignJWT({
        username: foundUser.username,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(secret2);

      return res.json({
        success: `User ${user} is logged in`,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default handleLogin;
