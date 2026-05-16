import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { verifyAndConsumeOtp } from "@/lib/otp-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
        otp:      { label: "OTP",      type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: (credentials.email as string).toLowerCase() },
          });
          if (!user) return null;

          const valid = await bcrypt.compare(credentials.password as string, user.password);
          if (!valid) return null;

          // Super Admin requires a valid OTP
          if (user.role === "SUPER_ADMIN") {
            const otp = (credentials.otp as string | undefined) ?? "";
            if (!otp) return null;
            const otpOk = verifyAndConsumeOtp(user.email, otp);
            if (!otpOk) return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.id = token.sub!;
        u.role = token.role as string;
      }
      return session;
    },
  },
});
