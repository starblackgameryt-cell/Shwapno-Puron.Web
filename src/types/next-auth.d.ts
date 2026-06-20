import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin: boolean
      avatar: string
      phone: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    isAdmin: boolean
    avatar: string
    phone: string
  }
}
