import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({
    profile(params) {
      const name = params.name ? String(params.name).trim() : "";
      return {
        email: String(params.email).trim().toLowerCase(),
        ...(name ? { name } : {}),
      };
    },
  })],
});
