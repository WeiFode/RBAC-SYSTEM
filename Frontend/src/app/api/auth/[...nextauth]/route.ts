import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                try {
                    const response:any = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: credentials.email,
                          password: credentials.password
                        })
                      });

                      if (!response.ok) {
                        return null;
                      }
               
                      const data = await response.json();
                    
                      if (data?.data?.token) {
                        return {
                          id: data.data.user.id.toString(),
                          name: data.data.user.name,
                          email: data.data.user.email,
                          token: data.data.token,
                          user: data.data.user
                        }
                      }
                    return null
                } catch (error) {
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.token
                token.user = user.user
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken
            session.user = token.user as any
            return session
        }
    },
    pages: {
        signIn: '/',
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }