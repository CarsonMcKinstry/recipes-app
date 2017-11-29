import { createRecipe, getRecipes, getRecipe } from "../controllers/recipes";
import { requireAuth } from "../helpers/passportHelper";
import { celebrate, Joi } from "celebrate";
import { Recipes } from "./validators";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);
  const createRecipeMiddleware = celebrate(Recipes.createRecipeSchema);

  app.post("/recipes", [authMiddleware, createRecipeMiddleware], createRecipe);
  app.get("/recipes", getRecipes);
  app.get("/recipes/:recipeId", getRecipe);
};
