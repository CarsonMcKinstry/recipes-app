import { registerUser, login } from "../controllers/auth";
import { requireLogin } from "../helpers/passportHelper";

export default (app, passport) => {
  const loginMiddleware = requireLogin(passport);

  app.post("/register", registerUser);
  app.post("/login", loginMiddleware, login);
};
