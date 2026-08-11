import { Prisma } from "../generated/prisma/client";
import { UserStatus } from "../generated/prisma/enums";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { comparePassword, hashPassword } from "../utils/password";
import {
  AuthTokens,
  TokenPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/token";

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  role: true,
  status: true,
  avatar: true,
  phone: true,
  address: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export interface RegisterInput {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

async function generateTokens(payload: TokenPayload): Promise<AuthTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);
  return { accessToken, refreshToken };
}

export async function register(
  input: RegisterInput
): Promise<{ user: Prisma.UserGetPayload<{ select: typeof publicUserSelect }>; tokens: AuthTokens }> {
  const { name, email, username, password, phone, address } = input;
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
    },
  });
  if (existing) {
    throw ApiError.conflict(
      existing.email === normalizedEmail
        ? "Email is already registered"
        : "Username is already taken"
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      phone,
      address,
    },
    select: publicUserSelect,
  });

  const tokens = await generateTokens({ sub: user.id, role: user.role });
  return { user, tokens };
}

export async function login(
  input: LoginInput
): Promise<{ user: Prisma.UserGetPayload<{ select: typeof publicUserSelect }>; tokens: AuthTokens }> {
  const { emailOrUsername, password } = input;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
      isDeleted: false,
    },
  });
  if (!user) {
    throw ApiError.unauthorized("Invalid email/username or password");
  }
  if (user.status === UserStatus.BANNED) {
    throw ApiError.forbidden("Your account has been banned");
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw ApiError.unauthorized("Invalid email/username or password");
  }

  const { password: _omit, ...safeUser } = user;
  const tokens = await generateTokens({ sub: user.id, role: user.role });
  return { user: safeUser, tokens };
}

export async function refreshTokens(
  refreshToken: string
): Promise<{ user: Prisma.UserGetPayload<{ select: typeof publicUserSelect }>; tokens: AuthTokens }> {
  if (!refreshToken) {
    throw ApiError.unauthorized("Refresh token is required");
  }
  let payload: TokenPayload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.sub, isDeleted: false },
    select: publicUserSelect,
  });
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }

  const tokens = await generateTokens({ sub: user.id, role: user.role });
  return { user, tokens };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: publicUserSelect,
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}
