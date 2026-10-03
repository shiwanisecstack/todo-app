import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST = "smtp.gmail.com", SMTP_PORT = "465", SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS are not set");
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

const COPY = {
  verify: {
    subject: "Your Todo App verification code",
    heading: "Verify your email",
    intro: "Use this code to finish creating your Todo App account.",
  },
  reset: {
    subject: "Your Todo App password reset code",
    heading: "Reset your password",
    intro: "Use this code to reset your Todo App password.",
  },
};

export const sendOtpEmail = async ({ to, name, otp, purpose }) => {
  const c = COPY[purpose];
  const minutes = 10;
  const from = process.env.MAIL_FROM || `"Todo App" <${process.env.SMTP_USER}>`;

  // Always send a plain-text part too: HTML-only mail is a common spam signal.
  const text =
    `Hi ${name || "there"},\n\n${c.intro}\n\nYour code: ${otp}\n\n` +
    `This code expires in ${minutes} minutes. If you didn't request it, you can ignore this email.\n\n- Todo App`;

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#111">
    <h2 style="margin:0 0 12px">${c.heading}</h2>
    <p>Hi ${name || "there"},</p>
    <p>${c.intro}</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:bold;margin:20px 0">${otp}</p>
    <p style="color:#555;font-size:13px">This code expires in ${minutes} minutes. If you didn't request it, you can ignore this email.</p>
  </div>`;

  await getTransporter().sendMail({ from, to, subject: c.subject, text, html });
};
