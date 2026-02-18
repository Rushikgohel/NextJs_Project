import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const DEFAULT_ACCESS_EXPIRES = '1h';
const DEFAULT_REFRESH_EXPIRES = '7d';

export type JwtStandardPayload = {
  sub: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
};

export function signJwt(payload: object, expiresIn: string | number = DEFAULT_ACCESS_EXPIRES, options?: Omit<SignOptions, 'expiresIn'>): string {
  const opts: SignOptions = { expiresIn, ...options };
  return jwt.sign(payload, JWT_SECRET, opts);
}

export function verifyJwt<T = JwtStandardPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export function createAccessTokenForUser(user: { id: string; [k: string]: any }, expiresIn: string | number = DEFAULT_ACCESS_EXPIRES): string {
  const payload = { sub: user.id, ...user };
  return signJwt(payload, expiresIn);
}

export function createRefreshTokenForUser(userId: string, expiresIn: string | number = DEFAULT_REFRESH_EXPIRES): string {
  return signJwt({ sub: userId, type: 'refresh' }, expiresIn);
}