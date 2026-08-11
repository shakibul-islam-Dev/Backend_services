import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env";
import { Role } from "../generated/prisma/enums";

export interface TokenPayload {
  sub: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const accessSecret = new TextEncoder().encode(env.accessTokenSecret);
const refreshSecret = new TextEncoder().encode(env.refreshTokenSecret);

async function signToken(
  payload: TokenPayload,
  secret: Uint8Array,
  expiresIn: string
): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return signToken(payload, accessSecret, env.accessTokenExpiresIn);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return signToken(payload, refreshSecret, env.refreshTokenExpiresIn);
}

async function verifyToken(
  token: string,
  secret: Uint8Array
): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  if (typeof payload.sub !== "string" || typeof payload.role !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub, role: payload.role as Role };
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  return verifyToken(token, accessSecret);
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  return verifyToken(token, refreshSecret);
}
