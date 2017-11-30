import { Joi } from "celebrate";

const createRecipeSchema = {
  body: {
    name: Joi.string().required(),
    description: Joi.string(),
    requiredTime: Joi.object().keys({
      prepTime: Joi.number(),
      cookTime: Joi.number()
    }),
    ingredients: Joi.array()
      .items(
        Joi.object().keys({
          amount: Joi.number(),
          measurement: Joi.string(),
          name: Joi.string()
        })
      )
      .required(),
    instructions: Joi.array()
      .items(Joi.string())
      .required(),
    displayImage: Joi.string()
  }
};

const recipesQuerySchema = {
  query: {
    q: Joi.string(),
    p: Joi.number(),
    limit: Joi.number().valid([10, 25, 50])
  }
};

const userRegistrationSchema = {
  body: {
    screenName: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string()
      .email()
      .required()
  }
};

export const Recipes = {
  createRecipeSchema,
  recipesQuerySchema
};

export const Users = {
  userRegistrationSchema
};
