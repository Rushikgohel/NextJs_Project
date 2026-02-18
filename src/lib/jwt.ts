import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export const runtime = "nodejs"; // Required if used in API routes

// 🔐 Ensure secret exists (NO fallback secret in production)
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET: string = process.env.JWT_SECRET;

const DEFAULT_ACCESS_EXPIRES: SignOptions["expiresIn"] = "1h";
const DEFAULT_REFRESH_EXPIRES: SignOptions["expiresIn"] = "7d";

export type JwtStandardPayload = JwtPayload & {
  sub: string;
  type?: "access" | "refresh";
};

/**
 * Generic JWT Sign Function
 */
export function signJwt(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = DEFAULT_ACCESS_EXPIRES,
  options?: Omit<SignOptions, "expiresIn">
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    ...options,
  });
}

/**
 * Verify JWT
 */
export function verifyJwt<T = JwtStandardPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    return null;
  }
}

/**
 * Create Access Token
 */
export function createAccessTokenForUser(
  user: { id: string; email?: string },
  expiresIn: SignOptions["expiresIn"] = DEFAULT_ACCESS_EXPIRES
): string {
  const payload: JwtStandardPayload = {
    sub: user.id,
    email: user.email,
    type: "access",
  };

  return signJwt(payload, expiresIn);
}

/**
 * Create Refresh Token
 */
export function createRefreshTokenForUser(
  userId: string,
  expiresIn: SignOptions["expiresIn"] = DEFAULT_REFRESH_EXPIRES
): string {
  const payload: JwtStandardPayload = {
    sub: userId,
    type: "refresh",
  };

  return signJwt(payload, expiresIn);
}
