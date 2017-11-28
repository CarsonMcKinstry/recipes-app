import Recipe from "../models/recipe";
// import validator from "validator";
import { pick, pipe, get } from "lodash/fp";

const parseUser = user => {
  return pick(["_id", "screenName"])(user);
};

export const createRecipe = (req, res, next) => {
  res.send(parseUser(req.user));
};

export const getAllRecipes = (req, res, next) => {
  Recipe.find({}, (err, recipes) => {
    res.json(recipes);
  });
};
