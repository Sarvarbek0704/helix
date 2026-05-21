import { randomBytes } from 'crypto';
export const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();
export const generateToken = (): string => randomBytes(32).toString('hex');
