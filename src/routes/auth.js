import {
  registerUser,
  login,
  getResetToken,
  handleResetToken
} from "../controllers/auth";
import { requireLogin } from "../helpers/passportHelper";
import { celebrate } from "celebrate";
import { Users } from "./validators";
import User from "../models/user";

const passwordResetQuery = (req, res, next) => {
  const { email } = req.query;

  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) return res.status(500).send();
    req.user = user || null;
    return next();
  });
};

export default (app, passport) => {
  const loginMiddleware = requireLogin(passport);
  const registerUserMiddleware = celebrate(Users.userRegistrationSchema);
  const passwordResetMiddleware = celebrate(Users.passwordResetSchema);
  const handleResetMiddleware = celebrate(Users.handleResetSchema);

  app.post("/register", registerUserMiddleware, registerUser);
  app.post("/login", loginMiddleware, login);
  app.get(
    "/reset",
    [(passwordResetMiddleware, passwordResetQuery)],
    getResetToken
  );
  app.put("/reset", handleResetMiddleware, handleResetToken);
};
