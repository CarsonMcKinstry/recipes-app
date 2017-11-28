import Recipe from "../models/recipe";
import Ingredient from "../models/ingredient";
import {
  pick,
  pipe,
  get,
  kebabCase,
  // length,
  // isArray,
  trim,
  // every,
  map
} from "lodash/fp";
import keywordExtractor from "keyword-extractor";

const extractorOptions = {
  language: "english",
  remove_digits: true,
  return_changed_case: true
};

const parseUser = user => {
  return pick(["_id", "screenName"])(user);
};

const addToIngredientsList = ingredients => {
  const ingredientNames = pipe(
    map(get("name")),
    map(ingredient => new Ingredient({ name: ingredient }))
  )(ingredients);

  Ingredient.insertMany(ingredientNames).catch(err => {
    if (err.code === 11000) {
      console.log("duplicates found");
    } else {
      throw err;
    }
  });
};

export const createRecipe = (req, res) => {
  const recipeFields = [
    "name",
    "requiredTime",
    "ingredients",
    "instructions",
    "displayImage"
  ];
  const { name, requiredTime, ingredients, instructions, displayImage } = pipe([
    get("body"),
    pick(recipeFields)
  ])(req);
  const user = pipe([get("user"), parseUser])(req);
  const recipe = new Recipe({
    name: trim(name),
    normalizedName: pipe([trim, kebabCase])(name),
    author: user,
    requiredTime,
    ingredients,
    instructions: map(trim)(instructions),
    displayImage,
    keywords: keywordExtractor.extract(name, extractorOptions)
  });

  addToIngredientsList(ingredients);

  recipe.save((err, recipe) => {
    if (err) res.status(500).send();
    if (recipe) res.json(recipe);
  });
};

export const getAllRecipes = (req, res) => {
  Recipe.find({}, (err, recipes) => {
    res.json(recipes);
  });
};
