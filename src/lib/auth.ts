import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const envTrustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...envTrustedOrigins,
  ],
  database: {
    dialect: new PostgresDialect({ pool }),
    type: "postgres",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  plugins: [
    dash(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Your magic link",
          html: `<p>Click <a href="${url}">here</a> to sign in. This link expires in 15 minutes.</p>`,
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
