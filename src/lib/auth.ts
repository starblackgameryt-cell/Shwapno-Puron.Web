import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { db } from '@/lib/db'

const scryptAsync = promisify(scrypt)

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, key] = hash.split(':')
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
    const keyBuffer = Buffer.from(key, 'hex')
    return timingSafeEqual(derivedKey, keyBuffer)
  } catch {
    return false
  }
}

// Token generation
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Session management
export async function createUserSession(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await db.userSession.create({
    data: { userId, token, expiresAt }
  })
  return token
}

export async function createAdminSession(adminId: string, ipAddress: string, userAgent: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours for admin
  await db.adminSession.create({
    data: { adminId, token, ipAddress, userAgent, expiresAt }
  })
  return token
}

export async function verifyUserSession(token: string) {
  if (!token) return null
  const session = await db.userSession.findUnique({
    where: { token },
    include: { user: true }
  })
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.userSession.delete({ where: { id: session.id } })
    return null
  }
  return session
}

export async function verifyAdminSession(token: string) {
  if (!token) return null
  const session = await db.adminSession.findUnique({
    where: { token },
    include: { admin: true }
  })
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.adminSession.delete({ where: { id: session.id } })
    return null
  }
  return session
}

export async function deleteSession(token: string) {
  try {
    await db.userSession.delete({ where: { token } })
  } catch {}
  try {
    await db.adminSession.delete({ where: { token } })
  } catch {}
}

// Clean expired sessions
export async function cleanExpiredSessions() {
  const now = new Date()
  await db.userSession.deleteMany({ where: { expiresAt: { lt: now } } })
  await db.adminSession.deleteMany({ where: { expiresAt: { lt: now } } })
}

// Password reset
export async function createPasswordReset(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  await db.passwordReset.create({
    data: { userId, token, expiresAt }
  })
  return token
}

// Admin notification
export async function createAdminNotification(type: string, message: string, details: string = '') {
  await db.adminNotification.create({
    data: { type, message, details }
  })
}

// Cookie helpers for server-side
export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return cookies.session_token || cookies.admin_token || null
}

export function getAdminCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return cookies.admin_token || null
}

export function getUserCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return cookies.session_token || null
}

// Helper to get client info from request
export function getClientInfo(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return { ip, userAgent }
}
