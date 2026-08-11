import bcrypt from "bcrypt";
import { env } from "../config/env";

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.bcryptSaltRounds);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
