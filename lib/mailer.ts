import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular password)
  },
});

export async function sendOtpEmail(to: string, otp: string, name: string) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" style="max-width:480px;background:#111111;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FF6B00,#FF8C33);padding:28px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:rgba(255,255,255,0.2);border-radius:12px;padding:8px 10px;margin-right:12px;">
                  <span style="font-size:20px;">⚡</span>
                </td>
                <td style="padding-left:12px;">
                  <div style="font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.3px;">BYASHARA <span style="opacity:0.75">STORE</span></div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.75);margin-top:1px;">Admin Portal Security</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:#fff;">Your login code</p>
            <p style="margin:0 0 28px;font-size:14px;color:#9CA3AF;">Hi ${name}, use this code to complete your sign-in.</p>

            <!-- OTP box -->
            <div style="background:#1A1A1A;border:1px solid rgba(255,107,0,0.3);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <div style="font-size:42px;font-weight:900;color:#FF6B00;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</div>
              <p style="margin:12px 0 0;font-size:12px;color:#6B7280;">Valid for <strong style="color:#9CA3AF;">5 minutes</strong> · One-time use only</p>
            </div>

            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">
                🔒 <strong style="color:#9CA3AF;">Security notice:</strong> This code was requested for <strong style="color:#9CA3AF;">${to}</strong>.
                If you did not attempt to log in, someone may have your password.
                Change it immediately.
              </p>
            </div>

            <p style="margin:0;font-size:12px;color:#4B5563;text-align:center;">
              Do not share this code with anyone.<br>
              BYASHARA STORE will never ask for this code by phone.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:11px;color:#4B5563;text-align:center;">
              © 2025 BYASHARA STORE · Kigali, Rwanda 🇷🇼
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"BYASHARA STORE Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} — Your BYASHARA STORE login code`,
    html,
  });
}
