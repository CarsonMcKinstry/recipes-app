import {
  createRecipe,
  getRecipes,
  getRecipe,
  editRecipe,
  recipeOwnershipMiddleware,
  likeRecipe,
  dislikeRecipe,
  removeRecipe
} from "../controllers/recipes";
import { requireAuth } from "../helpers/passportHelper";
import { celebrate } from "celebrate";
import { Recipes } from "./validators";

export default (app, passport) => {
  const authMiddleware = requireAuth(passport);
  const createRecipeMiddleware = celebrate(Recipes.createRecipeSchema);
  const getRecipesMiddleware = celebrate(Recipes.recipesQuerySchema);
  const editRecipeMiddleware = celebrate(Recipes.editRecipeSchema);

  // create
  app.post("/recipes", [authMiddleware, createRecipeMiddleware], createRecipe);

  //read
  app.get("/recipes", getRecipesMiddleware, getRecipes);
  app.get("/recipes/:recipeId", getRecipe);

  // update
  app.put(
    "/recipes/:recipeId",
    [authMiddleware, recipeOwnershipMiddleware, editRecipeMiddleware],
    editRecipe
  );
  app.put("/recipes/:recipeId/like", authMiddleware, likeRecipe);
  app.put("/recipes/:recipeId/dislike", authMiddleware, dislikeRecipe);

  // delete
  app.delete(
    "/recipes/:recipeId/delete",
    [authMiddleware, recipeOwnershipMiddleware],
    removeRecipe(false)
  );
  app.put(
    "/recipes/:recipeId/undelete",
    [authMiddleware, recipeOwnershipMiddleware],
    removeRecipe(true)
  );
};
