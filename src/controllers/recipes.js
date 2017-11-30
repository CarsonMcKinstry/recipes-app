import Recipe from "../models/recipe";
import Ingredient from "../models/ingredient";
import {
  pick,
  pipe,
  get,
  kebabCase,
  isArray,
  isString,
  isNumber,
  trim,
  every,
  map,
  isObject
} from "lodash/fp";
import keywordExtractor from "keyword-extractor";
// import { isString } from "util";

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

const handleErrors = res => (status, message) => {
  return res.status(status).send(message);
};

const castQuery = req => {
  const { q } = req.query;
  const query = {};

  if (q) {
    query.keywords = { $in: q.split("+") };
  }

  return query;
};

export const createRecipe = (req, res) => {
  const errorHandler = handleErrors(res);
  const {
    name,
    requiredTime,
    ingredients,
    instructions,
    displayImage,
    description
  } = get("body")(req);
  const user = pipe([get("user"), parseUser])(req);
  const recipe = new Recipe({
    name: trim(name),
    normalizedName: pipe([trim, kebabCase])(name),
    author: user,
    requiredTime,
    ingredients,
    instructions: map(trim)(instructions),
    displayImage,
    description,
    keywords: keywordExtractor.extract(name, extractorOptions)
  });

  addToIngredientsList(ingredients);

  recipe.save((err, recipe) => {
    if (err || !recipe)
      return res
        .status(500)
        .send("Something went wrong while saving your recipe");
    return res.json(recipe);
  });
};

export const getRecipe = (req, res) => {
  const recipeId = get("params.recipeId")(req);
  Recipe.findById(recipeId, (err, recipe) => {
    if (err) return res.status(500).send("Couldn't find that recipe");
    if (!recipe) return res.status(404).send();
    return res.json(recipe);
  });
};

export const getRecipes = (req, res) => {
  const { limit, p } = req.query;

  const query = castQuery(req);

  Recipe.count({}, (err, total) => {
    const checkPage = limit * p < total;

    Recipe.find(query)
      .skip(checkPage && limit * p)
      .limit(limit)
      .then(recipes => {
        return res.json({
          page: checkPage ? query.p + 1 : 0,
          total,
          returned: recipes.length,
          recipes
        });
      })
      .catch(err => console.log(err));
  });
};
