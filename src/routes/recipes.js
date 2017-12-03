import {
  createRecipe,
  getRecipes,
  getRecipe,
  editRecipe,
  recipeOwnershipMiddleware,
  likeRecipe,
  unlikeRecipe
} from "../controllers/recipes";
import { requireAuth } from "../helpers/passportHelper";
import { celebrate } from "celebrate";
import { Recipes } from "./validators";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);
  const createRecipeMiddleware = celebrate(Recipes.createRecipeSchema);
  const getRecipesMiddleware = celebrate(Recipes.recipesQuerySchema);
  const editRecipeMiddleware = celebrate(Recipes.editRecipeSchema);

  app.post("/recipes", [authMiddleware, createRecipeMiddleware], createRecipe);
  app.put(
    "/recipes/:recipeId",
    [authMiddleware, recipeOwnershipMiddleware, editRecipeMiddleware],
    editRecipe
  );
  app.get("/recipes", getRecipesMiddleware, getRecipes);
  app.get("/recipes/:recipeId", getRecipe);

  app.put("/recipes/:recipeId/like", authMiddleware, likeRecipe);
  app.put("/recipes/:recipeId/unlike", authMiddleware, unlikeRecipe);
};
