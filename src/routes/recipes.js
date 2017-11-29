import { createRecipe, getAllRecipes, getRecipe } from "../controllers/recipes";
import { requireAuth } from "../helpers/passportHelper";
import { celebrate, Joi, errors } from "celebrate";
import { createRecipeSchema } from "./validators";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);
  const createRecipeMiddleware = celebrate(createRecipeSchema);

  app.use(errors());

  app.post("/recipes", [authMiddleware, createRecipeMiddleware], createRecipe);
  app.get("/recipes", getAllRecipes);
  app.get("/recipes/:recipeId", getRecipe);
};
