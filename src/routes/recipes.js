import { createRecipe, getRecipes, getRecipe } from "../controllers/recipes";
import { requireAuth } from "../helpers/passportHelper";
import { celebrate, Joi } from "celebrate";
import { Recipes } from "./validators";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);
  const createRecipeMiddleware = celebrate(Recipes.createRecipeSchema);
  const getRecipesMiddleware = celebrate(Recipes.recipesQuerySchema);

  app.post("/recipes", [authMiddleware, createRecipeMiddleware], createRecipe);
  app.get("/recipes", getRecipesMiddleware, getRecipes);
  app.get("/recipes/:recipeId", getRecipe);
};
