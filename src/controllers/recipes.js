import Recipe from "../models/recipe";
import User from "../models/user";
import Ingredient from "../models/ingredient";
import { pick, pipe, get, kebabCase, trim, map } from "lodash/fp";
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

const handleErrors = res => (status, message) => {
  console.log(status);
  console.log(message);
  return res.status(status).send(message);
};

const castQuery = req => {
  const { q, active, userId } = req.query;
  const query = {};

  if (q) {
    query.keywords = { $in: q.split("+") };
  }

  if (userId) {
    query.author._id = userId;
  }

  query.isActive = active === undefined ? true : active;

  return query;
};

export const createRecipe = (req, res) => {
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
      return handleErrors(res)(
        500,
        "Something went wrong while saving your recipe"
      );
    return res.json(recipe);
  });
};

export const editRecipe = (req, res) => {
  const errorHandler = handleErrors(res);
  const { recipeId } = req.params;
  const {
    name,
    description,
    requiredTime,
    ingredients,
    instructions,
    displayImage
  } = req.body;

  const updatedRecipe = {};

  if (name) {
    updatedRecipe.name = trim(name);
    updatedRecipe.normalizedName = pipe([trim, kebabCase])(name);
    updatedRecipe.keywords = keywordExtractor.extract(name, extractorOptions);
  }

  if (description) updatedRecipe.description = description;
  if (requiredTime) updatedRecipe.requiredTime = requiredTime;
  if (ingredients) updatedRecipe.ingredients = ingredients;
  if (instructions) updatedRecipe.instructions = instructions;
  if (displayImage) updatedRecipe.displayImage = displayImage;

  if (ingredients) {
    addToIngredientsList(ingredients);
  }
  Recipe.findByIdAndUpdate(recipeId, updatedRecipe, (err, recipe) => {
    if (err) return errorHandler(500, "");
    if (!recipe || !recipe.isActive)
      return errorHandler(500, "Something went wrong");

    return res.json({
      success: true
    });
  });
};

export const getRecipe = (req, res) => {
  const recipeId = get("params.recipeId")(req);
  Recipe.findById(recipeId, (err, recipe) => {
    if (err) return handleErrors(res)(500, "Something went wrong.");
    if (!recipe || !recipe.isActive) return handleErrors(res)(404, "");
    return res.json(recipe);
  });
};

export const getRecipes = (req, res) => {
  const { limit, p } = req.query;

  const query = castQuery(req);

  Recipe.count({ isActive: query.isActive }, (err, total) => {
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
      .catch(_err => handleErrors(res)());
  });
};

export const recipeOwnershipMiddleware = (req, res, next) => {
  const userId = get("user._id", req);
  const { recipeId } = req.params;

  Recipe.findById(recipeId).then(recipe => {
    if (recipe.author._id.equals(userId)) {
      return next();
    }
    if (!recipe) return handleErrors(res)(404, "Recipe not found");
    return handleErrors(res)(403, "You may not edit someone else's recipe");
  });
};

export const likeRecipe = (req, res) => {
  const likeByUser = pick(["_id", "screenName"])(req.user);

  Recipe.findByIdAndUpdate(
    req.params.recipeId,
    { $addToSet: { likes: likeByUser } },
    { new: true }
  )
    .then(recipe => {
      if (!recipe) throw { status: 404, message: "Recipe not found" };

      const likeByRecipe = pick(["_id", "name"])(recipe);

      return User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { likes: likeByRecipe } },
        { new: true }
      );
    })
    .then(_user => res.json({ success: true, message: "liked recipe" }))
    .catch(
      err => err && handleErrors(res)(err.status || 500, err.message || "")
    );
};

export const dislikeRecipe = (req, res) => {
  const likeByUser = pick(["_id", "screenName"])(req.user);

  Recipe.findByIdAndUpdate(
    req.params.recipeId,
    { $pull: { likes: likeByUser } },
    { new: true }
  )
    .then(recipe => {
      if (!recipe) throw { status: 404, message: "Recipe not found" };
      const likeByRecipe = pick(["_id", "name"])(recipe);

      return User.findByIdAndUpdate(req.user._id, {
        $pull: { likes: likeByRecipe }
      });
    })
    .then(_user => res.json({ success: true, message: "disliked recipe" }))
    .catch(
      err => err && handleErrors(res)(err.status || 500, err.message || "")
    );
};

export const removeRecipe = removal => (req, res) => {
  // expects one recipe
  const recipeId = get("recipeId", req.params);

  Recipe.findByIdAndUpdate(recipeId, { isActive: removal }, { new: true })
    .then(recipe => {
      res.json({
        success: true,
        message: removal
          ? "Recipe moved to the trash"
          : "Recipe taken out of the trash",
        recipe
      });
    })
    .catch(_err => handleErrors(res)(500));
};
