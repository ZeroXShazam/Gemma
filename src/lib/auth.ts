import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const db = new Kysely<Record<string, never>>({
  dialect: new PostgresDialect({ pool }),
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
