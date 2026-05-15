import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Env-var fallback admin (works without a database)
        const envEmail = process.env.ADMIN_EMAIL ?? "admin@byashara.com";
        const envPassword = process.env.ADMIN_PASSWORD ?? "admin@123";
        if (
          credentials.email === envEmail &&
          credentials.password === envPassword
        ) {
          return {
            id: "admin-root",
            email: envEmail,
            name: "Boutique Byashara Admin",
            role: "SUPER_ADMIN",
            vendorId: null,
          };
        }

        // Database lookup
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { vendor: true },
          });
          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password as string, user.password);
          if (!valid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            vendorId: user.vendor?.id ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.vendorId = (user as { vendorId: string | null }).vendorId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.id = token.sub!;
        u.role = token.role as string;
        u.vendorId = token.vendorId as string | null;
      }
      return session;
    },
  },
});
