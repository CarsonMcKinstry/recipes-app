export const requireLogin = passport =>
  passport.authenticate("local-login", { session: false });

export const requireAuth = passport =>
  passport.authenticate("jwt-login", { session: false });
