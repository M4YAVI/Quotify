import { query } from "./_generated/server";

// Dummy auth functions since we removed authentication
export const auth = null;
export const signIn = null;
export const signOut = null;
export const store = null;
export const isAuthenticated = null;

export const loggedInUser = query({
  args: {},
  handler: async (ctx) => {
    return null;
  },
});
