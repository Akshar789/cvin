import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  subscriptionTier: string;
  onboardingCompleted?: boolean;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
