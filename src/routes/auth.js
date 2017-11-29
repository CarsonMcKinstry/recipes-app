import { registerUser, login } from "../controllers/auth";
import { requireLogin } from "../helpers/passportHelper";
import { celebrate, Joi, errors } from "celebrate";
import { registerUserSchema } from "./validators";

export default (app, passport) => {
  const loginMiddleware = requireLogin(passport);
  const registerUserMiddleware = celebrate(registerUserSchema);

  app.post("/register", registerUserMiddleware, registerUser);
  app.post("/login", loginMiddleware, login);
};
