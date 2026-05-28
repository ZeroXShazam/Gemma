import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

function authBaseURL() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: authBaseURL(),
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
