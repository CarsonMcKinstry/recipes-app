import { createRecipe, getAllRecipes } from "../controllers/recipes";
import { requireAuth } from "../helpers/passportHelper";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);

  app.post("/recipes", authMiddleware, createRecipe);
  app.get("/recipes", getAllRecipes);
};
