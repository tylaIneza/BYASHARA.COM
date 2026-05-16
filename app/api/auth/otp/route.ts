import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateOtp, storeOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return same error as wrong password to prevent user enumeration
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.role === "SUPER_ADMIN") {
      const otp = generateOtp();
      storeOtp(user.email, otp);
      await sendOtpEmail(user.email, otp, user.name);
      return NextResponse.json({ requiresOtp: true });
    }

    // Regular admin — no OTP needed, let NextAuth handle it
    return NextResponse.json({ requiresOtp: false });
  } catch (err) {
    console.error("[OTP_SEND]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
