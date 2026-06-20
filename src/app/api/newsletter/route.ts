import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const existing = await db.newsletter.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ message: 'Email already subscribed' })
    }

    await db.newsletter.create({ data: { email } })
    return Response.json({ message: 'Successfully subscribed!' })
  } catch (error) {
    console.error('Newsletter error:', error)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
