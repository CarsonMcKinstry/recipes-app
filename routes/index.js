import authRouter from "./auth";
import { requireAuth } from "../helpers/passportHelper";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);

  authRouter(app, passport);

  app.get("/", authMiddleware, (req, res) => {
    res.send("Change me!");
  });
};
