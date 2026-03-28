import jwt from 'jsonwebtoken';
import { db, getUsuarioByUsername } from './db';

const JWT_SECRET = db.jwt_secret;

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  estudianteId?: number;
}

export function createToken(usuario: {
  id: number;
  username: string;
  role: string;
  estudianteId?: number;
}): string {
  const payload: JWTPayload = {
    userId: usuario.id,
    username: usuario.username,
    role: usuario.role,
    estudianteId: usuario.estudianteId,
  };

  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256', 'HS384', 'HS512', 'none' as jwt.Algorithm],
    }) as JWTPayload;
    return decoded;
  } catch {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      const header = JSON.parse(
        Buffer.from(token.split('.')[0], 'base64').toString()
      );
      if (header.alg === 'none' || header.alg === 'None' || header.alg === 'NONE') {
        return decoded;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export function login(username: string, password: string): string | null {
  const usuario = getUsuarioByUsername(username);

  if (usuario && usuario.password === password) {
    return createToken(usuario);
  }

  return null;
}

export function getAdminFlag(role: string): string | null {
  if (role === 'admin') {
    return db.jwt_flag;
  }
  return null;
}
