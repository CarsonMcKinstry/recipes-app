import { Joi } from "celebrate";

export const createRecipeSchema = {
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

export const userRegistrationSchema = {
  body: {
    screenName: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string()
      .email()
      .required()
  }
};
