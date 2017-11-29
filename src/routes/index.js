import authRouter from "./auth";
import recipesRouter from "./recipes";
import { requireAuth } from "../helpers/passportHelper";
import { errors } from "celebrate";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);

  authRouter(app, passport);
  recipesRouter(app, passport);

  app.use(errors());

  app.get("/", authMiddleware, (req, res) => {
    res.send("Change me!");
  });
};
