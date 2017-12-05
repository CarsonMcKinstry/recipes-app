import authRouter from "./auth";
import recipesRouter from "./recipes";
import { errors } from "celebrate";

export default (app, passport) => {
  authRouter(app, passport);
  recipesRouter(app, passport);

  app.use(errors());
};
