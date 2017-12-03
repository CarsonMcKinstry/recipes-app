import { registerUser, login } from "../controllers/auth";
import { requireLogin } from "../helpers/passportHelper";
import { celebrate } from "celebrate";
import { Users } from "./validators";

export default (app, passport) => {
  const loginMiddleware = requireLogin(passport);
  const registerUserMiddleware = celebrate(Users.userRegistrationSchema);

  app.post("/register", registerUserMiddleware, registerUser);
  app.post("/login", loginMiddleware, login);
};
